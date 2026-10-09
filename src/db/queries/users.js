const { db } = require('../connection');

/**
 * @description Finds all users, newest first.
 * @returns {Object[]} All user rows
 */
function findAll() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * @description Finds a single user by ID.
 * @param {number} id - ID of the user
 * @returns {Object|undefined} The user row, or undefined if not found
 */
function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Inserts a new user.
 * @param {string} name - User name
 * @param {string} email - User email address
 * @returns {Object} The newly created user row
 */
function insert(name, email) {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
  return findById(result.lastInsertRowid);
}

/**
 * @description Overwrites the name and email of a user.
 * @param {number} id - ID of the user
 * @param {string} name - New user name
 * @param {string} email - New email address
 * @returns {Object|undefined} The updated user row
 */
function update(id, name, email) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return findById(id);
}

/**
 * @description Deletes a user by ID.
 * @param {number} id - ID of the user
 * @returns {number} Number of rows deleted (0 if not found)
 */
function remove(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
}

module.exports = { findAll, findById, insert, update, remove };
