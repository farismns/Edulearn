# EduLearn MVP Documentation

**Document type:** Product and MVP Specification\
**Product:** EduLearn\
**Version:** 1.0\
**Status:** Approved\
**Last updated:** November 9, 2026

------------------------------------------------------------------------

## 1. Product Overview

EduLearn is a personal tutoring management web application for an
independent tutor. It centralizes student information, subject
assignments, lesson schedules, learning records, and monthly learning
reports for parents.

Production V1 supports one user: the Tutor/Admin. The target students
are at **Elementary School (SD)** and **Junior High School (SMP)**
levels.

### Product vision

Provide a simple, reliable workspace that helps an independent tutor
organize daily tutoring operations, maintain student learning histories,
and share learning activity summaries with parents.

### Product principles

-   Keep It Simple, but Build It Properly.
-   Prioritize essential daily tutoring workflows.
-   Keep data consistent across modules.
-   Protect student information.
-   Avoid over-engineering V1.
-   Let actual client needs and usage feedback guide future development.

### User roles

  -----------------------------------------------------------------------
  Role                    V1                      Responsibility
  ----------------------- ----------------------- -----------------------
  Tutor / Admin           Yes, one account        Manages all tutoring
                                                  data and application
                                                  settings

  Parent / Guardian       No account              Receives PDF reports
                                                  manually from the tutor

  Developer               No in-app role          Maintains
                                                  infrastructure and
                                                  application outside the
                                                  app
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 2. Product Goals and Success Criteria

### Goals

1.  Centralize student and subject information.
2.  Make manual lesson scheduling straightforward.
3.  Record completed lessons consistently.
4.  Maintain searchable learning histories.
5.  Generate monthly PDF learning reports.
6.  Provide a simple and secure single-user application.

### V1 success criteria

The tutor can register and verify the initial account, sign in securely,
manage students and subjects, create and manage schedules, record
completed lessons, search and edit learning records, generate and
download monthly PDF reports, and update profile and application
settings.

------------------------------------------------------------------------

## 3. Scope

### V1 features

1.  Public Landing Page
2.  Authentication and Single Account Setup
3.  Dashboard
4.  Student Management
5.  Subject Management
6.  Schedule Management
7.  Learning Records
8.  Parent Reports
9.  Settings
10. Security, Backup, and Monitoring

### Out of scope for V1

-   Multiple tutors, multi-account, and multi-tenant support
-   Parent Portal
-   WhatsApp API integration
-   Recurring schedules
-   Calendar view
-   Structured Student Progress Evaluation
-   Attendance Management
-   Payment Management and Financial Reports
-   Full Data Export/Import
-   Email address change and in-app account deletion
-   Advanced Analytics
-   Landing Page CMS, blog, testimonials, and pricing pages
-   Profile photo upload
-   Google or Facebook login
-   Email delivery of parent reports
-   Session expiration warning
-   Remember Me

V2 is client-driven. This document does not define a fixed V2 feature
list.

------------------------------------------------------------------------

## 4. Navigation and Information Architecture

### Main sidebar

1.  Dashboard
2.  Schedules
3.  Students
4.  Learning Records
5.  Settings

Logout appears at the bottom of the sidebar, separated from the main
navigation.

### Nested features

-   Subject Management is accessed from Students through
    `Manage Subjects`.
-   Parent Reports is a section/tab inside Student Detail.
-   Learning History is inside Student Detail.
-   Record Lesson is an action from Schedule Detail.

### Responsive navigation

-   Desktop: fixed sidebar.
-   Tablet and mobile: sidebar drawer.
-   Active menu item has a clear visual state.
-   Application remains usable on desktop, tablet, and mobile.

------------------------------------------------------------------------

## 5. Public Landing Page

### Routes

  Route         Page
  ------------- ----------
  `/`           Home
  `/features`   Features
  `/about`      About
  `/contact`    Contact
  `/login`      Login

Public pages are accessible without signing in.

### Language and visual direction

-   Public Landing Page: Bahasa Indonesia.
-   Authentication and private application: English.
-   No language switcher in V1.
-   Visual direction: Modern Minimalist.
-   Proposed colors: Primary Blue `#2563EB`, Dark Navy `#0F172A`,
    Background `#F8FAFC`, Secondary Text `#64748B`.
-   Proposed typography: Inter.
-   Use whitespace, clean typography, simple components, minimal
    shadows, thin borders, and subtle rounded corners.
-   Hero illustration: tutor and student studying.

