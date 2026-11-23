# EduLearn Git Workflow

## 1. Branch

EduLearn uses a simple feature branch workflow.

| Branch | Purpose |
|---|---|
| `main` | Stable version of the application |
| `develop` | Integration branch for development |
| `feature/*` | Development of a specific feature |

Create a feature branch from `develop` when starting new work. Do not create all feature branches in advance.

### Frontend branch examples

```bash
feature/frontend
feature/frontend-authentication
feature/frontend-dashboard
feature/frontend-student-management
```

Use one branch for one coherent feature. Do not create a separate branch for every file or component.

## 2. Development Workflow

1. Switch to the latest `develop` branch.
2. Create a feature branch.
3. Implement and test the feature.
4. Commit changes using Conventional Commits.
5. Push the feature branch to the remote repository.
6. Create a Pull Request targeting `develop`.
7. Merge after review and relevant checks pass.

Example:

```bash
git switch develop
git pull origin develop
git switch -c feature/frontend
```

Push the branch:

```bash
git push -u origin feature/frontend
```

## 3. Conventional Commits

Use this format:

```text
<type>: <description>
```

Common commit types:

| Type | Purpose |
|---|---|
| `feat` | Add a feature |
| `fix` | Fix a bug |
| `docs` | Update documentation |
| `style` | Formatting or styling changes |
| `refactor` | Improve code structure without changing behavior |
| `test` | Add or update tests |
| `chore` | Tooling or maintenance tasks |

Examples:

```bash
git commit -m "feat: create frontend foundation"
git commit -m "feat: add login page"
git commit -m "fix: handle authentication errors"
git commit -m "style: improve dashboard layout"
git commit -m "refactor: separate student API service"
git commit -m "docs: update frontend setup guide"
git commit -m "chore: install lucide react"
```

Keep commit messages short and describe the actual change. Avoid vague messages such as `update`, `changes`, or `fix`.

## 4. Basic Rules

- Do not develop features directly on `main`.
- Create feature branches from `develop`.
- Keep each branch focused on one feature.
- Use Conventional Commits for all commits.
- Test relevant changes before opening a Pull Request.
- Merge feature branches into `develop`.
- Merge `develop` into `main` when the application is ready for release.
