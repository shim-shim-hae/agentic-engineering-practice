# Contributing to Taskr

Taskr is a REST API for task management (users, projects, tasks, comments, tags) built with Node.js, Express 5 and SQLite (`better-sqlite3`). It is plain CommonJS with no build step, linter or formatter.

## Setting up the development environment

You need Node.js and npm. The README says Node 18+ (for `node --watch`); a current LTS release is the safest choice because `better-sqlite3` is a native module. No external database is needed.

```bash
git clone <repo-url>
cd agentic-engineering-practice
npm install
npm run db:seed
npm run dev
```

- `npm run db:seed` creates `taskr.db` with the schema and sample data. It skips if the database is already seeded.
- `npm run dev` starts the server with file watching on port 3000 (set `PORT` to change it). Visit `http://localhost:3000/health` to confirm it is running.
- `npm run db:reset` deletes `taskr.db` and re-seeds it. It uses `rm -f`, so it needs a POSIX shell (Git Bash, WSL, macOS or Linux) and fails in plain PowerShell.

`taskr.db` and its `-shm`/`-wal` files are git-ignored. The test suite never touches them.

### Project layout

Requests flow through four layers, and each layer calls only the one below it:

```
routes  →  services  →  queries  →  db (SQLite)
```

| Layer | Location | Responsibility |
|---|---|---|
| Routes | `src/routes/` | HTTP only: parse params, call one service function, call `next(err)` on failure |
| Services | `src/services/` | Validation and business logic; throw `httpError(status, message)` |
| Queries | `src/db/queries/` | All SQL |
| DB | `src/db/connection.js` | The single shared `better-sqlite3` connection |

Each resource has a same-named, kebab-case file in every layer. Rules to keep in mind:

- Never put SQL outside `src/db/queries/`, and never import `src/db/connection.js` from a service or a route.
- Never put business logic or validation in a route handler.
- Don't add a generic catch-all helper file. Put utilities in a specific module under `src/utils/`.
- Task statuses are defined in two places, `VALID_TASK_STATUSES` in `src/utils/constants.js` and the `CHECK` constraint in `src/db/schema.js`. Keep them in sync.

Before adding or changing an endpoint, read `.claude/context/api-conventions.md`. Before writing or changing tests, read `.claude/context/testing-standards.md`. `CLAUDE.md` has the full architecture notes.

## Commit messages

Commit messages in this repository follow a simple style:

- A single short subject line in the **imperative mood**, starting with a capital letter and with no trailing period: `Add JSDoc to all named functions in src/`, `Extract tags and task-tag routes into routes, services and queries`.
- No type prefix such as `feat:` or `fix:`.
- Say what the commit does, and keep each commit to one logical change.
- Add a body, separated by a blank line, only when the *why* isn't obvious from the subject.

## Running the tests

```bash
npm test                                          # whole suite
npx jest tests/tasks.test.js                      # one file
npx jest tests/tasks.test.js -t "filters by"      # one test by name
npm run test:watch                                # re-run on change
```

The tests use Jest and supertest and exercise the API over HTTP against an in-memory SQLite database (`NODE_ENV=test` makes `src/db/connection.js` use `:memory:`). You don't need to seed a database or start a server first.

### What a passing run looks like

The summary at the end of the output shows every suite and test passing, with nothing failed:

```
Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total
Snapshots:   0 total
```

The suite also prints a `console.log` line for each request from the request logger. That is expected noise, not a failure. Your counts will grow as tests are added; what matters is that there are no `failed` entries and that Jest exits with code 0.

### Coverage limits

Tests exist for users, projects and tasks only. Comments, tags, health and webhooks have no tests yet, so a green run says nothing about them. If you change those, add tests (see `.claude/context/testing-standards.md`) or check the behavior manually.

When you write tests, name files `resource.test.js` in `tests/`, set `process.env.NODE_ENV = 'test'` before requiring the app, and clear the tables in `beforeEach`.

## The `verify-app` command

`/verify-app` is a Claude Code command defined in `.claude/commands/verify-app.md`. It runs `npm test -- --runInBand` (the whole suite, serially) and, if anything fails, reads the failing test and the code it exercises, fixes the **implementation**, and re-runs until everything passes. It never weakens, skips or deletes tests to get a pass, and it stops and reports if the same failure survives three attempts. It finishes with a report: PASS or FAIL, test counts, the fixes made, and any remaining failures.

**Run it after any significant change and always before committing.** If you aren't using Claude Code, run `npm test -- --runInBand` yourself and fix failures the same way.

## Never commit with failing tests

**Do not commit if any test fails.** Run the full suite (not just the file you touched), confirm it passes, and only then commit. If a test fails, fix the code. If you believe the test itself is wrong, say so in the pull request rather than editing it to go green.

A passing suite only covers users, projects and tasks, so for changes elsewhere also add tests or verify manually, as described above.
