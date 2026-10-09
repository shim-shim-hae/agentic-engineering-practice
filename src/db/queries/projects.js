const { db } = require('../connection');

/**
 * @description Finds all projects, newest first.
 * @returns {Object[]} All project rows
 */
function findAll() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Finds a single project by ID.
 * @param {number} id - ID of the project
 * @returns {Object|undefined} The project row, or undefined if not found
 */
function findById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Inserts a new project.
 * @param {string} name - Project name
 * @param {string|null} description - Project description
 * @param {number|null} ownerId - ID of the owning user
 * @returns {Object} The newly created project row
 */
function insert(name, description, ownerId) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findById(result.lastInsertRowid);
}

/**
 * @description Overwrites the name, description and owner of a project.
 * @param {number} id - ID of the project
 * @param {string} name - New project name
 * @param {string|null} description - New project description
 * @param {number|null} ownerId - ID of the new owning user
 * @returns {Object|undefined} The updated project row
 */
function update(id, name, description, ownerId) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findById(id);
}

/**
 * @description Deletes a project by ID.
 * @param {number} id - ID of the project
 * @returns {number} Number of rows deleted (0 if not found)
 */
function remove(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes;
}

module.exports = { findAll, findById, insert, update, remove };
