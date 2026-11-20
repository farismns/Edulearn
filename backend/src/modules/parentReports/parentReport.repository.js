import { pool } from "../../config/database.js";
import { recordSnapshotSubjectReferences } from "../subjects/subject.snapshot.repository.js";

const mapStudent = (row) => ({
  id: String(row.id),
  fullName: row.full_name,
  educationLevel: row.education_level,
});

const mapSnapshot = (row) => ({
  id: String(row.id),
  parentReportId: String(row.parent_report_id),
  studentId: String(row.student_id),
  reportingMonth: row.reporting_month,
  version: Number(row.version),
  tutorMessage: row.tutor_message,
  snapshotData: row.snapshot_data,
  pdfObjectKey: row.pdf_object_key,
  fileName: row.file_name,
  contentType: row.content_type,
  fileSize: row.file_size === null ? null : Number(row.file_size),
  generatedAt: row.generated_at,
});

export const findStudentForReport = async (userId, studentId, client = pool) => {
  const result = await client.query(
    `SELECT id, full_name, education_level
     FROM edulearn.students
     WHERE user_id = $1 AND id = $2`,
    [userId, studentId],
  );
  return result.rows[0] ? mapStudent(result.rows[0]) : null;
};

export const findEligibleRecords = async ({ userId, studentId, start, endExclusive }, client = pool) => {
  const result = await client.query(
    `SELECT lr.id, sch.student_id, sch.subject_id, sch.subject_name_snapshot,
            sch.scheduled_date, lr.learning_material
     FROM edulearn.learning_records lr
     JOIN edulearn.schedules sch ON sch.id = lr.schedule_id
     WHERE sch.user_id = $1 AND sch.student_id = $2
       AND sch.status = 'Completed'
       AND sch.scheduled_date >= $3::date
       AND sch.scheduled_date < $4::date
     ORDER BY sch.scheduled_date ASC, sch.start_time ASC, lr.id ASC`,
    [userId, studentId, start, endExclusive],
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    studentId: String(row.student_id),
    subjectId: row.subject_id === null ? null : String(row.subject_id),
    subjectName: row.subject_name_snapshot,
    lessonDate: row.scheduled_date,
    learningMaterial: row.learning_material,
  }));
};

export const listSnapshots = async (userId, studentId, client = pool) => {
  const result = await client.query(
    `SELECT prs.id, prs.parent_report_id, pr.student_id, pr.reporting_month,
            prs.version, prs.tutor_message, prs.snapshot_data, prs.pdf_object_key,
            prs.file_name, prs.content_type, prs.file_size, prs.generated_at
     FROM edulearn.parent_report_snapshots prs
     JOIN edulearn.parent_reports pr ON pr.id = prs.parent_report_id
     JOIN edulearn.students st ON st.id = pr.student_id AND st.user_id = $1
     WHERE pr.student_id = $2
     ORDER BY pr.reporting_month DESC, prs.version DESC`,
    [userId, studentId],
  );
  return result.rows.map(mapSnapshot);
};

export const findSnapshotById = async (userId, snapshotId, client = pool) => {
  const result = await client.query(
    `SELECT prs.id, prs.parent_report_id, pr.student_id, pr.reporting_month,
            prs.version, prs.tutor_message, prs.snapshot_data, prs.pdf_object_key,
            prs.file_name, prs.content_type, prs.file_size, prs.generated_at
     FROM edulearn.parent_report_snapshots prs
     JOIN edulearn.parent_reports pr ON pr.id = prs.parent_report_id
     JOIN edulearn.students st ON st.id = pr.student_id AND st.user_id = $1
     WHERE prs.id = $2`,
    [userId, snapshotId],
  );
  return result.rows[0] ? mapSnapshot(result.rows[0]) : null;
};

export const saveSnapshot = async ({ userId, studentId, reportingMonth, tutorMessage, snapshotData, pdf }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const student = await findStudentForReport(userId, studentId, client);
    if (!student) { await client.query("ROLLBACK"); return { notFound: true }; }

    const reportResult = await client.query(
      `INSERT INTO edulearn.parent_reports (student_id, reporting_month)
       VALUES ($1, $2::date)
       ON CONFLICT (student_id, reporting_month)
       DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [studentId, `${reportingMonth}-01`],
    );
    const parentReportId = reportResult.rows[0].id;
    await client.query(
      `SELECT id FROM edulearn.parent_reports WHERE id = $1 FOR UPDATE`,
      [parentReportId],
    );
    const versionResult = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
       FROM edulearn.parent_report_snapshots
       WHERE parent_report_id = $1`,
      [parentReportId],
    );
    const version = Number(versionResult.rows[0].next_version);
    const snapshotResult = await client.query(
      `INSERT INTO edulearn.parent_report_snapshots
         (parent_report_id, version, tutor_message, snapshot_data, pdf_object_key,
          file_name, content_type, file_size, generated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING id, parent_report_id, version, tutor_message, snapshot_data,
                 pdf_object_key, file_name, content_type, file_size, generated_at`,
      [parentReportId, version, tutorMessage, JSON.stringify(snapshotData), pdf.key, pdf.fileName, pdf.contentType, pdf.size],
    );
    const subjectIds = [...new Set(snapshotData.subjects.map((subject) => subject.subjectId).filter(Boolean))];
    await recordSnapshotSubjectReferences({ client, snapshotId: snapshotResult.rows[0].id, userId, subjectIds });
    await client.query("COMMIT");
    return mapSnapshot({ ...snapshotResult.rows[0], student_id: studentId, reporting_month: `${reportingMonth}-01` });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