The proposed visual tokens can be refined during visual design
implementation.

### Navbar

EduLearn logo, Beranda, Fitur, Tentang, Kontak, Masuk. `Masuk` links to
`/login`.

### Home

Includes Hero, education illustration, short product introduction,
Features overview, and How It Works.

Hero CTA: `Hubungi Tutor`.

WhatsApp prefilled message:

> Hello, I'm interested in learning more about EduLearn. Could you
> provide more information?

### Features

Showcase Dashboard, Student Management, Schedule Management, Learning
Records, and Parent Reports. Settings is not a core marketing feature.

### About

Explain what EduLearn is, the problem it addresses, its purpose, and its
target user.

### How It Works

1.  Manage students.
2.  Organize schedules.
3.  Record learning activities.
4.  Generate learning reports.

### Contact

-   WhatsApp Click to Chat only.
-   No contact form, FAQ, email link, or social links in V1.
-   WhatsApp number is managed in Settings.
-   Number format: international digits, e.g. `6281234567890`, without
    `+`, spaces, or hyphens.
-   If no number is configured, public contact CTA is hidden or
    disabled.

------------------------------------------------------------------------

## 6. Authentication and Single Account Setup

### Account model

Production V1 supports one Tutor/Admin account. Registration is for
initial owner setup, not public registration.

### Initial registration protection

-   Production registration requires a Setup Secret.
-   Secret is stored in a backend environment variable and validated
    server-side.
-   It must never be exposed in frontend code or committed to the
    repository.
-   Once the account is activated after email verification, Production
    registration is permanently closed.
-   Local and Staging may use separate test accounts and configuration.

### Login

Fields/actions: - Email Address - Password - Password visibility
toggle - Forgot Password - Sign In - Back to Website

Successful login redirects to Dashboard. If an authenticated user visits
`/login`, redirect to Dashboard. No Remember Me.

### Registration

Fields: - Full Name - Email - Password - Confirm Password

Password rules: - Minimum 8 characters is mandatory. - Uppercase letter,
number, and special character are recommendations, not mandatory. -
Dynamic password strength indicator provides feedback. - Strength score
does not block registration if minimum length is met.

### Email verification

-   Mandatory during initial registration.
-   Link validity: 15 minutes.
-   Expired token is invalid.
-   User can request a new link.
-   New token invalidates the previous token.
-   Resend requests are rate-limited.
-   Account is active only after successful verification.

### Forgot and reset password

-   Forgot Password response must not reveal whether an account exists.
-   Generic response:
    `If an account exists with this email address, you will receive a password reset link.`
-   Reset uses a one-time expiring token.
-   Reset form requires New Password and Confirm New Password.
-   Successful reset redirects to Login and revokes existing sessions.

### Change password

Available in Settings. Requires Current Password, New Password, and
Confirm New Password. Minimum new password length is 8. Successful
change revokes existing sessions, requiring login again.

### Session management

-   Idle Timeout: 45 minutes.
-   Absolute Timeout: 12 hours.
-   Activity in EduLearn resets idle timeout.
-   Tab backgrounding/minimizing does not stop idle timeout.
-   Absolute timeout never extends.
-   No expiration warning in V1.
-   Manual logout ends the session.
-   Browser closed: session must end.
-   Browser reopened: user must log in again.

Cookie requirements: - Session cookie without `Expires` or `Max-Age`. -
HttpOnly. - Secure in Production. - Appropriate SameSite setting.

**Implementation caveat:** Browsers may restore session cookies through
session restore. A cookie alone does not guarantee browser-close
behavior. Use server-side session persistence and revocation/validation.
Do not rely solely on `beforeunload`.

### Authentication security

-   Password hashing: Argon2id or bcrypt.
-   Rate limiting on login and sensitive endpoints.
-   Do not store passwords or long-lived authentication tokens in
    localStorage.
-   Backend is the source of truth for session validity and timeout
    enforcement.

------------------------------------------------------------------------

## 7. Dashboard

### Purpose and page order

Dashboard is a daily operational overview, not an analytics page.

1.  Welcome Header with greeting and current date.
2.  Exactly two summary cards: Total Students and Today's Lessons.
3.  Today's Schedule.
4.  Upcoming Schedule.
5.  Quick Actions: Add Schedule and Add Student.

### Summary rules

-   Total Students counts Active students only, excluding Archived.
-   Today's Lessons counts today's Scheduled and Completed schedules,
    excluding Cancelled.
-   Overdue schedules that remain Scheduled are counted.

