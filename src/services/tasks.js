const tasksQueries = require('../db/queries/tasks');
const projectsQueries = require('../db/queries/projects');
const usersQueries = require('../db/queries/users');
const tagsQueries = require('../db/queries/tags');
const commentsQueries = require('../db/queries/comments');
const { isNonEmptyString } = require('../utils/validation');
const { VALID_TASK_STATUSES } = require('../utils/constants');
const { httpError } = require('../utils/http-error');

function assertValidStatus(status) {
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    throw httpError(400, `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }
}

function listTasks({ status, project_id, assignee_id, page, page_size }) {
  assertValidStatus(status);

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  return tasksQueries.findAll({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (!title || !isNonEmptyString(title)) throw httpError(400, 'title is required');
  if (project_id && !projectsQueries.findById(parseInt(project_id))) {
    throw httpError(400, 'project not found');
  }
  if (assignee_id && !usersQueries.findById(parseInt(assignee_id))) {
    throw httpError(400, 'assignee not found');
  }
  return tasksQueries.insert({
    title,
    description: description || null,
    projectId: project_id ? parseInt(project_id) : null,
    assigneeId: assignee_id ? parseInt(assignee_id) : null,
    dueDate: due_date || null
  });
}

function getTaskById(id) {
  const task = tasksQueries.findById(id);
  if (!task) throw httpError(404, 'Task not found');
  task.tags = tagsQueries.findByTaskId(id);
  task.comments = commentsQueries.findByTaskId(id);
  return task;
}

function updateTask(id, { title, description, status, project_id, assignee_id, due_date }) {
  const existing = tasksQueries.findById(id);
  if (!existing) throw httpError(404, 'Task not found');

  assertValidStatus(status);

  const updatedStatus = status !== undefined ? status : existing.status;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  return tasksQueries.update(id, {
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: updatedStatus,
    projectId: project_id !== undefined ? project_id : existing.project_id,
    assigneeId: assignee_id !== undefined ? assignee_id : existing.assignee_id,
    dueDate: due_date !== undefined ? due_date : existing.due_date,
    completedAt
  });
}

function deleteTask(id) {
  if (tasksQueries.remove(id) === 0) throw httpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, createTask, getTaskById, updateTask, deleteTask };
