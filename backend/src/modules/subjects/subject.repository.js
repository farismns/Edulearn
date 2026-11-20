import { pool } from "../../config/database.js";
import { getSubjectDeletionBlockReason } from "./subject.deletion.policy.js";

const mapSubject = (row) => ({
  id: String(row.id),
  name: row.name,
  isDefault: row.is_default,
  status: row.status,
  studentCount: Number(row.student_count ?? 0),
  completedLessonCount: Number(row.completed_lesson_count ?? 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listSubjects = async ({ userId, search, status }) => {
  const values = [userId];
  const filters = ["sub.user_id = $1"];
  if (status !== "All") {
    values.push(status);
    filters.push(`sub.status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    filters.push(`sub.name ILIKE $${values.length}`);
  }

  const result = await pool.query(
    `SELECT sub.id, sub.name, sub.is_default, sub.status, sub.created_at, sub.updated_at,
            COUNT(DISTINCT ss.student_id) AS student_count,
            COUNT(DISTINCT sch.id) FILTER (WHERE sch.status = 'Completed') AS completed_lesson_count
     FROM edulearn.subjects sub
     LEFT JOIN edulearn.student_subjects ss
       ON ss.user_id = sub.user_id AND ss.subject_id = sub.id
     LEFT JOIN edulearn.schedules sch
       ON sch.user_id = sub.user_id AND sch.subject_id = sub.id
     WHERE ${filters.join(" AND ")}
     GROUP BY sub.id
     ORDER BY sub.name ASC, sub.id ASC`,
    values,
  );
  return result.rows.map(mapSubject);
};

export const findSubjectById = async (userId, subjectId, client = pool) => {
  const result = await client.query(
    `SELECT sub.id, sub.name, sub.is_default, sub.status, sub.created_at, sub.updated_at,
            COUNT(DISTINCT ss.student_id) AS student_count,
            COUNT(DISTINCT sch.id) FILTER (WHERE sch.status = 'Completed') AS completed_lesson_count
     FROM edulearn.subjects sub
     LEFT JOIN edulearn.student_subjects ss
       ON ss.user_id = sub.user_id AND ss.subject_id = sub.id
     LEFT JOIN edulearn.schedules sch
       ON sch.user_id = sub.user_id AND sch.subject_id = sub.id
     WHERE sub.user_id = $1 AND sub.id = $2
     GROUP BY sub.id`,
    [userId, subjectId],
  );
  return result.rows[0] ? mapSubject(result.rows[0]) : null;
};

export const createSubject = async (userId, name) => {
  const result = await pool.query(
    `INSERT INTO edulearn.subjects (user_id, name, is_default)
     VALUES ($1, $2, FALSE)
     RETURNING id, name, is_default, status, created_at, updated_at`,
    [userId, name],
  );
  return mapSubject(result.rows[0]);
};

export const renameSubject = async (userId, subjectId, name) => {
  const result = await pool.query(
    `UPDATE edulearn.subjects
     SET name = $1, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2 AND id = $3 AND is_default = FALSE
     RETURNING id, name, is_default, status, created_at, updated_at`,
    [name, userId, subjectId],
  );
  return result.rows[0] ? mapSubject(result.rows[0]) : null;
};

export const setSubjectStatus = async (userId, subjectId, status) => {
  const result = await pool.query(
    `UPDATE edulearn.subjects
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2 AND id = $3
     RETURNING id, name, is_default, status, created_at, updated_at`,
    [status, userId, subjectId],
  );
  return result.rows[0] ? mapSubject(result.rows[0]) : null;
};

export const getDeletionAnalysis = async (userId, subjectId, client) => {
  const subject = await findSubjectById(userId, subjectId, client);
  if (!subject) return null;

  const [scheduleResult, affectedStudentsResult, snapshotResult, untrackedSnapshotResult] = await Promise.all([
    client.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Completed') AS completed_count,
         COUNT(*) FILTER (WHERE status = 'Scheduled') AS active_schedule_count
       FROM edulearn.schedules
       WHERE user_id = $1 AND subject_id = $2`,
      [userId, subjectId],
    ),
    client.query(
      `SELECT DISTINCT st.id, st.full_name
       FROM edulearn.student_subjects ss
       JOIN edulearn.students st
         ON st.user_id = ss.user_id AND st.id = ss.student_id
       WHERE ss.user_id = $1 AND ss.subject_id = $2
       ORDER BY st.full_name ASC, st.id ASC`,
      [userId, subjectId],
    ),
    // Snapshot references are independent of current student assignments.
    client.query(
      `SELECT COUNT(DISTINCT pss.snapshot_id) AS snapshot_count
       FROM edulearn.parent_report_snapshot_subjects pss
       JOIN edulearn.subjects sub ON sub.id = pss.subject_id
       WHERE sub.user_id = $1 AND pss.subject_id = $2`,
      [userId, subjectId],
    ),
    client.query(
      `SELECT COUNT(*) AS untracked_snapshot_count
       FROM edulearn.parent_report_snapshots prs
       JOIN edulearn.parent_reports pr ON pr.id = prs.parent_report_id
       JOIN edulearn.students st ON st.id = pr.student_id AND st.user_id = $1
       LEFT JOIN edulearn.parent_report_snapshot_subjects pss
         ON pss.snapshot_id = prs.id
       WHERE pss.snapshot_id IS NULL`,
      [userId],
    ),
  ]);

  return {
    subject,
    completedLessonCount: Number(scheduleResult.rows[0].completed_count),
    activeScheduleCount: Number(scheduleResult.rows[0].active_schedule_count),
    snapshotReferenceCount: Number(snapshotResult.rows[0].snapshot_count),
    untrackedSnapshotCount: Number(untrackedSnapshotResult.rows[0].untracked_snapshot_count),
    affectedStudents: affectedStudentsResult.rows.map((row) => ({ id: String(row.id), fullName: row.full_name })),
  };
};

export const deleteSubject = async ({ userId, subjectId, confirm }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const analysis = await getDeletionAnalysis(userId, subjectId, client);
    if (!analysis) { await client.query("ROLLBACK"); return { notFound: true }; }
    if (analysis.subject.isDefault) { await client.query("ROLLBACK"); return { defaultSubject: true, analysis }; }
    if (getSubjectDeletionBlockReason(analysis)) {
      await client.query("ROLLBACK");
      return { restricted: true, analysis };
    }
    if (analysis.affectedStudents.length > 0 && !confirm) {
      await client.query("ROLLBACK");
      return { needsConfirmation: true, analysis };
    }

    await client.query(`DELETE FROM edulearn.student_subjects WHERE user_id = $1 AND subject_id = $2`, [userId, subjectId]);
    await client.query(`DELETE FROM edulearn.subjects WHERE user_id = $1 AND id = $2 AND is_default = FALSE`, [userId, subjectId]);
    await client.query("COMMIT");
    return { deleted: true, analysis };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { mapSubject };