### Today's Schedule

-   Shows all today's schedules except Cancelled.
-   Includes Scheduled, Completed, and overdue Scheduled.
-   Overdue is an indicator, not a status.
-   A schedule becomes overdue when its end time passes while it remains
    Scheduled.
-   Overdue schedules remain in Today's Schedule until the date changes.
-   Tutor can Record Lesson or Cancel an overdue schedule.
-   Empty state: `No lessons scheduled for today.`

### Upcoming Schedule

-   Starts tomorrow, not today.
-   Includes future Scheduled schedules only.
-   Excludes Completed and Cancelled.
-   Shows a maximum of three items.
-   Includes `View All Upcoming`.
-   Empty state: `No upcoming lessons.`

Dashboard and Schedules use the same source data and status rules.
Dashboard date uses the application timezone; exact timezone
configuration is finalized during implementation.

Record Lesson is not a Dashboard quick action. It is accessed from
Schedule Detail.

------------------------------------------------------------------------

## 8. Student Management

### Student List

Route: `/students`

Components: - Page title - `Add Student` - `Manage Subjects` - Search by
student name - Active and Archived tabs/filters - Vertical list, not
grid/cards - Cartoon avatar and full name per row - Server-side
pagination, default 5, options 5 or 10

Search is live and case-insensitive. Active tab searches active students
only; Archived tab searches archived students only.

Empty state: `No students found.`

Selecting a row opens Student Detail.

### Add Student

Route: `/students/new`

Fields: - Full Name (required) - Education Level (required) - Subjects
(required, multi-select) - Student Contact (optional) - Parent/Guardian
Name (optional) - Parent/Guardian WhatsApp Number (optional) - Student
Avatar (preset character avatar)

Education Level options: - Elementary School (SD) - Junior High School
(SMP)

No grade-level detail in V1.

Student avatar uses preset cartoon characters. Tutor avatar uses
initials or a preset character. No photo upload.

### Student Detail

Route: `/students/:id`

Sections/tabs: 1. Overview 2. Learning History 3. Parent Reports

Overview displays Avatar, Full Name, Education Level, Subject(s),
Student Contact, Parent/Guardian Name, Parent/Guardian WhatsApp Number,
and Active/Archived status.

A student may have multiple subjects.

### Learning History

Displays Lesson Date, Subject, and Learning Material. Selecting an item
opens Learning Record Detail. Notes belong to the relevant Learning
Record, not to an independent student-notes feature.

Pagination: default 5, options 5 or 10.

### Edit Student

Student information is edited from Student Detail. No separate edit
route is required.

### Archive and restore

-   Tutor can archive students who no longer take lessons.
-   Archived students disappear from Active Student List.
-   Archived students cannot be selected for new schedules.
-   Existing schedules, Learning Records, and Parent Reports remain.
-   Tutor can view Archived students and restore them.
-   Restore returns the student to the active list with history intact.
-   Permanent student deletion is not available in V1.

Future schedules belonging to Archived students remain accessible in
Schedules, retain their status, do not appear on Dashboard, and can
still be recorded or cancelled. No new schedule can be created for an
Archived student.

### Subject assignment

-   Subject is selected and managed in Student Profile.
-   Schedule creation selects from the student's registered active
    subjects.
-   Removing a Subject from a Student affects only that student.
-   It becomes unavailable for new schedules for that student.
-   Historical schedules and records remain.
-   It can be added again if globally Active.
-   An inactive Subject remains visible with an `Inactive` label.

Structured Student Progress Evaluation fields (Understanding, Strengths,
Weaknesses, Recommendations) are deferred from V1.

------------------------------------------------------------------------

## 9. Subject Management

### Access and layout

Accessed from Students through `Manage Subjects`, not a sixth main
sidebar item. Use a vertical table/list view, not a grid.

### Subject List

Components: - Page title: `Subject Management` - `Add Subject` - Search
by Subject Name - Table/list columns: Subject Name, Number of Students,
Completed Lessons, Status (Active/Inactive), Actions

### Default and custom subjects

Default seeded Subjects: - Mathematics - English

Default subjects cannot be permanently deleted but can be deactivated.
Tutor can add custom subjects.

Subject names must be non-empty, trimmed, and unique according to the
application's case-insensitive duplicate policy.

### Add and edit

Add requires Subject Name.

Tutor may rename a custom Subject: - Subject identity remains the
same. - Current Student Profiles and new Schedules use the latest
name. - Historical Learning Records and Parent Report snapshots preserve
the name captured at the time. - Rename does not create a new Subject
identity.

