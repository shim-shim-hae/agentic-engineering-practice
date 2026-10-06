# Testing Standards: Writing API Tests

Follow this when writing tests for the API.

## Setup

- Tests use **Jest** and **supertest**, run against an **in-memory SQLite database**. No external setup is required.
- The whole suite must run with `npm test` and nothing else. Don't add steps like seeding a database, starting a server or setting environment variables outside the test files.

## File naming

- Test files live in `tests/` and are named `resource.test.js`, in lowercase: `users.test.js`, `tasks.test.js`, `projects.test.js`.
- One file per resource.
- The table schema comes from `src/db/schema.js` (`createSchema`). Don't define tables in test files.

## File skeleton

Set `NODE_ENV` to `test` **before** requiring the app. That makes `src/db/connection.js` use `:memory:`. Build the tables once, and reset the data before each test so tests stay independent:

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../src/db/connection');
const { createSchema } = require('../src/db/schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  // insert only the rows this file's tests need
});
```

- Test through HTTP with supertest (`request(app).get('/tasks')`). Don't call handlers or services directly.
- Insert fixture data with `db.prepare(...)` in the test or in `beforeEach`. Don't depend on `db/seed.js` or on a `taskr.db` file.
- Tests must not depend on each other or on execution order.

## Coverage

For **every endpoint**, write:

1. **A happy-path test**, with the expected status code and response body.
2. **At least two error-case tests**, such as:
   - missing or invalid input (400)
   - a resource that doesn't exist (404)
   - a duplicate that violates a unique constraint (409)
   - a missing or wrong `x-api-key` on authenticated routes (401)

Assert both the status code and the `error` field in the body: `expect(res.body.error).toBeDefined()`.

## Test descriptions

- Describe what the endpoint does, in plain English. Group tests with `describe('METHOD /path', ...)`.
- Good: `'returns only active tasks when filtering by status=active'`, `'returns 404 when the task does not exist'`
- Bad: `'test 1'`, `'works'`, `'handles edge case'`, or descriptions that name internal functions.

## Before you finish

- Run `npm test` and confirm the whole suite passes, not only the new file.
- Run a single file with `npx jest tests/<resource>.test.js`.
