const { db } = require('../connection');

function findById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

function countByStatusForProject(projectId) {
  return db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
}

module.exports = { findById, countByStatusForProject };