### Deactivate and reactivate

Deactivate: - Prevents new student assignments and new schedules. -
Existing Student Profiles may display it with an `Inactive` label. -
Existing schedules and records remain unchanged. - Tutor can reactivate
it.

Reactivate: - Makes Subject available for new assignments. - Does not
automatically add it to every Student Profile. - Does not change
Archived student status. - Historical references remain intact.

### Remove from Student vs global deactivation

These are separate operations.

-   Remove from Student affects one Student Profile and prevents new
    schedules for that student using the removed Subject. Historical
    data remains.
-   Global deactivation prevents new use across all students. Existing
    assignments and history remain. It can be reversed.

### Delete custom Subject

Permanent deletion is conditional: - Custom Subject with 0, 1, or 2
globally Completed lessons may be eligible. - More than 2 Completed
lessons: only Deactivate/Reactivate. - Scheduled and Cancelled schedules
do not count as Completed lessons. - Any active Schedule using the
Subject blocks deletion until completed or cancelled. - Any Parent
Report Snapshot referencing the Subject blocks deletion. - If assigned
to students, confirmation lists affected students. On confirmation,
remove it from those profiles. - Default Subjects cannot be permanently
deleted.

Historical integrity is mandatory. Deletion must not destroy historical
Schedule, Learning Record, or Parent Report data. Database design must
preserve historical Subject identity/name even if a custom Subject is
eligible for deletion. Exact retention strategy is finalized during
database design.

If a Subject is deactivated or removed after a Schedule already exists,
the Schedule remains unchanged and accessible. Record Lesson remains
available if its status is Scheduled. The Subject is unavailable for new
schedules. Cancelled schedules retain the historical Subject reference.

------------------------------------------------------------------------

## 10. Schedule Management

### Schedule List

Route: `/schedules`

Use List View only. Calendar View is out of scope.

Components: - Page title: `Schedules` - `Add Schedule` - Upcoming and
Past tabs - Search by Student Name - Filter by Subject and Status -
Sorting by date and time - Pagination: default 5, options 5 or 10

Upcoming: - Includes schedules today and in the future. - Excludes
Cancelled. - Default sort Ascending by date/time, nearest first.

Past: - Includes schedules dated before today. - Includes Completed,
Cancelled, and overdue Scheduled. - Default sort Descending by
date/time, most recent first.

Columns: Date, Start/End Time, Student Name, Subject, Status. Selecting
a row opens Schedule Detail. Existing schedules for Archived students
remain accessible.

### Add Schedule

Fields: - Student (required, Active students only) - Subject (required,
active Subjects assigned to selected Student) - Date (required) - Start
Time (required) - End Time (required, after Start Time) - Notes
(optional)

Subject choices update when Student selection changes.

### Schedule overlap

-   Warn when a new Schedule overlaps another Scheduled Schedule.
-   Cancelled schedules are excluded.
-   Adjacent schedules are not overlapping, e.g. 09:00-10:00 and
    10:00-11:00.
-   Warning does not block saving.

### Statuses and overdue

Statuses: - Scheduled - Completed - Cancelled

Overdue is an indicator, not a status. A Schedule remains Scheduled
after its end time passes until the Tutor records the lesson or cancels
it. It must not automatically become Completed or Cancelled.

### Schedule Detail actions

  Status      Available actions
  ----------- ----------------------------------------------------
  Scheduled   Edit Schedule, Cancel Schedule, Record Lesson
  Completed   View Learning Record; core schedule details locked
  Cancelled   View details and history only

Scheduled without Learning Record: Student, Subject, Date, Time, and
Notes may be edited.

Completed with Learning Record: Student, Subject, Date, and Time are
locked. Learning Material and Notes are edited through the Learning
Record.

Completed cannot return to Scheduled or be cancelled.

### Delete rules

-   Scheduled without Learning Record: may be permanently deleted after
    confirmation.
-   Cancelled: retained as history, cannot be permanently deleted.
-   Completed with Learning Record: cannot be permanently deleted.

Saving a Learning Record and changing its Schedule status to Completed
must be atomic. If record saving fails, Schedule status remains
unchanged.

------------------------------------------------------------------------

## 11. Learning Records

### Creation

Learning Records document lessons that have actually been conducted.

A record can only be created through `Schedule Detail → Record Lesson`.
There is no standalone Add Learning Record action.

### Learning Records List

Route: `/learning-records`

Use Table/List View.

