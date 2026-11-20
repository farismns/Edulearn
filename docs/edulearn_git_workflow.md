# EduLearn Git Branch Workflow

**Document type:** Development Workflow\
**Project:** EduLearn\
**Version:** 1.0\
**Status:** Proposed workflow standard\
**Last updated:** November 9, 2026

------------------------------------------------------------------------

## 1. Purpose

This document defines the Git branching, commit, review, and merge
workflow for EduLearn.

The goals are to:

-   Keep the production branch stable.
-   Isolate feature development.
-   Make changes easier to review and test.
-   Keep Git history understandable.
-   Reduce conflicts between independent work.
-   Support maintainable and clean development practices.

EduLearn uses a lightweight **Feature Branch Workflow**. Branches are
created for a feature or a clearly scoped task, not for every individual
file or minor code change.

## 2. Branch Structure

  -----------------------------------------------------------------------
  Branch                              Responsibility
  ----------------------------------- -----------------------------------
  `main`                              Stable, production-ready code

  `develop`                           Integration branch for completed
                                      features

  `feature/*`                         New feature development

  `fix/*`                             Bug fixes

  `refactor/*`                        Internal code improvements without
                                      intended behavior changes

  `docs/*`                            Documentation changes
  -----------------------------------------------------------------------

### 2.1 Main

-   Contains production-ready code.
-   Must remain stable.
-   Do not develop features directly on this branch.
-   Updates come from approved release merges from `develop` or an
    explicitly managed production hotfix.

### 2.2 Develop

-   Integrates completed feature branches.
-   Acts as the shared development baseline.
-   Must pass relevant integration checks before release.
-   Should remain in a buildable and testable state.

### 2.3 Feature Branches

Feature branches isolate new functionality.

Examples:

``` text
feature/authentication
feature/student-management
feature/subject-management
feature/schedule-management
feature/learning-records
feature/parent-reports
feature/dashboard
```

Create a feature branch when work begins. Do not create every planned
branch in advance.

A feature can be split into smaller branches when its scope is large
enough to justify independent implementation and review. Avoid excessive
branch fragmentation.

### 2.4 Fix Branches

Use `fix/*` for bug fixes.

Examples:

``` text
fix/session-timeout
fix/student-search
fix/schedule-overlap-validation
```

The target branch depends on where the bug exists: - Normal development
bug: branch from and merge into `develop`. - Production-critical bug:
use a controlled hotfix workflow from `main`, then propagate the fix
back to `develop`.

### 2.5 Refactor Branches

Use `refactor/*` for structural improvements that should not
intentionally change application behavior.

Examples:

``` text
refactor/student-service
refactor/api-error-handling
refactor/shared-form-components
```

### 2.6 Documentation Branches

Use `docs/*` for documentation-only work.

Examples:

``` text
docs/mvp-documentation
docs/database-design
docs/api-documentation
docs/readme-roadmap
```

## 3. Standard Development Flow

The standard feature flow is:

``` text
main
  |
  v
develop
  |
  | Create feature branch
  v
feature/<feature-name>
  |
  | Implement, test, and document
  v
Pull Request / Review
  |
  | Merge after checks pass
  v
develop
  |
  | Integration testing and release review
  v
main
  |
  v
Production
```

### 3.1 Start a Feature

1.  Make sure the local `develop` branch is up to date.
2.  Create a feature branch from `develop`.
3.  Implement only the agreed feature scope.
4.  Commit changes using Conventional Commits.
5.  Run relevant tests and checks.
6.  Push the branch to the remote repository.
7.  Open a Pull Request targeting `develop`.

Example:

``` bash
git switch develop
git pull origin develop
git switch -c feature/student-management
```

### 3.2 Work on the Feature

Keep changes focused on the feature's responsibility.

Before committing: - Review changed files. - Remove temporary debugging
code. - Run formatting and lint checks. - Run relevant tests. - Update
related documentation when needed.

Example:

``` bash
git status
git diff
git add .
git commit -m "feat: implement student management"
```

### 3.3 Push and Open a Pull Request

``` bash
git push -u origin feature/student-management
```

Create a Pull Request with: - Target branch: `develop` - Clear title. -
Summary of changes. - Relevant test results. - Screenshots for
meaningful UI changes, where useful. - Known limitations or follow-up
work.

Even for a solo project, use Pull Requests as a review checkpoint and an
auditable record of changes.

### 3.4 Merge into Develop

Merge only after: - The scope is complete. - Relevant tests pass. - Code
has been reviewed. - No unresolved merge conflicts remain. - Required
documentation is updated.

After merging, remove the feature branch when it is no longer needed.

### 3.5 Release to Main

When the integrated work is ready for release:

