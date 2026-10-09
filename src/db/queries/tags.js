const { db } = require('../connection');

/**
 * @description Finds all tags, sorted alphabetically by name.
 * @returns {Object[]} All tag rows
 */
function findAll() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Finds a single tag by ID.
 * @param {number} id - ID of the tag
 * @returns {Object|undefined} The tag row, or undefined if not found
 */
function findById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

/**
 * @description Inserts a new tag.
 * @param {string} name - Tag name
 * @returns {Object} The newly created tag row
 */
function insert(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findById(result.lastInsertRowid);
}

/**
 * @description Finds all tags applied to a task.
 * @param {number} taskId - ID of the task
 * @returns {Object[]} Tag rows linked to the task
 */
function findByTaskId(taskId) {
  return db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(taskId);
}

/**
 * @description Applies a tag to a task.
 * @param {number} taskId - ID of the task
 * @param {number} tagId - ID of the tag
 * @returns {void} Nothing
 */
function linkToTask(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Removes a tag from a task.
 * @param {number} taskId - ID of the task
 * @param {number} tagId - ID of the tag
 * @returns {number} Number of rows deleted (0 if the link did not exist)
 */
function unlinkFromTask(taskId, tagId) {
  return db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId).changes;
}

module.exports = { findAll, findById, insert, findByTaskId, linkToTask, unlinkFromTask };