Components: - Page title: `Learning Records` - Search by Student Name or
Learning Material - Filter by Student, Subject, and Date Period - Sort
by Lesson Date - Pagination: default 5, options 5 or 10

Columns: Lesson Date, Student, Subject, Learning Material.

Default sorting: Descending, newest Lesson Date first.

Selecting a row opens Learning Record Detail.

### Record Lesson form

Automatically populated and immutable: - Student - Subject - Lesson Date

Tutor inputs: - Learning Material (required) - Notes (optional)

On successful save: 1. Learning Record is stored and linked to Student
and Schedule. 2. Schedule status changes to Completed. 3. Record appears
in Learning Records List. 4. Record appears in Student Learning History.

Record save and Schedule status update must be atomic. Cancelled
Schedule cannot create a Learning Record.

### Learning Record Detail

Displays Student, Subject, Lesson Date, Learning Material, Notes,
Created At, and Last Updated At.

Only Learning Material and Notes are editable. Student, Subject, and
Lesson Date are immutable and follow the source Schedule.

Learning Records cannot be permanently deleted through V1. Incorrect
information must be corrected by editing. Editing a record does not
change Schedule status.

Learning Notes are internal Tutor notes and must not automatically
appear in Parent Reports.

------------------------------------------------------------------------

## 12. Parent Reports

### Purpose and access

Monthly learning activity reports for parents. Accessed from the
`Parent Reports` section/tab inside Student Detail, not from the main
sidebar.

### Frequency and delivery

-   Monthly recap based on calendar month.
-   One report for one student; may include multiple Subjects.
-   PDF export only.
-   Tutor manually sends PDF through WhatsApp.
-   No WhatsApp API, parent portal, or email delivery in V1.
-   Guardian contact details are optional and not required to generate a
    report.

### Parent Reports List

Displays Reporting Period, Generated Date, report version/history, View
Report, and Download PDF.

Empty state: `No parent reports generated yet.`

### Generate flow

1.  Select Month and Year.
2.  Retrieve eligible Learning Records.
3.  Preview in a Document Preview resembling an A4 page.
4.  Edit Tutor's Message.
5.  Generate PDF.
6.  Save report snapshot and PDF.
7.  Show the new report in history.
8.  Allow download.

### Report content

1.  Student Information
2.  Reporting Period
3.  Learning Summary: completed lesson count and subject count
4.  Learning History grouped by Subject, showing date and Learning
    Material
5.  Tutor's Message
6.  Generated Date

### Inclusion rules

Include only Learning Records linked to Completed Schedules within the
selected calendar month.

Exclude: - Scheduled schedules - Cancelled schedules - Completed
schedules without a Learning Record - Internal Learning Notes

If no eligible records exist, report generation is disabled.

Message: `No completed learning records found for the selected period.`

### Snapshot and versioning

-   Every generated report is an immutable snapshot.
-   Older reports do not change if Learning Records are later edited.
-   Generating again for the same period creates a new version.
-   Previous versions remain available.
-   Each version has its own Generated Date.
-   Subject names and report data are preserved in the snapshot.
-   Older reports are never overwritten.

### PDF storage

-   Cloudflare R2 private bucket.
-   Backend manages upload and download.
-   Database stores file metadata and object key.
-   Use expiring signed URLs for downloads.
-   Retain old report versions.

------------------------------------------------------------------------

## 13. Settings

Settings is one page with four sections, not four separate pages.

### Profile Settings

-   Full Name (required)
-   Avatar (initials or preset character avatar)
-   No photo upload.
-   Own `Save Changes` action.

### Account Settings

-   Email Address is read-only.
-   `Change Password` action.
-   Email cannot be changed in V1.
-   No Delete Account action in V1.

### Appearance

Options: - Light - Dark - System

Theme applies immediately and preference persists. System follows device
preference.

### Public Contact

-   WhatsApp Number.
-   International digit format, e.g. `6281234567890`.
-   No `+`, spaces, or hyphens.
-   Used by the public Landing Page CTA.
-   If not configured, public CTA is hidden or disabled.
-   Own `Save Changes` action.

### Save behavior and feedback

-   Profile Settings and Public Contact have separate Save Changes
    buttons.
-   Appearance saves immediately.
-   Account Settings has a separate Change Password action.
-   Show success/error feedback per section.
-   Preserve unsaved input if saving fails.

### Logout

Logout is at the bottom of the sidebar.

