# Schedule Management API

All endpoints require the authenticated `edulearn_session` cookie.

Base path: `/api/schedules`

- `GET /` — list schedules using `tab=Upcoming|Past`, `search`, `subjectId`, `status`, `page`, `pageSize` (`5` or `10`), and `sort`. Upcoming contains Scheduled schedules today or later; Past contains earlier, completed, cancelled, and overdue Scheduled schedules.
- `POST /` — create a schedule for an active student and active subject assigned to that student.
- `GET /:id` — retrieve schedule detail, including the immutable subject-name snapshot and overdue indicator.
- `PATCH /:id` — edit a Scheduled schedule without a learning record.
- `POST /:id/cancel` — cancel a Scheduled schedule without a learning record.
- `DELETE /:id` — permanently delete a Scheduled schedule without a learning record after `{ "confirm": true }`.
- `POST /:id/record-lesson` — atomically create the Learning Record and complete the Scheduled schedule.

Overlapping Scheduled schedules return a warning but are still saved. Cancelled
schedules are excluded from overlap checks; adjacent intervals do not overlap.
Completed and Cancelled schedules are not editable or permanently deletable.

