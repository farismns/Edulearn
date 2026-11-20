import { pool } from "../../config/database.js";

const studentFields = `
  s.id, s.full_name, s.education_level, s.student_contact,
  s.guardian_name, s.guardian_whatsapp, s.avatar, s.status,
  s.archived_at, s.created_at, s.updated_at
`;
const returningStudentFields = `
  id, full_name, education_level, student_contact,
  guardian_name, guardian_whatsapp, avatar, status,
  archived_at, created_at, updated_at
`;

const mapStudent = (row) => ({
  id: String(row.id),
  fullName: row.full_name,
  educationLevel: row.education_level,
  studentContact: row.student_contact,
  guardianName: row.guardian_name,
  guardianWhatsapp: row.guardian_whatsapp,
  avatar: row.avatar,
  status: row.status,
  archivedAt: row.archived_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listStudents = async ({ userId, status, search, page, pageSize }) => {
  const values = [userId, status];
  let searchClause = "";
  if (search) {
    values.push(`%${search}%`);
    searchClause = `AND s.full_name ILIKE $${values.length}`;
  }
  const offset = (page - 1) * pageSize;
  values.push(pageSize, offset);

  const result = await pool.query(
    `SELECT ${studentFields}, COUNT(*) OVER() AS total_count
     FROM edulearn.students s
     WHERE s.user_id = $1 AND s.status = $2 ${searchClause}
     ORDER BY s.full_name ASC, s.id ASC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  return {
    items: result.rows.map(mapStudent),
    total: result.rows[0] ? Number(result.rows[0].total_count) : 0,
  };
};

export const findStudentById = async (userId, studentId, client = pool) => {
  const result = await client.query(
    `SELECT ${studentFields}
     FROM edulearn.students s
     WHERE s.user_id = $1 AND s.id = $2`,
    [userId, studentId],
  );
  return result.rows[0] ? mapStudent(result.rows[0]) : null;
};

export const findSubjectsForStudent = async (userId, studentId, client = pool) => {
  const result = await client.query(
    `SELECT sub.id, sub.name, sub.status
     FROM edulearn.student_subjects ss
     JOIN edulearn.subjects sub ON sub.id = ss.subject_id AND sub.user_id = ss.user_id
     WHERE ss.user_id = $1 AND ss.student_id = $2
     ORDER BY sub.name ASC, sub.id ASC`,
    [userId, studentId],
  );
  return result.rows.map((row) => ({ id: String(row.id), name: row.name, status: row.status }));
};

export const findActiveSubjects = async (userId, subjectIds, client = pool) => {
  const result = await client.query(
    `SELECT id FROM edulearn.subjects
     WHERE user_id = $1 AND status = 'Active' AND id = ANY($2::bigint[])`,
    [userId, subjectIds],
  );
  return result.rows.map((row) => String(row.id));
};

export const createStudent = async ({ userId, data, subjectIds }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const subjectRows = await findActiveSubjects(userId, subjectIds, client);
    if (subjectRows.length !== subjectIds.length) {
      await client.query("ROLLBACK");
      return { invalidSubjects: true };
    }
    const studentResult = await client.query(
      `INSERT INTO edulearn.students
       (user_id, full_name, education_level, student_contact, guardian_name, guardian_whatsapp, avatar)
       VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''), NULLIF($6, ''), $7)
       RETURNING ${returningStudentFields}`,
      [userId, data.fullName, data.educationLevel, data.studentContact, data.guardianName, data.guardianWhatsapp, data.avatar],
    );
    const student = studentResult.rows[0];
    await client.query(
      `INSERT INTO edulearn.student_subjects (user_id, student_id, subject_id)
       SELECT $1, $2, unnest($3::bigint[])`,
      [userId, student.id, subjectRows],
    );
    await client.query("COMMIT");
    return { student: mapStudent(student), subjects: await findSubjectsForStudent(userId, student.id) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateStudent = async ({ userId, studentId, data, subjectIds }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await findStudentById(userId, studentId, client);
    if (!existing) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }
    if (subjectIds) {
      const validSubjects = await findActiveSubjects(userId, subjectIds, client);
      if (validSubjects.length !== subjectIds.length) {
        await client.query("ROLLBACK");
        return { invalidSubjects: true };
      }
    }
    const fields = [];
    const values = [];
    for (const [column, value] of [
      ["full_name", data.fullName], ["education_level", data.educationLevel],
      ["student_contact", data.studentContact], ["guardian_name", data.guardianName],
      ["guardian_whatsapp", data.guardianWhatsapp], ["avatar", data.avatar],
    ]) {
      if (value !== undefined) {
        values.push(value === "" ? null : value);
        fields.push(`${column} = $${values.length}`);
      }
    }
    let student = existing;
    if (fields.length) {
      values.push(userId, studentId);
      const result = await client.query(
        `UPDATE edulearn.students SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $${values.length - 1} AND id = $${values.length} RETURNING ${returningStudentFields}`,
        values,
      );
      student = mapStudent(result.rows[0]);
    }
    if (subjectIds) {
      await client.query("DELETE FROM edulearn.student_subjects WHERE user_id = $1 AND student_id = $2", [userId, studentId]);
      await client.query(
        `INSERT INTO edulearn.student_subjects (user_id, student_id, subject_id)
         SELECT $1, $2, unnest($3::bigint[])`,
        [userId, studentId, subjectIds],
      );
    }
    await client.query("COMMIT");
    return { student, subjects: await findSubjectsForStudent(userId, studentId) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const setStudentStatus = async (userId, studentId, status) => {
  const result = await pool.query(
    `UPDATE edulearn.students
     SET status = $1, archived_at = CASE WHEN $1 = 'Archived' THEN CURRENT_TIMESTAMP ELSE NULL END,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2 AND id = $3
     RETURNING ${returningStudentFields}`,
    [status, userId, studentId],
  );
  return result.rows[0] ? mapStudent(result.rows[0]) : null;
};

export { mapStudent };