Flow: 1. Tutor selects Logout. 2. Confirmation:
`Are you sure you want to log out?` 3. Actions: Cancel / Logout. 4.
Backend revokes session and clears cookie. 5. Redirect to Login.

------------------------------------------------------------------------

## 14. UI/UX Standards

The application follows: 1. User-centered design 2. Visual hierarchy 3.
Consistency 4. Feedback 5. Error prevention 6. Accessibility 7.
Responsive design

Shared patterns: - Fixed sidebar on desktop, drawer on mobile/tablet. -
Page title, concise description, and primary action at top. - List/table
views for data-heavy modules. - Search and filters near relevant
lists. - Consistent pagination. - Confirmation dialogs for consequential
actions. - Inline form validation. - Loading, success, empty, and error
states. - Accessible labels, keyboard interaction, and sufficient
contrast. - English for private app and Authentication; Indonesian for
public Landing Page.

Responsive behavior: - Desktop: fixed sidebar; full-width data tables;
constrained document-like report preview. - Tablet: drawer navigation;
tables adapt to width. - Mobile: drawer navigation; compact stacked list
rows; vertically stacked forms; scrollable Document Preview.

------------------------------------------------------------------------

## 15. Technical Architecture

### Technology stack

  Layer                Technology
  -------------------- ----------------------
  Frontend             Next.js + React
  Backend              Node.js + Express.js
  Architecture         Modular Monolith
  API                  REST API
  Database             PostgreSQL
  Frontend Hosting     Vercel
  Backend Hosting      Vercel Functions
  Database Hosting     Neon
  File Storage         Cloudflare R2
  Error Monitoring     Sentry Free
  Structured Logging   Pino

### Backend architecture

Use a Modular Monolith with clear modules: - Auth - Dashboard -
Students - Subjects - Schedules - Learning Records - Parent Reports -
Settings

Do not introduce Microservices or Kubernetes in V1.

### API and data access

-   REST API.
-   Search and filtering handled through backend API.
-   Server-side pagination.
-   Database indexes where needed.
-   Backend validates session, ownership, business rules, and data
    integrity.

### Deployment

-   Frontend deployed to Vercel.
-   Express.js deployed as Vercel Functions, using one Express
    application function.
-   PostgreSQL hosted on Neon.
-   Use pooled database connection string where appropriate.
-   Session persistence must not rely on in-memory process state.
-   Cloudflare R2 private bucket for PDFs.
-   Backend manages file upload/download.
-   Database stores file metadata and object key.
-   Use expiring signed URLs for downloads.

### Environments

  Environment   Frontend / Backend   Database           File Storage
  ------------- -------------------- ------------------ --------------------------
  Local         localhost            Local PostgreSQL   Development/test storage
  Staging       Vercel Preview       Neon Testing       R2 Testing
  Production    Vercel Production    Neon Production    R2 Production

Environment variables and credentials are separated. Never use
Production student data in Local or Staging. Production uses HTTPS and
database TLS.

No persistent background workers are required for V1.

------------------------------------------------------------------------

## 16. Security, Privacy, and Data Integrity

### Access control

-   Only authenticated Tutor can access private student and tutoring
    data.
-   Backend validates session on every protected operation.
-   Backend validates ownership and authorization for every data
    operation.
-   Public visitors cannot access private application data.
-   Developer access is outside the app through authorized
    infrastructure tools.

### Student data privacy

-   Student data is used only for tutoring management and reporting.
-   Do not send student data to third parties for analytics or
    monitoring.
-   Avoid logging student personal information.
-   Never log passwords, authentication tokens, or sensitive student
    PII.
-   Configure Sentry and logs to avoid collecting sensitive data.

### Transport and storage security

-   HTTPS for all Production frontend/backend communication.
-   Database connections use TLS.
-   Private R2 bucket for generated reports.
-   Signed download URLs expire.
-   Passwords are securely hashed.
-   Session cookies use HttpOnly, Secure in Production, and appropriate
    SameSite settings.

### Data retention

-   Active student data retained while in use.
-   Archived students retained until manual deletion outside normal V1
    UI.
-   Learning Records and Parent Report snapshots are preserved.
-   No automatic deletion of historical tutoring data.
-   Permanent student deletion is not exposed in V1.

### Backup and recovery

-   Daily backup.
-   30-day retention target.
-   Database and file storage backed up separately.
-   Use managed backup capabilities where available.
-   Maintain periodic exports to separate storage where appropriate.
-   Test restore procedures periodically.
-   Do not build a custom backup system for V1.

### Monitoring and logging

