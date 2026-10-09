const commentsQueries = require('../db/queries/comments');
const tasksQueries = require('../db/queries/tasks');
const usersQueries = require('../db/queries/users');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Lists the comments on a task.
 * @param {number} taskId - ID of the task
 * @returns {Object[]} Comments on the task, oldest first
 */
function listComments(taskId) {
  if (!tasksQueries.findById(taskId)) throw httpError(404, 'Task not found');
  return commentsQueries.findByTaskId(taskId);
}

/**
 * @description Validates input and creates a comment on a task.
 * @param {number} taskId - ID of the task
 * @param {Object} data - Comment fields
 * @param {number|string} data.user_id - ID of the comment author
 * @param {string} data.body - Comment text
 * @returns {Object} The newly created comment
 */
function createComment(taskId, { user_id, body }) {
  if (!tasksQueries.findById(taskId)) throw httpError(404, 'Task not found');

  if (!body || !isNonEmptyString(body)) throw httpError(400, 'body is required');
  if (!user_id) throw httpError(400, 'user_id is required');
  const userId = parseInt(user_id);
  if (!usersQueries.findById(userId)) throw httpError(400, 'user not found');

  return commentsQueries.insert(taskId, userId, body);
}

module.exports = { listComments, createComment };
