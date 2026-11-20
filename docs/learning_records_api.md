# Learning Records API

All endpoints require the authenticated `edulearn_session` cookie.

- `GET /api/learning-records` — list records with `search`, `studentId`, `subjectId`, `fromDate`, `toDate`, `page`, `pageSize` (`5` or `10`), and `sort` filters.
- `GET /api/learning-records/:id` — retrieve record detail.
- `PATCH /api/learning-records/:id` — edit `learningMaterial` and/or internal `notes` only.
- `POST /api/learning-records/schedules/:scheduleId` — Record Lesson action. This atomically creates the record and changes the source Scheduled schedule to Completed.
- `POST /api/schedules/:id/record-lesson` — equivalent Schedule Detail integration endpoint.

Student, subject, and lesson date are always copied from the source schedule.
Records cannot be created for Completed or Cancelled schedules, cannot be
created more than once per schedule, and cannot be deleted. Internal notes are
not included in Parent Reports.

