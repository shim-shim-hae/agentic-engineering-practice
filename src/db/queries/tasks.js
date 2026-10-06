const { db } = require('../connection');

function findById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

module.exports = { findById };
