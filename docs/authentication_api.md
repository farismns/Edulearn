# Authentication API Contract

This document describes the implemented authentication API mounted at
`/api/auth`. It is based on the current Express routes, controllers, Joi
schemas, middleware, services, and session repositories.

## Common request rules

The backend parses JSON request bodies. Validation uses Joi with:

- `abortEarly: false`.
- `stripUnknown: true`; unknown body fields are removed before the controller.
- Normalized email values are trimmed and lowercased.

Validation failures return HTTP `400`:

```json
{
  "success": false,
  "message": "Validation failed."
}
```

Validation details are generated internally but are not included in the
response by the current global error handler.

All other handled errors use `{ success: false, message }`. Internal failures
return HTTP `500` with `message: "Internal server error."`.

## CSRF protection

The application uses a double-submit CSRF token. The global middleware runs
after JSON and cookie parsing and before all application routes.

All `POST`, `PUT`, `PATCH`, and `DELETE` requests require a matching CSRF
cookie and header. `GET`, `HEAD`, and `OPTIONS` requests do not require CSRF.
This applies to authentication endpoints and authenticated application
endpoints.

### Acquire a token

```text
GET /api/auth/csrf-token
```

No request body or authentication is required.

Response `200`:

```json
{
  "success": true,
  "data": {
    "csrfToken": "<64-character-lowercase-hex-token>"
  }
}
```

The backend sets or refreshes the `edulearn_csrf` cookie. The returned token
must be kept in frontend memory and sent on every state-changing request:

```http
X-CSRF-Token: <csrfToken>
```

The CSRF cookie and header must contain the same 64-character lowercase
hexadecimal value. Missing, malformed, or mismatched values return HTTP `403`:

```json
{
  "success": false,
  "message": "CSRF validation failed."
}
```

The CSRF cookie is intentionally readable by frontend JavaScript. It is not an
authentication credential. The session cookie remains HttpOnly and must not be
read or stored by frontend JavaScript.

## Cookies, CORS, and credentials

### Session cookie

The session cookie is named `edulearn_session` and is set by successful login.
Its implemented options are:

- `HttpOnly: true`.
- `Secure: true` when `NODE_ENV` is `production`; otherwise `false`.
- `SameSite`: `SESSION_COOKIE_SAME_SITE`, defaulting to `lax`.
- `Path: /`.
- No explicit `Expires` or `Max-Age`.

Logout and change-password clear this cookie using the same options.

### CSRF cookie

The CSRF cookie is named `edulearn_csrf` and uses:

- `HttpOnly: false`.
- The same production `Secure` rule as the session cookie.
- The same configured `SameSite` value as the session cookie.
- `Path: /`.
- No explicit `Expires` or `Max-Age`.

The implementation does not document a separate CSRF-cookie expiry policy.

### CORS and frontend requests

The Express app configures CORS with `origin: process.env.FRONTEND_URL` and
`credentials: true`. Frontend requests must use `credentials: "include"`.
`FRONTEND_URL` must match the frontend origin used by the browser. Production
frontend/backend communication must use HTTPS for secure cookies.

## Rate limits

The current implementation uses the default `express-rate-limit` store and a
15-minute window. Responses over a limit return HTTP `429`:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

Email-based limits use the normalized email after Joi validation and combine it
with the request IP.

| Endpoint | IP limit | Additional limit |
|---|---:|---:|
| `POST /api/auth/register` | 5 per 15 minutes | 3 per IP+email per 15 minutes |
| `POST /api/auth/verify-email` | 10 per 15 minutes | None |
| `POST /api/auth/resend-verification` | 10 per 15 minutes | 3 per IP+email per 15 minutes |
| `POST /api/auth/login` | 10 per 15 minutes | 5 per IP+email per 15 minutes |
| `POST /api/auth/forgot-password` | 10 per 15 minutes | 3 per IP+email per 15 minutes |
| `POST /api/auth/reset-password` | 10 per 15 minutes | None |
| `POST /api/auth/change-password` | 10 per 15 minutes | None |

The implementation does not define a distributed/shared rate-limit store for
multi-instance production deployments.

## User object shapes

### Login user

Successful login returns:

```json
{
  "id": "1",
  "fullName": "Tutor Name",
  "email": "tutor@example.com"
}
```

### Verified/current user

Email verification and `/me` return:

```json
{
  "id": "1",
  "fullName": "Tutor Name",
  "email": "tutor@example.com",
  "emailVerifiedAt": "2026-01-01T00:00:00.000Z"
}
```

