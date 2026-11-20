import { pool } from "../../config/database.js";
import { timesOverlap } from "./schedule.policy.js";

const mapSchedule = (row) => ({
  id: String(row.id),
  studentId: String(row.student_id),
  studentName: row.student_name,
  subjectId: row.subject_id === null ? null : String(row.subject_id),
  subjectName: row.subject_name_snapshot,
  scheduledDate: row.scheduled_date,
  startTime: row.start_time,
  endTime: row.end_time,
  notes: row.notes,
  status: row.status,
  hasLearningRecord: Boolean(row.learning_record_id),
  isOverdue: Boolean(row.is_overdue),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const scheduleSelect = `
  SELECT sch.id, sch.student_id, st.full_name AS student_name,
         sch.subject_id, sch.subject_name_snapshot, sch.scheduled_date,
         sch.start_time, sch.end_time, sch.notes, sch.status,
         sch.created_at, sch.updated_at, lr.id AS learning_record_id,
         (sch.status = 'Scheduled' AND
          (sch.scheduled_date < CURRENT_DATE OR
           (sch.scheduled_date = CURRENT_DATE AND sch.end_time < LOCALTIME))) AS is_overdue
  FROM edulearn.schedules sch
  JOIN edulearn.students st ON st.id = sch.student_id AND st.user_id = sch.user_id
  LEFT JOIN edulearn.learning_records lr ON lr.schedule_id = sch.id`;

export const findStudentSubjectForScheduling = async (userId, studentId, subjectId, client = pool) => {
  const result = await client.query(
    `SELECT st.id AS student_id, st.status AS student_status,
            sub.id AS subject_id, sub.status AS subject_status, sub.name AS subject_name
     FROM edulearn.students st
     JOIN edulearn.student_subjects ss
       ON ss.user_id = st.user_id AND ss.student_id = st.id
     JOIN edulearn.subjects sub
       ON sub.user_id = ss.user_id AND sub.id = ss.subject_id
     WHERE st.user_id = $1 AND st.id = $2 AND sub.id = $3`,
    [userId, studentId, subjectId],
  );
  return result.rows[0] || null;
};

export const findScheduleById = async (userId, scheduleId, client = pool) => {
  const result = await client.query(`${scheduleSelect} WHERE sch.user_id = $1 AND sch.id = $2`, [userId, scheduleId]);
  return result.rows[0] ? mapSchedule(result.rows[0]) : null;
};

export const findLearningRecordForSchedule = async (scheduleId, client = pool) => {
  const result = await client.query(
    `SELECT id FROM edulearn.learning_records WHERE schedule_id = $1 LIMIT 1`,
    [scheduleId],
  );
  return result.rows[0] || null;
};

export const findOverlaps = async ({ userId, scheduledDate, startTime, endTime, excludeScheduleId, client = pool }) => {
  const values = [userId, scheduledDate, startTime, endTime];
  const exclusion = excludeScheduleId ? "AND sch.id <> $5" : "";
  if (excludeScheduleId) values.push(excludeScheduleId);
  const result = await client.query(
    `SELECT sch.id, sch.student_id, st.full_name AS student_name,
            sch.subject_name_snapshot, sch.start_time, sch.end_time
     FROM edulearn.schedules sch
     JOIN edulearn.students st ON st.id = sch.student_id AND st.user_id = sch.user_id
     WHERE sch.user_id = $1 AND sch.scheduled_date = $2
       AND sch.status = 'Scheduled'
       AND sch.start_time < $4 AND sch.end_time > $3
       ${exclusion}
     ORDER BY sch.start_time ASC, sch.id ASC`,
    values,
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: row.student_name,
    subjectName: row.subject_name_snapshot,
    startTime: row.start_time,
    endTime: row.end_time,
    overlaps: timesOverlap(startTime, endTime, row.start_time, row.end_time),
  }));
};

