# Parent Reports API

All endpoints require the authenticated `edulearn_session` cookie.

- `GET /api/students/:studentId/parent-reports/preview?reportingMonth=YYYY-MM` — preview eligible completed learning records for a calendar month.
- `POST /api/students/:studentId/parent-reports` — generate and persist a report using `{ reportingMonth, tutorMessage }`.
- `GET /api/students/:studentId/parent-reports` — list immutable report history and versions.
- `GET /api/parent-reports/:id` — retrieve a saved snapshot.
- `GET /api/parent-reports/:id/download` — return a short-lived private R2 download URL.

Reports include only Learning Records whose schedules are Completed and whose
lesson dates fall within the selected month. Internal Learning Record notes are
never copied into snapshot data or PDFs. Each generated version stores an
immutable JSON snapshot and PDF metadata. Snapshot subject references are
recorded in the same database transaction as the snapshot.

The R2 adapter expects `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET`, and optionally `R2_ENDPOINT`. The bucket is private; downloads use
expiring SigV4 URLs.