`id` is the database user identifier. Because the database column is PostgreSQL
`BIGINT` and no custom `pg` type parser is configured, clients should treat the
serialized identifier as a string. The exact serialized timestamp format is
provided by PostgreSQL/Node serialization and is not separately specified by
the API code.

## Endpoint contracts

### Register

```text
POST /api/auth/register
```

CSRF is required. Authentication is not required.

Request body:

```json
{
  "fullName": "Tutor Name",
  "email": "tutor@example.com",
  "password": "at-least-8-characters",
  "confirmPassword": "at-least-8-characters",
  "setupSecret": "<production-only value>"
}
```

Validation:

- `fullName`: required, trimmed, 1–100 characters.
- `email`: required, trimmed, lowercased, valid email, maximum 255 characters.
- `password`: required, minimum 8 characters.
- `confirmPassword`: required and must equal `password`.
- `setupSecret`: optional in the schema, maximum 255 characters; required and
  compared to backend `SETUP_SECRET` in production.

Success response `202`:

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "email": "tutor@example.com"
  }
}
```

The backend creates a pending user and sends a 15-minute verification token by
email. It does not set an authentication session cookie.

Other responses:

- `400` validation failure.
- `403` invalid production setup secret.
- `409` registration unavailable:

  ```json
  {
    "success": false,
    "message": "Registration is unavailable."
  }
  ```

- `500` registration misconfiguration, email delivery, database, or other
  internal failure.

In production, an advisory transaction lock serializes registration. An
existing pending account reserves the single-account slot; an activated
account keeps registration permanently closed. The external conflict response
does not reveal which state exists. Local/staging behavior does not enforce the
production single-account flag.

### Verify email

```text
POST /api/auth/verify-email
```

CSRF is required. Authentication is not required.

Request body:

```json
{
  "token": "<64-character-lowercase-hex-token>"
}
```

The token must be hexadecimal and exactly 64 characters. It is hashed before
database lookup. A valid token activates the user and is marked used.

Success response `200`:

```json
{
  "success": true,
  "message": "Email verified successfully. You can now sign in.",
  "data": {
    "user": {
      "id": "1",
      "fullName": "Tutor Name",
      "email": "tutor@example.com",
      "emailVerifiedAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

Other responses: `400` validation or invalid/expired/already-used token, `403`
CSRF failure, and `429` IP rate limit. No session cookie is created.

The verification email links to frontend path `/verify-email` with the token in
the query string. That frontend route is not currently implemented here.

### Resend verification

```text
POST /api/auth/resend-verification
```

CSRF is required. Authentication is not required.

Request body:

```json
{
  "email": "tutor@example.com"
}
```

Success response `200` is always generic:

```json
{
  "success": true,
  "message": "If an account requires verification, a new verification email will be sent."
}
```

The backend only creates/sends a new token for an existing unverified user.
Previous unused verification tokens are invalidated. Missing, verified, and
unknown accounts use the same success response.

Other responses: `400` validation failure, `403` CSRF failure, `429` IP or
IP+email rate limit, and `500` internal failure including email delivery
failure. No session cookie is created.

### Login

```text
POST /api/auth/login
```

CSRF is required. Authentication is not required.

Request body:

```json
{
  "email": "tutor@example.com",
  "password": "your-password"
}
```

Validation requires a trimmed/lowercased valid email and a required, non-empty
password.

Success response `200`:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "1",
      "fullName": "Tutor Name",
      "email": "tutor@example.com"
    }
  }
}
```

The backend creates a server-side session and sets the HttpOnly
`edulearn_session` cookie. The raw session token is not included in JSON.

Other responses: `400` validation failure, `401` invalid credentials, `403`
CSRF failure or unverified account, and `429` IP or IP+email rate limit. The
backend does not redirect after login; the frontend owns the dashboard redirect.

### Current session/user

```text
GET /api/auth/me
```

No request body or CSRF header is required. A valid `edulearn_session` cookie is
required.

Success response `200`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "fullName": "Tutor Name",
      "email": "tutor@example.com",
      "emailVerifiedAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

Every successful `/me` request validates the session server-side and updates
`last_activity_at`, refreshing the 45-minute idle timeout. The 12-hour
absolute session expiry is not extended.

Other responses: `401` missing, invalid, revoked, idle-expired, or
absolute-expired session; `404` session user no longer exists. The session
cookie remains browser-managed.

### Logout

```text
POST /api/auth/logout
```

CSRF is required. The route does not use `authenticate`; it is idempotent and
returns success even when no valid session cookie is present.

Request body: none.

Success response `200`:

```json
{
  "success": true,
  "message": "Logout successful."
}
```

When present, the session is revoked and `edulearn_session` is cleared. Other
responses are `403` for CSRF failure or `500` for an internal failure. The
backend does not redirect; the frontend should clear auth state and navigate to
`/login`.

### Forgot password

```text
POST /api/auth/forgot-password
```

CSRF is required. Authentication is not required.

Request body:

```json
{
  "email": "tutor@example.com"
}
```

Success response `200` is always:

```json
{
  "success": true,
  "message": "If an account exists with this email address, you will receive a password reset link."
}
```

Only an existing verified user receives a reset email. The reset token is
stored hashed, expires after 15 minutes, and is invalidated when a newer reset
request is created. Account existence is not disclosed.

Other responses: `400` validation failure, `403` CSRF failure, `429` IP or
IP+email rate limit, and `500` database/internal failure. Email delivery
failure is logged server-side and the generic `200` response is still returned.

The reset email links to frontend path `/reset-password` with the token in the
query string. That frontend route is not currently implemented here.

### Reset password

```text
POST /api/auth/reset-password
```

CSRF is required. Authentication is not required.

Request body:

```json
{
  "token": "<64-character-lowercase-hex-token>",
  "newPassword": "at-least-8-characters",
  "confirmPassword": "at-least-8-characters"
}
```

Validation requires a 64-character hexadecimal token, a new password of at
least 8 characters, and matching password fields.

Success response `200`:

```json
{
  "success": true,
  "message": "Password reset successful. You can now sign in."
}
```

The token is consumed once and all existing sessions for the user are revoked.
The endpoint does not set or clear a session cookie. Other responses are `400`
validation/invalid token, `403` CSRF failure, and `429` IP rate limit. The
backend does not redirect; the frontend should navigate to `/login`.

### Change password

```text
POST /api/auth/change-password
```

CSRF and a valid `edulearn_session` cookie are required.

Request body:

```json
{
  "currentPassword": "current-password",
  "newPassword": "at-least-8-characters",
  "confirmPassword": "at-least-8-characters"
}
```

Validation requires all fields, a new password of at least 8 characters, and
matching new-password fields. The service also verifies the current password.

Success response `200`:

```json
{
  "success": true,
  "message": "Password changed successfully. Please sign in again."
}
```

All sessions are revoked and the current `edulearn_session` cookie is cleared.
Other responses are `400` validation/mismatched password, `401` missing or
invalid session/incorrect current password, `403` CSRF failure, `404`
authenticated user missing, and `429` IP rate limit. The frontend should clear
auth state and navigate to `/login`.

## Frontend integration requirements

The current frontend API helper uses:

```text
NEXT_PUBLIC_API_URL || http://localhost:5000
```

The frontend authentication client must:

1. Call `GET /api/auth/csrf-token` before any state-changing request.
2. Store `data.csrfToken` in memory only.
3. Send `X-CSRF-Token` with every `POST`, `PUT`, `PATCH`, and `DELETE`.
4. Use `credentials: "include"` on every request.
5. Keep the session token browser-managed; never read or persist it.
6. Bootstrap auth state with `GET /api/auth/me`.
7. Treat `401` as unauthenticated, clear auth state, and redirect private
   pages to `/login`.
8. Handle `429` centrally with rate-limit messaging and retry guidance.
9. On the exact CSRF `403` response, refresh the token and retry once at most.
10. Redirect successful login to `/dashboard` and successful logout, reset, and
    change-password flows to `/login`.

The backend does not implement frontend route protection or redirects.

## Documented ambiguities and unavailable guarantees

- Frontend routes `/verify-email` and `/reset-password` referenced by email
  links do not currently exist in the repository.
- No formal machine-readable OpenAPI schema is published.
- The exact serialized timestamp format for `emailVerifiedAt` is delegated to
  PostgreSQL/Node serialization.
- The CSRF cookie has no explicit expiry policy beyond browser session behavior.
- The default in-memory rate-limit store is not suitable for coordinated limits
  across multiple backend instances.
- Production values for `FRONTEND_URL`, `SESSION_COOKIE_SAME_SITE`, HTTPS, and
  secret/email configuration were not verified.
- The backend does not define redirect responses; redirects are frontend
  behavior.