1.  Run integration and regression tests on `develop`.
2.  Review release scope.
3.  Merge `develop` into `main`.
4.  Tag the release when appropriate.
5.  Deploy the approved `main` version to Production.

Do not merge untested work into `main`.

## 4. Branch Naming Convention

Use this format:

``` text
<type>/<short-description>
```

Rules: - Use lowercase. - Separate words with hyphens. - Keep names
short but descriptive. - Use the correct type prefix.

Examples:

``` text
feature/authentication
feature/student-management
fix/session-timeout
refactor/student-service
docs/database-design
```

## 5. Commit Convention

EduLearn uses **Conventional Commits**.

Format:

``` text
<type>: <short description>
```

Common types:

  Type         Usage
  ------------ ---------------------------------------------------
  `feat`       Add a feature
  `fix`        Fix a bug
  `docs`       Documentation changes
  `refactor`   Internal code restructuring
  `test`       Add or update tests
  `chore`      Maintenance and tooling
  `style`      Formatting or style changes without logic changes
  `perf`       Performance improvements
  `build`      Build system or dependency changes
  `ci`         CI/CD configuration changes

Examples:

``` bash
git commit -m "feat: add student registration endpoint"
git commit -m "fix: prevent duplicate subject assignment"
git commit -m "refactor: separate student business logic"
git commit -m "test: add student service unit tests"
git commit -m "docs: document student management module"
git commit -m "chore: configure backend linting"
```

Commit messages should describe the change clearly. Avoid generic
messages such as `update`, `changes`, or `fix`.

## 6. Merge Rules

-   `feature/*` normally merges into `develop`.
-   `refactor/*` normally merges into `develop`.
-   `docs/*` normally merges into `develop`, unless the change is
    explicitly limited to release documentation.
-   `fix/*` targets the branch where the bug should be corrected.
-   `develop` merges into `main` only after integration testing and
    release review.
-   Do not commit feature work directly to `main`.
-   Do not merge incomplete or untested features.
-   Resolve conflicts and rerun relevant checks before merging.

For a production-critical hotfix: 1. Create a hotfix branch from `main`.
2. Apply and test the minimal fix. 3. Merge the fix into `main` after
review. 4. Propagate the same fix into `develop`. 5. Verify that both
branches contain the correction.

## 7. Branch Scope and Separation of Responsibilities

A branch should represent one coherent feature or task.

For example:

``` text
feature/student-management
```

may contain the related frontend, backend, validation, and tests needed
to deliver Student Management, provided the changes remain within that
feature's agreed scope.

Do not create a separate branch for every file or layer by default.
Split work only when the smaller scope can be independently implemented,
tested, reviewed, and integrated.

Keep module boundaries clear: - Student Management owns student-related
workflows. - Subject Management owns subject-related workflows. -
Schedule Management owns schedule-related workflows. - Learning Records
owns lesson record workflows. - Shared functionality belongs in an
explicitly shared layer or module.

A feature branch does not justify placing unrelated responsibilities
inside the feature.

## 8. Pull Request Checklist

Before merging, verify:

-   [ ] Branch name follows the naming convention.
-   [ ] Changes match the branch scope.
-   [ ] No unrelated changes are included.
-   [ ] Code follows the project's separation-of-concerns standards.
-   [ ] No secrets or credentials are committed.
-   [ ] Input validation and error handling are covered where relevant.
-   [ ] Relevant tests pass.
-   [ ] Linting and formatting checks pass.
-   [ ] Documentation is updated when required.
-   [ ] No unresolved merge conflicts remain.
-   [ ] Target branch is correct.

## 9. Recommended Repository Branches

At the beginning of development, the long-lived branches are:

``` text
main
develop
```

Feature, fix, refactor, and documentation branches are created only when
needed.

Example feature branches as the project progresses:

``` text
feature/authentication
feature/student-management
feature/subject-management
feature/schedule-management
feature/learning-records
feature/dashboard
feature/parent-reports
feature/settings
feature/public-landing-page
```

This is an illustrative list, not a requirement to create all branches
immediately.

## 10. Relationship to Project Documentation

This workflow is maintained as a standalone document:

-   `git_workflow.md`: detailed branching, commit, review, and merge
    rules.
-   `README.md`: concise summary of the Git workflow and link/reference
    to this document.
-   `edulearn_mvp_documentation.md`: approved product scope and MVP
    requirements.

Keep each document focused on its own responsibility. Do not duplicate
the full workflow in the MVP specification.

------------------------------------------------------------------------

## 11. Core Rule

**Every branch has a clear scope. Every commit explains a meaningful
change. Every merge passes the appropriate checks.**

The objective is not to add process for its own sake. The objective is
to keep EduLearn's codebase stable, understandable, testable, and
maintainable as the project grows.
