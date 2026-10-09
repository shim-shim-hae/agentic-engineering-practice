const tagsQueries = require('../db/queries/tags');
const tasksQueries = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Checks whether a database error is a UNIQUE constraint violation.
 * @param {Error} err - The error to inspect
 * @returns {boolean} True if the error message mentions UNIQUE
 */
function isUniqueViolation(err) {
  return err.message && err.message.includes('UNIQUE');
}

/**
 * @description Lists all tags.
 * @returns {Object[]} All tags, sorted by name
 */
function listTags() {
  return tagsQueries.findAll();
}

/**
 * @description Validates and creates a tag, normalising its name to trimmed lowercase.
 * @param {string} name - Tag name
 * @returns {Object} The newly created tag
 */
function createTag(name) {
  if (!name || !isNonEmptyString(name)) {
    throw httpError(400, 'name is required');
  }
  try {
    return tagsQueries.insert(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already exists');
    throw err;
  }
}

/**
 * @description Applies an existing tag to a task.
 * @param {number} taskId - ID of the task
 * @param {number|string} tagId - ID of the tag
 * @returns {Object} The link as { task_id, tag_id }
 */
function addTagToTask(taskId, tagId) {
  if (!tasksQueries.findById(taskId)) throw httpError(404, 'Task not found');

  if (!tagId) throw httpError(400, 'tag_id is required');
  const parsedTagId = parseInt(tagId);
  if (!tagsQueries.findById(parsedTagId)) throw httpError(404, 'Tag not found');

  try {
    tagsQueries.linkToTask(taskId, parsedTagId);
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already applied to this task');
    throw err;
  }
  return { task_id: taskId, tag_id: parsedTagId };
}

/**
 * @description Removes a tag from a task.
 * @param {number} taskId - ID of the task
 * @param {number} tagId - ID of the tag
 * @returns {Object} { deleted: true }
 */
function removeTagFromTask(taskId, tagId) {
  if (tagsQueries.unlinkFromTask(taskId, tagId) === 0) {
    throw httpError(404, 'Tag not applied to this task');
  }
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
