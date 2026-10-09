const { db } = require('../connection');

const WITH_USER_NAME = 'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id';

/**
 * @description Finds all comments on a task, oldest first, including each author's name.
 * @param {number} taskId - ID of the task
 * @returns {Object[]} Comment rows with a user_name field
 */
function findByTaskId(taskId) {
  return db.prepare(`${WITH_USER_NAME} WHERE c.task_id = ? ORDER BY c.created_at ASC`).all(taskId);
}

/**
 * @description Finds a single comment by ID, including the author's name.
 * @param {number} id - ID of the comment
 * @returns {Object|undefined} The comment row, or undefined if not found
 */
function findById(id) {
  return db.prepare(`${WITH_USER_NAME} WHERE c.id = ?`).get(id);
}

/**
 * @description Inserts a new comment on a task.
 * @param {number} taskId - ID of the task being commented on
 * @param {number} userId - ID of the comment author
 * @param {string} body - Comment text
 * @returns {Object} The newly created comment row
 */
function insert(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findById(result.lastInsertRowid);
}

module.exports = { findByTaskId, findById, insert };
