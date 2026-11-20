import { pool } from "../../config/database.js";
import { isOverdueDashboardSchedule } from "./dashboard.policy.js";

const mapSchedule = (row, dashboardDate, dashboardTime) => ({
  id: String(row.id),
  studentId: String(row.student_id),
  studentName: row.student_name,
  subjectId: row.subject_id === null ? null : String(row.subject_id),
  subjectName: row.subject_name_snapshot,
  scheduledDate: row.scheduled_date,
  startTime: row.start_time,
  endTime: row.end_time,
  status: row.status,
  isOverdue: isOverdueDashboardSchedule({
    scheduledDate: row.scheduled_date,
    dashboardDate,
    endTime: row.end_time,
    currentTime: dashboardTime,
    status: row.status,
  }),
});

const scheduleSelect = `
  SELECT sch.id, sch.student_id, st.full_name AS student_name,
         sch.subject_id, sch.subject_name_snapshot, sch.scheduled_date,
         sch.start_time, sch.end_time, sch.status
  FROM edulearn.schedules sch
  JOIN edulearn.students st
    ON st.id = sch.student_id AND st.user_id = sch.user_id`;

export const getDashboardData = async ({ userId, dashboardDate, dashboardTime }) => {
  const [summaryResult, todayResult, upcomingResult] = await Promise.all([
    pool.query(
      `SELECT
         (SELECT COUNT(*)::integer FROM edulearn.students
          WHERE user_id = $1 AND status = 'Active') AS total_students,
         (SELECT COUNT(*)::integer
          FROM edulearn.schedules sch
          JOIN edulearn.students st
            ON st.id = sch.student_id AND st.user_id = sch.user_id
          WHERE sch.user_id = $1 AND st.status = 'Active'
            AND sch.scheduled_date = $2::date
            AND sch.status IN ('Scheduled', 'Completed')) AS todays_lessons`,
      [userId, dashboardDate],
    ),
    pool.query(
      `${scheduleSelect}
       WHERE sch.user_id = $1
         AND st.status = 'Active'
         AND sch.scheduled_date = $2::date
         AND sch.status IN ('Scheduled', 'Completed')
       ORDER BY sch.start_time ASC, sch.id ASC`,
      [userId, dashboardDate],
    ),
    pool.query(
      `${scheduleSelect}
       WHERE sch.user_id = $1
         AND st.status = 'Active'
         AND sch.scheduled_date > $2::date
         AND sch.status = 'Scheduled'
       ORDER BY sch.scheduled_date ASC, sch.start_time ASC, sch.id ASC
       LIMIT 3`,
      [userId, dashboardDate],
    ),
  ]);

  return {
    summary: {
      totalStudents: Number(summaryResult.rows[0].total_students),
      todaysLessons: Number(summaryResult.rows[0].todays_lessons),
    },
    today: todayResult.rows.map((row) => mapSchedule(row, dashboardDate, dashboardTime)),
    upcoming: upcomingResult.rows.map((row) => mapSchedule(row, dashboardDate, dashboardTime)),
  };
};

