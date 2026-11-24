# EduLearn - ongoing

EduLearn is a web-based tutoring management application designed to help independent tutors manage students, subjects, schedules, learning records, and monthly parent reports in one centralized platform.

## Project Overview

EduLearn aims to simplify tutoring administration through a centralized and structured management system.

**Target Users:** Independent tutors teaching elementary and junior high school students (SD-SMP).

## Technology Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Frontend         | Next.js, React, TypeScript |
| Backend          | Node.js, Express.js        |
| Database         | PostgreSQL                 |
| File Storage     | Cloudflare R2              |
| Deployment       | Vercel                     |
| Error Monitoring | Sentry (planned)           |

## Core Features

- Authentication and Session Management
- Student Management
- Subject Management
- Schedule Management
- Learning Records
- Dashboard
- Parent Reports (PDF)
- Tutor Settings

## Architecture

EduLearn uses a Modular Monolith architecture with REST API communication.

Backend modules are separated by business responsibility to maintain low coupling, clear ownership, and maintainability.

## Local Development

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create your local environment file based on `.env.example`:

```bash
Copy-Item .env.example .env
```

4. Configure your local database and other required environment variables.

5. Run the development server:

```bash
npm run dev
```

Refer to the project documentation for database setup and configuration details.

## Documentation

Detailed project documentation is maintained in the `docs/` directory.

## EduLearn: Roadmap Setelah MVP Documentation

The roadmap after MVP focuses on gradually expanding EduLearn beyond its initial scope.

Planned areas include:

- Enhanced student progress tracking.
- Advanced learning analytics.
- Improved reporting and insights.
- Additional tutoring management capabilities.
- Further UX and performance improvements.

## Project Status

Backend MVP modules have initial implementations. Database-backed integration testing, backend audit remediation, frontend development, and full-stack verification remain in progress.

## License

License has not yet been specified.
