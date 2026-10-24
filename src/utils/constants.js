/**
 * @description Port the HTTP server listens on (PORT env var, default 3000).
 * @type {string|number}
 */
const PORT = process.env.PORT || 3000;
/**
 * @description Allowed values for a task's status; keep in sync with the CHECK constraint in schema.js.
 * @type {string[]}
 */
const VALID_TASK_STATUSES = ['active', 'completed', 'archived'];

module.exports = { PORT, VALID_TASK_STATUSES };
