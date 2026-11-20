import { pool } from "../../config/database.js";

const mapRecord = (row) => ({
  id: String(row.id),
  scheduleId: String(row.schedule_id),
  studentId: String(row.student_id),
  studentName: row.student_name,
  subjectId: row.subject_id === null ? null : String(row.subject_id),
  subjectName: row.subject_name_snapshot,
  lessonDate: row.scheduled_date,
  learningMaterial: row.learning_material,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const recordSelect = `
  SELECT lr.id, lr.schedule_id, sch.student_id, st.full_name AS student_name,
         sch.subject_id, sch.subject_name_snapshot, sch.scheduled_date,
         lr.learning_material, lr.notes, lr.created_at, lr.updated_at
  FROM edulearn.learning_records lr
  JOIN edulearn.schedules sch ON sch.id = lr.schedule_id
  JOIN edulearn.students st ON st.id = sch.student_id AND st.user_id = sch.user_id`;

export const findRecordById = async (userId, recordId, client = pool) => {
  const result = await client.query(
    `${recordSelect} WHERE sch.user_id = $1 AND lr.id = $2`,
    [userId, recordId],
  );
  return result.rows[0] ? mapRecord(result.rows[0]) : null;
};

export const listRecords = async ({ userId, search, studentId, subjectId, fromDate, toDate, page, pageSize, sort }) => {
  const values = [userId];
  const filters = ["sch.user_id = $1"];
  if (search) { values.push(`%${search}%`); filters.push(`(st.full_name ILIKE $${values.length} OR lr.learning_material ILIKE $${values.length})`); }
  if (studentId) { values.push(studentId); filters.push(`sch.student_id = $${values.length}`); }
  if (subjectId) { values.push(subjectId); filters.push(`sch.subject_id = $${values.length}`); }
  if (fromDate) { values.push(fromDate); filters.push(`sch.scheduled_date >= $${values.length}`); }
  if (toDate) { values.push(toDate); filters.push(`sch.scheduled_date <= $${values.length}`); }
  const direction = sort.toUpperCase();
  const offset = (page - 1) * pageSize;
  values.push(pageSize, offset);
  const result = await pool.query(
    `${recordSelect}
     WHERE ${filters.join(" AND ")}
     ORDER BY sch.scheduled_date ${direction}, sch.start_time ${direction}, lr.id ${direction}
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  const countResult = await pool.query(
    `SELECT COUNT(*)::integer AS total
     FROM edulearn.learning_records lr
     JOIN edulearn.schedules sch ON sch.id = lr.schedule_id
     JOIN edulearn.students st ON st.id = sch.student_id AND st.user_id = sch.user_id
     WHERE ${filters.join(" AND ")}`,
    values.slice(0, values.length - 2),
  );
  return { items: result.rows.map(mapRecord), total: Number(countResult.rows[0].total) };
};

export const createFromSchedule = async ({ userId, scheduleId, learningMaterial, notes }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const scheduleResult = await client.query(
      `SELECT sch.id, sch.student_id, st.full_name AS student_name,
              sch.subject_id, sch.subject_name_snapshot, sch.scheduled_date,
              sch.status, lr.id AS learning_record_id
       FROM edulearn.schedules sch
       JOIN edulearn.students st ON st.id = sch.student_id AND st.user_id = sch.user_id
       LEFT JOIN edulearn.learning_records lr ON lr.schedule_id = sch.id
       WHERE sch.user_id = $1 AND sch.id = $2
       FOR UPDATE OF sch`,
      [userId, scheduleId],
    );
    if (scheduleResult.rowCount === 0) { await client.query("ROLLBACK"); return { notFound: true }; }
    const schedule = scheduleResult.rows[0];
    if (schedule.status !== "Scheduled") { await client.query("ROLLBACK"); return { invalidStatus: true }; }
    if (schedule.learning_record_id) { await client.query("ROLLBACK"); return { duplicate: true }; }

    const recordResult = await client.query(
      `INSERT INTO edulearn.learning_records (schedule_id, learning_material, notes)
       VALUES ($1, $2, NULLIF($3, ''))
       RETURNING id, created_at, updated_at`,
      [schedule.id, learningMaterial, notes],
    );
    const statusResult = await client.query(
      `UPDATE edulearn.schedules
       SET status = 'Completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status = 'Scheduled'
       RETURNING id`,
      [schedule.id, userId],
    );
    if (statusResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      return { transitionFailed: true };
    }
    await client.query("COMMIT");
    return mapRecord({
      ...schedule,
      id: recordResult.rows[0].id,
      schedule_id: schedule.id,
      learning_material: learningMaterial,
      notes: notes || null,
      created_at: recordResult.rows[0].created_at,
      updated_at: recordResult.rows[0].updated_at,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateRecord = async ({ userId, recordId, learningMaterial, notes }) => {
  const values = [learningMaterial, notes, userId, recordId];
  const result = await pool.query(
    `UPDATE edulearn.learning_records lr
     SET learning_material = COALESCE($1, lr.learning_material),
         notes = CASE WHEN $2::text IS NULL THEN lr.notes ELSE NULLIF($2, '') END,
         updated_at = CURRENT_TIMESTAMP
     FROM edulearn.schedules sch
     WHERE sch.id = lr.schedule_id AND sch.user_id = $3 AND lr.id = $4
     RETURNING lr.id`,
    values,
  );
  return result.rows[0] ? findRecordById(userId, recordId) : null;
};

