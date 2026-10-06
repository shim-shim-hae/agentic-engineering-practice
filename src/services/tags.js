const tagsQueries = require('../db/queries/tags');
const tasksQueries = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

function isUniqueViolation(err) {
  return err.message && err.message.includes('UNIQUE');
}

function listTags() {
  return tagsQueries.findAll();
}

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

function removeTagFromTask(taskId, tagId) {
  if (tagsQueries.unlinkFromTask(taskId, tagId) === 0) {
    throw httpError(404, 'Tag not applied to this task');
  }
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
