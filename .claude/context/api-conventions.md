# API Conventions: Adding a New Endpoint

Follow this when adding or changing an API endpoint. The code is layered: **routes call services, services call queries**. Nothing else touches the database.

```
index.js                 app setup, mounts every router, errorHandler last
src/routes/<resource>.js       HTTP only: parse params, call a service, send the response
src/services/<resource>.js     validation and business logic; throws {status, message} errors
src/db/queries/<resource>.js   SQL only; the only place db.prepare is used (besides db/seed.js)
```

## Steps

1. **Queries:** add any SQL as functions in `src/db/queries/<resource>.js`.
2. **Service:** add the logic as a function in `src/services/<resource>.js`. It calls queries and never imports `src/db/connection.js`.
3. **Route file:** add the route to `src/routes/<resource>.js`, creating the file if the resource is new.
4. **Registration:** register the router in `index.js`.
5. **Tests:** add them in `tests/<resource>.test.js`.

## Rules

### Route files
- Each resource gets its own file in `src/routes/`.
- The file name is the resource name, **lowercase and plural**, in kebab-case: `users.js`, `tasks.js`, `projects.js`.
- Each file exports a **named** Express router:

```js
// src/routes/tasks.js
const express = require('express');
const tasksService = require('../services/tasks');

const tasksRouter = express.Router();

tasksRouter.get('/', (req, res, next) => {
  try {
    res.json(tasksService.listTasks(req.query));
  } catch (err) {
    next(err);
  }
});

module.exports = { tasksRouter };
```

- A router for a nested resource is created with `express.Router({ mergeParams: true })` so it can read the parent's params. For example, `commentsRouter` is mounted at `/tasks/:taskId/comments` and reads `req.params.taskId`.

### Handlers call services
- A route handler only reads the request, calls **one corresponding function in `src/services/`**, and sends the response. Parsing path params (`parseInt(req.params.id)`) is fine in the handler.
- Business logic and validation belong in the service. SQL belongs in `src/db/queries/`.

### Errors
- Handlers never send error responses themselves. They pass errors to Express's `next` function.
- Services throw errors with a status code and a message using `httpError(status, message)` from `src/utils/http-error.js`, for example `throw httpError(404, 'Task not found')`. The handler's `catch` forwards it with `next(err)`.
- The shared `errorHandler` in `src/middleware/error-handler.js` turns it into the `{ error: message }` response.

### Registration
- Every router is registered in `index.js` with `app.use`, the resource path and the imported router:

```js
const { tasksRouter } = require('./src/routes/tasks');

app.use('/tasks', tasksRouter);
```

- Register routers before `errorHandler`, which must stay last.
- Paths inside a router are relative to the mount path (`'/'`, `'/:id'`), not the full resource path.
- Mount more specific nested paths (`/tasks/:taskId/comments`) before the parent (`/tasks`).

## Checklist

- [ ] Route file is `src/routes/<resource>.js`, lowercase and plural
- [ ] It exports a named router (`{ <resource>Router }`)
- [ ] Handlers contain no business logic and call a function in `src/services/`
- [ ] Services call `src/db/queries/` and don't touch the connection directly
- [ ] Errors are thrown with `httpError` and passed on with `next(err)`
- [ ] The router is registered in `index.js` with `app.use('/<resource>', <resource>Router)`
- [ ] Tests are in `tests/<resource>.test.js`