-   Sentry Free for error monitoring.
-   Pino for structured logging.
-   Do not log passwords, tokens, or sensitive student PII.
-   Monitoring configuration must respect student data privacy.

### Data integrity

-   Learning Record creation and Schedule completion are atomic.
-   Historical Learning Record references remain valid.
-   Parent Report snapshots remain immutable.
-   Subject rename/deletion must not corrupt historical data.
-   Schedule status transitions follow defined business rules.

------------------------------------------------------------------------

## 17. Non-Functional Requirements

### Usability

-   Core daily workflows are easy to discover.
-   Data lists support search, filtering, and pagination.
-   Forms provide clear validation and feedback.
-   Destructive actions require confirmation.

### Maintainability

-   Modular backend organization.
-   Reusable frontend components where appropriate.
-   Explicit, testable business rules.
-   No unnecessary architectural complexity.

### Reliability

-   Preserve consistency across related operations.
-   Handle API and storage errors gracefully.
-   Do not report success before backend confirmation.
-   Maintain backups and periodically test recovery.

### Security

-   Enforce authentication and authorization server-side.
-   Protect sessions and sensitive endpoints.
-   Use HTTPS and secure cookies in Production.
-   Protect private PDF files.
-   Minimize sensitive data in logs and external services.

### Compatibility

-   Responsive desktop, tablet, and mobile layouts.
-   Modern browsers.
-   Accessible form controls and navigation.

------------------------------------------------------------------------

## 18. Cross-Module Business Rules

### Student

-   Only Active students can be selected for new schedules.
-   Archived students remain visible in historical records.
-   Archived students' existing schedules remain accessible.
-   Archived students' schedules do not appear on Dashboard.
-   Restore preserves history and returns the student to the active
    list.

### Subject

-   A student can have multiple subjects.
-   New schedules use only active subjects assigned to the selected
    active student.
-   Removing a subject from one student does not deactivate it globally.
-   Global deactivation prevents new use but preserves existing data.
-   Historical subject names must be preserved in records and reports.

### Schedule

-   Valid statuses: Scheduled, Completed, Cancelled.
-   Overdue is an indicator only.
-   Cancelled schedules cannot create Learning Records.
-   Completed schedules cannot be reverted or cancelled.
-   Completed and Cancelled schedules cannot be permanently deleted.
-   Scheduled schedules without Learning Records may be deleted after
    confirmation.

### Learning Record

-   A Learning Record originates from a Schedule.
-   Only eligible Scheduled lessons can be recorded.
-   Saving a record completes its Schedule atomically.
-   Student, Subject, and Lesson Date follow the source Schedule and are
    immutable.
-   Learning Material and Notes are editable.
-   Records cannot be permanently deleted through V1.

### Parent Report

-   Includes only eligible Learning Records in the selected calendar
    month.
-   Excludes internal Learning Notes.
-   Each generated report is an immutable snapshot.
-   A new report for the same period creates a new version.
-   PDF files are private and downloaded through backend-authorized
    access.

### Dashboard

-   Total Students counts Active students only.
-   Today's Lessons counts Scheduled and Completed schedules today,
    excluding Cancelled.
-   Today's Schedule excludes Cancelled.
-   Upcoming starts tomorrow and includes Scheduled only.
-   Archived students' schedules are excluded from Dashboard.

------------------------------------------------------------------------

## 19. Acceptance Criteria by Module

### Public Landing Page

-   Visitors can access public pages without signing in.
-   Navbar links navigate correctly.
-   Masuk opens Login.
-   WhatsApp CTA uses configured number and prefilled message.
-   Contact CTA is hidden or disabled when no number is configured.
-   Public pages use Bahasa Indonesia.

### Authentication

-   Initial Production registration requires a valid Setup Secret.
-   Production registration closes after account activation.
-   Email verification is mandatory and expires after 15 minutes.
-   Resending verification invalidates the previous token and is
    rate-limited.
-   Password minimum length is 8 characters.
-   Login success redirects to Dashboard.
-   Forgot Password does not disclose account existence.
-   Idle and absolute timeouts are enforced server-side.
-   Logout revokes the session.

### Dashboard

-   Exactly two summary cards are displayed.
-   Total Students excludes Archived students.
-   Today's Lessons excludes Cancelled schedules.
-   Today's Schedule excludes Cancelled schedules.
-   Upcoming starts tomorrow and shows at most three schedules.
-   Quick Actions are Add Schedule and Add Student.

### Student Management

