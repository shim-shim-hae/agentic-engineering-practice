const { db } = require('../connection');

/**
 * @description Finds tasks, newest first, with optional filters and pagination.
 * @param {Object} [filters] - Optional filters and paging options
 * @param {string} [filters.status] - Only tasks with this status
 * @param {number} [filters.projectId] - Only tasks in this project
 * @param {number} [filters.assigneeId] - Only tasks assigned to this user
 * @param {number} [filters.limit=20] - Maximum number of rows to return
 * @param {number} [filters.offset=0] - Number of rows to skip
 * @returns {Object[]} Matching task rows
 */
function findAll({ status, projectId, assigneeId, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (projectId) {
    conditions.push('project_id = ?');
    params.push(projectId);
  }
  if (assigneeId) {
    conditions.push('assignee_id = ?');
    params.push(assigneeId);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(params);
}

/**
 * @description Finds a single task by ID.
 * @param {number} id - ID of the task
 * @returns {Object|undefined} The task row, or undefined if not found
 */
function findById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * @description Inserts a new task.
 * @param {Object} task - Task fields
 * @param {string} task.title - Task title
 * @param {string|null} task.description - Task description
 * @param {number|null} task.projectId - ID of the parent project
 * @param {number|null} task.assigneeId - ID of the assigned user
 * @param {string|null} task.dueDate - Due date
 * @returns {Object} The newly created task row
 */
function insert({ title, description, projectId, assigneeId, dueDate }) {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, projectId, assigneeId, dueDate);
  return findById(result.lastInsertRowid);
}

/**
 * @description Overwrites all editable fields of a task.
 * @param {number} id - ID of the task
 * @param {Object} fields - New field values
 * @param {string} fields.title - Task title
 * @param {string|null} fields.description - Task description
 * @param {string} fields.status - Task status
 * @param {number|null} fields.projectId - ID of the parent project
 * @param {number|null} fields.assigneeId - ID of the assigned user
 * @param {string|null} fields.dueDate - Due date
 * @param {string|null} fields.completedAt - Completion timestamp
 * @returns {Object|undefined} The updated task row
 */
function update(id, { title, description, status, projectId, assigneeId, dueDate, completedAt }) {
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(title, description, status, projectId, assigneeId, dueDate, completedAt, id);
  return findById(id);
}

/**
 * @description Deletes a task by ID.
 * @param {number} id - ID of the task
 * @returns {number} Number of rows deleted (0 if not found)
 */
function remove(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes;
}

/**
 * @description Counts the tasks in a project grouped by status.
 * @param {number} projectId - ID of the project
 * @returns {Object[]} Rows of { status, count }
 */
function countByStatusForProject(projectId) {
  return db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
}

module.exports = { findAll, findById, insert, update, remove, countByStatusForProject };
