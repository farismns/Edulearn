# Dashboard API

`GET /api/dashboard` requires the authenticated `edulearn_session` cookie.

The response contains exactly two summary values:

- `summary.totalStudents` — active students only.
- `summary.todaysLessons` — today’s Scheduled and Completed schedules for active students; Cancelled schedules are excluded.

`today` contains all today’s Scheduled and Completed schedules for active
students, ordered by start time. `upcoming` starts tomorrow, includes Scheduled
schedules only, is ordered nearest first, and contains at most three items.

Dashboard date boundaries use the application timezone. The backend uses
`EDULEARN_TIME_ZONE` when configured and defaults to `Asia/Jakarta` until the
product’s final timezone configuration is established. Archived students and
their existing schedules are excluded from Dashboard results.

