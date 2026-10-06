const { db } = require('../connection');

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

function findById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

function insert({ title, description, projectId, assigneeId, dueDate }) {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, projectId, assigneeId, dueDate);
  return findById(result.lastInsertRowid);
}

function update(id, { title, description, status, projectId, assigneeId, dueDate, completedAt }) {
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(title, description, status, projectId, assigneeId, dueDate, completedAt, id);
  return findById(id);
}

function remove(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes;
}

function countByStatusForProject(projectId) {
  return db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
}

module.exports = { findAll, findById, insert, update, remove, countByStatusForProject };
