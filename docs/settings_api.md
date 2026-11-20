# Settings API

All endpoints require the authenticated `edulearn_session` cookie.

- `GET /api/settings` — return tutor profile, read-only email, public WhatsApp number, and appearance theme.
- `PATCH /api/settings/profile` — update `fullName` and preset `avatar` only.
- `PATCH /api/settings/public-contact` — update or clear `whatsappNumber` using international digits only, such as `6281234567890`.
- `PATCH /api/settings/appearance` — persist `theme` as `Light`, `Dark`, or `System`.
- `POST /api/settings/change-password` — require current password, update the password, revoke all sessions, and clear the current session cookie.

Email is read-only. Photo uploads, custom avatar URLs, and account deletion are
not supported. Profile and public-contact updates are separate operations;
appearance updates persist immediately.

