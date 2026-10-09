# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Taskr is a REST API for task management (users, projects, tasks, comments, tags) built with Node.js, Express 5 and SQLite (`better-sqlite3`). It is plain CommonJS with no build step, no linter and no formatter.

## Context files

- Before adding or changing an API endpoint, read `.claude/context/api-conventions.md`. It covers where route files, services, queries and router registration go.
- Before writing or changing tests, read `.claude/context/testing-standards.md`. It covers file naming, the test file skeleton, and required coverage per endpoint.

## Commands

```bash
npm install
npm run db:seed        # creates taskr.db with schema + sample data (skips if already seeded)
npm run db:reset       # rm -f taskr.db && re-seed (needs a POSIX shell; fails in plain PowerShell)
npm run dev            # node --watch index.js, port 3000 (PORT env overrides)
npm test               # jest, whole suite
npx jest tests/tasks.test.js                  # one test file
npx jest tests/tasks.test.js -t "filters by"  # one test by name
```

## Verification

After completing any significant change, run the `/verify-app` command **before committing**. It runs `npm test -- --runInBand` and fixes failures until the suite passes.

- **Do not commit if any test fails.**
- The tests use supertest to exercise the API endpoints directly against an in-memory SQLite database. A passing run confirms that the app works correctly for the endpoints they cover: users, projects and tasks.
- Comments, tags, health and webhooks have no tests yet. For changes to those, a pass doesn't prove they work, so add tests or check them manually.

## Architecture

Requests flow through four layers, and each layer calls only the one below it:

```
routes  →  services  →  queries  →  db (SQLite)
```

- **Routes** handle HTTP only.
- **Services** hold validation and business logic.
- **Queries** hold the SQL.
- **The db** is the single shared `better-sqlite3` connection.

File names are kebab-case, and each resource has a same-named file in every layer.

### Folder structure

```
index.js                    app setup: mounts routers, errorHandler last, exports the app
db/
  seed.js                   creates the schema and sample data for local use
src/
  routes/                   health, webhooks, users, projects, tasks, comments, tags
  services/                 health, webhooks, users, projects, tasks, comments, tags, email
  db/
    connection.js           opens the SQLite connection
    schema.js               createSchema(db), shared by seed.js and the tests
    queries/                users, projects, tasks, comments, tags
  middleware/               auth, request-logger, error-handler
  utils/                    constants, validation, http-error
tests/                      users.test.js, projects.test.js, tasks.test.js
```

### Layers

- **`index.js`** (repo root) builds the Express app, mounts every router, puts `errorHandler` last and exports the app. It only calls `listen` when run directly (`require.main === module`), so supertest can import the app. `GET /` is defined inline here.
- **`src/routes/`** has one file per resource, each exporting a named router. Handlers parse params, call one service function and call `next(err)` on failure. `tags.js` exports two routers: `tagsRouter` (`/tags`) and `taskTagsRouter` (`/tasks/:taskId/tags`). Nested routers (`comments.js`, `taskTagsRouter`) use `mergeParams: true` and are mounted before `/tasks` in `index.js`.
- **`src/services/`** holds validation and business logic. Services throw `httpError(status, message)` (`src/utils/http-error.js`) and import only from `src/db/queries`. `users.js` also calls `email.js`, which is a stub that only logs.
- **`src/db/queries/`** is the only place SQL lives (apart from `db/seed.js`). Queries use the connection from `src/db/connection.js`, which uses `:memory:` when `NODE_ENV=test`, otherwise `DB_PATH` or `taskr.db`, and enables WAL and `foreign_keys = ON`.
- **`src/middleware/`:**
  - `auth.js` is a placeholder that checks the `x-api-key` header against `API_KEY` (default `dev-key`). It is applied only to `DELETE /users/:id` and `DELETE /projects/:id`. Other routes, including `DELETE /tasks/:id`, are unauthenticated.
  - `error-handler.js` returns `{ error: message }` with `err.status || 500` and logs stacks only for 5xx.
  - `request-logger.js` logs each request.
- **`src/utils/`:** `constants.js` (`PORT`, `VALID_TASK_STATUSES`), `validation.js`, `http-error.js`.

## Gotchas

- **Task statuses are defined in two places**: `VALID_TASK_STATUSES` in `src/utils/constants.js` and the `CHECK` constraint in `src/db/schema.js`. Keep them in sync.
- **Each test file sets `process.env.NODE_ENV = 'test'` itself**, before requiring the app, and clears the tables in `beforeEach`. Test files must be named `resource.test.js` (e.g. `users.test.js`).
- **Error response shape is `{ error: message }`** with 400/404/409 status codes. Unique-constraint violations are detected by matching `'UNIQUE'` in the SQLite error message and returned as 409 by the service.

## Never do this

- Never put SQL outside `src/db/queries/`, and never import `src/db/connection.js` from a service or a route.
- Never put business logic or validation in a route handler. It belongs in a service.
- Never add a generic catch-all helper file. Put utilities in a specific module under `src/utils/`, and check whether an existing one already fits.
