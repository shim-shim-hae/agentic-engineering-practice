const { db } = require('../connection');

const WITH_USER_NAME = 'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id';

function findByTaskId(taskId) {
  return db.prepare(`${WITH_USER_NAME} WHERE c.task_id = ? ORDER BY c.created_at ASC`).all(taskId);
}

function findById(id) {
  return db.prepare(`${WITH_USER_NAME} WHERE c.id = ?`).get(id);
}

function insert(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findById(result.lastInsertRowid);
}

module.exports = { findByTaskId, findById, insert };
