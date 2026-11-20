# Student Management API

All endpoints require the existing `edulearn_session` HttpOnly cookie.

Base path: `/api/students`

## Endpoints

- `GET /` — list students. Query parameters: `status` (`Active` or `Archived`, default `Active`), `search`, `page` (default `1`), and `pageSize` (`5` or `10`, default `5`). Results include `items` and `pagination` metadata.
- `GET /:id` — retrieve one owned student and assigned subjects.
- `POST /` — create a student. Requires `fullName`, `educationLevel`, `subjectIds` (at least one active subject), and a preset `avatar` identifier.
- `PATCH /:id` — update supplied student fields. Supplying `subjectIds` replaces the assignment set transactionally.
- `POST /:id/archive` — archive an owned student.
- `POST /:id/restore` — restore an owned student.

Student and subject queries are ownership-scoped by the authenticated tutor. A
student creation or subject-assignment update rolls back if any subject is
missing, inactive, or owned by another tutor. Permanent deletion is not
exposed.

New student create/update requests accept only these preset avatar identifiers:

- `student_avatar_01`
- `student_avatar_02`
- `student_avatar_03`
- `student_avatar_04`
- `student_avatar_05`
- `student_avatar_06`
- `student_avatar_07`
- `student_avatar_08`

The catalog is centralized in the backend and is extensible by adding new
identifiers without reusing existing ones. Visual assets, display labels, and
accessibility text are pending; no photo uploads or custom avatar URLs are
accepted. Legacy values already stored in the database, such as `character_1`,
remain readable in responses but are rejected for new create/update requests.

## Subject Management

Subject endpoints use `/api/subjects` and require the authenticated session:

- `GET /` — list subjects, optionally filtered by `search` and `status` (`All`, `Active`, or `Inactive`), including student and completed-lesson counts.
- `POST /` — create a trimmed custom subject name.
- `PATCH /:id` — rename a custom subject while preserving its identity.
- `POST /:id/deactivate` — deactivate a subject for new assignments and schedules.
- `POST /:id/reactivate` — reactivate a subject.
- `DELETE /:id` — delete an eligible custom subject. Send `{ "confirm": true }` when current student assignments must also be removed; an unconfirmed request reports affected students.

Mathematics and English are seeded as default subjects for each tutor. Default
subjects may be deactivated but cannot be renamed or permanently deleted.
Historical schedule and report data is preserved. Parent-report snapshots record
their subject IDs and subject-name snapshots in the dedicated
`parent_report_snapshot_subjects` relation. This reference is independent of
current student assignments, so removing an assignment does not make a subject
deletion eligible. Legacy snapshots without normalized subject references are
treated conservatively and block subject deletion until they are backfilled.

