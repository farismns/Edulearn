# EduLearn Repository Guidance

## 1. Project Overview

EduLearn is a tutoring management application for an independent tutor. Its MVP is intended to manage students, subjects, lesson schedules, learning records, and monthly parent reports. Production V1 is designed for one Tutor/Admin account.

The current repository contains the backend and project documentation. No frontend project is present in the repository structure currently inspected. Treat the MVP documentation as the source of product requirements; do not assume that a documented feature has already been implemented.

## 2. Project Structure & Technology Stack

- `backend/`: Node.js backend application and database migrations.
  - `backend/src/config/`: database, email, and session-cookie configuration.
  - `backend/src/middlewares/`: request validation, authentication, rate limiting, and error handling.
  - `backend/src/modules/`: currently includes `auth` and `email` modules.
  - `backend/src/utils/`: shared error, password, session, and verification-token utilities.
  - `backend/migrations/`: PostgreSQL schema migrations managed with node-pg-migrate.
- `docs/`: product requirements and development workflow documentation.

The backend currently uses Node.js with ES Modules, Express 5, PostgreSQL through `pg`, node-pg-migrate, Joi, bcrypt, Nodemailer, and cookie-parser. Keep this description aligned with the actual project configuration as dependencies evolve.

## 3. Documentation References

- `docs/edulearn_mvp_documentation.md` is the authoritative source for product requirements, MVP scope, and business rules.
- `docs/edulearn_git_workflow.md` is the authoritative source for Git branching, commit, review, and merge conventions.
- `docs/workflow development.md` describes the general development process.

Consult the relevant sections when working on a feature. Do not copy full feature requirements or workflow details into this file.

## 4. Architecture & Module Conventions

- Follow the existing Modular Monolith architecture. Do not introduce microservices or unnecessary architectural complexity.
- Keep modules cohesive and loosely coupled; avoid duplicating business logic.
- Preserve separation of responsibilities following the existing pattern: Routes → Middleware → Controller → Service → Repository.
  - Routes compose endpoints and middleware.
  - Middleware handles cross-cutting request concerns such as authentication and validation.
  - Controllers handle HTTP requests and responses.
  - Services implement business rules and application flows.
  - Repositories perform database queries and transactions.
  - Validation schemas define request input rules.
  - Utilities contain functionality that is genuinely reusable across modules.
- Follow Auth conventions where appropriate, but do not copy Auth implementation details blindly when they do not fit another feature.
- Keep HTTP concerns in controllers and business logic in services.

## 5. API, Validation & Error Handling

- Use Joi for request validation, following the existing validation middleware conventions.
- Use `AppError` for application errors that require an HTTP status code.
- Forward asynchronous errors through the existing Express error-handling mechanism.
- Preserve the current response conventions: success responses use `success`, optional `message`, and optional `data`; error responses use `success` and `message`.
- Joi validation middleware attaches field details to the error, but the current global error handler does not expose those details in its response. Do not assume otherwise.
- Do not introduce a new response format or serializer without justification and explicit approval.

## 6. Authentication, Authorization & Security

- Use the existing authentication middleware for protected endpoints.
- Authentication does not replace authorization. Every backend operation on user-owned data must enforce ownership and access rules; do not rely only on frontend checks or database foreign keys.
- Preserve the established session model: a random session token, only its hash stored in the database, an HttpOnly cookie, and server-side session validation and revocation. The current session policy uses a 45-minute idle timeout and a 12-hour absolute timeout.
- Follow security and privacy requirements in the MVP documentation, including minimizing sensitive student data in logs.
- Never expose passwords, session tokens, verification tokens, reset tokens, or secrets in logs or API responses.
- Do not store authentication secrets in localStorage.

## 7. Database & Migration Rules

- Use PostgreSQL through the existing database configuration and repository patterns.
- Follow the existing node-pg-migrate conventions: timestamp-prefixed descriptive snake_case filenames and exported `up` and `down` migrations.
- Ensure `down` correctly reverses the corresponding `up` operation.
- Preserve referential integrity and ownership constraints. Use database transactions for operations that must be atomic.
- Never change an already-applied migration to alter database history; create a new migration instead.
- Do not run destructive database operations without explicit approval.

## 8. Environment Variables

- Use environment variables for configuration and secrets. Follow `backend/.env.example` for the documented variable names.
- Never hardcode credentials or secrets.
- Never display or request the contents of `.env`. When documenting configuration, mention variable names only, never their values.

## 9. Development & Verification Guidelines

- Inspect only files relevant to the current task and prefer small, focused changes.
- Reuse existing patterns and utilities when appropriate; avoid unrelated refactoring.
- Check `backend/package.json` for available scripts before running verification. Do not invent npm scripts or test commands.
- Run relevant checks and report which commands were actually executed. Do not claim tests passed if they were not run.
- If automated tests are unavailable, state that limitation and perform appropriate targeted verification when requested.
- Keep completion reports concise.

## Token Efficiency Rules

- Treat this file as permanent project guidance, not a duplicate of the MVP documentation.
- Do not copy business rules, endpoint specifications, or feature requirements here; link to the relevant documentation instead.
- Read only documentation sections and source files relevant to the current task. Do not scan the whole repository unless necessary.
- Implement only the explicitly requested task and stop when it is complete.

## Git Restrictions

- Follow `docs/edulearn_git_workflow.md` for Git conventions.
- Do not switch or create branches, stage files, commit, push, merge, or perform other Git operations without explicit approval.