export const listSchedules = async ({ userId, tab, search, subjectId, status, page, pageSize, sort }) => {
  const values = [userId];
  const filters = ["sch.user_id = $1"];
  if (tab === "Upcoming") {
    filters.push("sch.scheduled_date >= CURRENT_DATE", "sch.status = 'Scheduled'");
  } else {
    filters.push("(sch.scheduled_date < CURRENT_DATE OR sch.status IN ('Completed', 'Cancelled') OR (sch.status = 'Scheduled' AND sch.scheduled_date = CURRENT_DATE AND sch.end_time < LOCALTIME))");
  }
  if (search) { values.push(`%${search}%`); filters.push(`st.full_name ILIKE $${values.length}`); }
  if (subjectId) { values.push(subjectId); filters.push(`sch.subject_id = $${values.length}`); }
  if (status) { values.push(status); filters.push(`sch.status = $${values.length}`); }
  const direction = sort || (tab === "Upcoming" ? "asc" : "desc");
  const offset = (page - 1) * pageSize;
  values.push(pageSize, offset);
  const result = await pool.query(
    `${scheduleSelect}
     WHERE ${filters.join(" AND ")}
     ORDER BY sch.scheduled_date ${direction.toUpperCase()}, sch.start_time ${direction.toUpperCase()}, sch.id ${direction.toUpperCase()}
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  const countResult = await pool.query(
    `SELECT COUNT(*)::integer AS total FROM edulearn.schedules sch
     JOIN edulearn.students st ON st.id = sch.student_id AND st.user_id = sch.user_id
     WHERE ${filters.join(" AND ")}`,
    values.slice(0, values.length - 2),
  );
  return { items: result.rows.map(mapSchedule), total: countResult.rows[0].total };
};

export const createSchedule = async ({ userId, data, subjectName }) => {
  const result = await pool.query(
    `INSERT INTO edulearn.schedules
       (user_id, student_id, subject_id, subject_name_snapshot, scheduled_date, start_time, end_time, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''))
     RETURNING id`,
    [userId, data.studentId, data.subjectId, subjectName, data.scheduledDate, data.startTime, data.endTime, data.notes],
  );
  return findScheduleById(userId, result.rows[0].id);
};

export const updateSchedule = async ({ userId, scheduleId, data, subjectName }) => {
  const fields = [];
  const values = [];
  const changes = [
    ["student_id", data.studentId], ["subject_id", data.subjectId], ["subject_name_snapshot", subjectName],
    ["scheduled_date", data.scheduledDate], ["start_time", data.startTime], ["end_time", data.endTime], ["notes", data.notes],
  ];
  for (const [field, value] of changes) {
    if (value !== undefined) { values.push(value === "" ? null : value); fields.push(`${field} = $${values.length}`); }
  }
  values.push(userId, scheduleId);
  const result = await pool.query(
    `UPDATE edulearn.schedules SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $${values.length - 1} AND id = $${values.length} AND status = 'Scheduled'
     RETURNING id`,
    values,
  );
  return result.rows[0] ? findScheduleById(userId, result.rows[0].id) : null;
};

export const cancelSchedule = async (userId, scheduleId) => {
  const result = await pool.query(
    `UPDATE edulearn.schedules SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND id = $2 AND status = 'Scheduled'
     RETURNING id`,
    [userId, scheduleId],
  );
  return result.rows[0] ? findScheduleById(userId, result.rows[0].id) : null;
};

export const deleteSchedule = async (userId, scheduleId) => {
  const result = await pool.query(
    `DELETE FROM edulearn.schedules sch
     WHERE sch.user_id = $1 AND sch.id = $2 AND sch.status = 'Scheduled'
       AND NOT EXISTS (SELECT 1 FROM edulearn.learning_records lr WHERE lr.schedule_id = sch.id)
     RETURNING sch.id`,
    [userId, scheduleId],
  );
  return result.rows[0] ? String(result.rows[0].id) : null;
};