-   Tutor can create, search, view, and edit students.
-   Student can have multiple subjects.
-   Education Level options are Elementary School and Junior High
    School.
-   Active and Archived lists are separated.
-   Archived students cannot be selected for new schedules.
-   Restore preserves historical data.
-   Student list is vertical, not grid-based.

### Subject Management

-   Default Mathematics and English subjects exist.
-   Tutor can add and rename custom subjects.
-   Tutor can deactivate and reactivate subjects.
-   Subject removal from a student is separate from global deactivation.
-   Deletion rules are enforced.
-   Historical subject references remain intact.

### Schedule Management

-   Tutor can create and view schedules.
-   Subject choices depend on selected student's active subjects.
-   Overlap warning appears for overlapping Scheduled schedules.
-   Overlap warning does not block saving.
-   Upcoming and Past tabs follow their date/status rules.
-   Status transitions follow business rules.
-   Archived students' existing schedules remain accessible.

### Learning Records

-   Record Lesson is available from eligible Schedule Detail.
-   Student, Subject, and Lesson Date are automatically populated.
-   Learning Material is required; Notes are optional.
-   Successful save changes Schedule to Completed atomically.
-   Records appear in Learning Records List and Student Learning
    History.
-   Only Learning Material and Notes are editable.
-   Permanent deletion is unavailable.

### Parent Reports

-   Tutor can select month and year.
-   Only eligible Learning Records are included.
-   Internal Learning Notes are excluded.
-   Empty periods cannot generate reports.
-   Document Preview resembles an A4 document.
-   PDF and snapshot are stored.
-   Previous report versions remain available.
-   New generation for the same period creates a new version.

### Settings

-   Tutor can update Full Name and preset Avatar.
-   Email Address is read-only.
-   Change Password requires Current Password.
-   Theme options are Light, Dark, and System.
-   Theme preference persists.
-   Public WhatsApp number uses the required format.
-   Profile and Public Contact have separate Save Changes actions.
-   Appearance saves immediately.
-   Logout requires confirmation and revokes the session.

------------------------------------------------------------------------

## 20. Implementation Considerations and Open Technical Decisions

These items are deferred to detailed design and implementation and do
not block this product-level MVP specification.

1.  **Application timezone:** Select and consistently apply the timezone
    for Dashboard, Schedule grouping, date filters, and report periods.
2.  **Database schema:** Define entities, relationships, constraints,
    indexes, and deletion/retention strategy.
3.  **Subject historical identity:** Choose a robust mechanism to
    preserve historical Subject names and references when a custom
    Subject is deleted.
4.  **Session persistence:** Select server-side session storage and
    implement idle/absolute timeout enforcement, revocation, and
    browser-close behavior.
5.  **PDF generation:** Select a server-compatible PDF generation
    approach and define snapshot format.
6.  **R2 lifecycle and backup:** Confirm retention, backup, and restore
    procedures for PDF objects.
7.  **Setup Secret lifecycle:** Define secure provisioning and rotation
    without exposing the secret to the frontend.
8.  **API contracts:** Define request/response formats, validation,
    error codes, and pagination conventions.
9.  **Accessibility and browser support:** Define detailed test coverage
    during implementation.

------------------------------------------------------------------------

## 21. Recommended Development Sequence

1.  Repository and environment setup.
2.  Database design and migrations.
3.  Backend foundation and shared middleware.
4.  Authentication and single-account setup.
5.  Student and Subject Management.
6.  Schedule Management.
7.  Learning Records and atomic completion flow.
8.  Dashboard.
9.  Parent Reports and PDF storage.
10. Settings.
11. Public Landing Page.
12. Integration testing, security review, and responsive QA.
13. Staging validation.
14. Production deployment and backup/restore verification.

The sequence may be adjusted based on dependencies, but core data
relationships and authentication should be established before dependent
workflows.

------------------------------------------------------------------------

## 22. Final Product Definition

EduLearn V1 is a single-tutor tutoring management application focused on
the complete daily workflow:

**Manage Students and Subjects → Schedule Lessons → Record Completed
Lessons → Review Learning History → Generate Monthly Parent Reports.**

The product intentionally excludes multi-user collaboration, parent
accounts, automated messaging, calendar scheduling, attendance,
payments, and advanced analytics.

The guiding principle remains:

**Keep It Simple, but Build It Properly.**

This document captures the approved product scope and interface
framework. Detailed database design, API contracts, implementation
choices, and deployment procedures should be documented in their
respective technical design and development artifacts.
