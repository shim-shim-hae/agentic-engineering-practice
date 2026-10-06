const { db } = require('../connection');

function findAll() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

function findById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function insert(name, description, ownerId) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findById(result.lastInsertRowid);
}

function update(id, name, description, ownerId) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findById(id);
}

function remove(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes;
}

module.exports = { findAll, findById, insert, update, remove };
