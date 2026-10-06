/*
 * routes.js
 *
 * All API routes for Taskr. This file handles users, projects, tasks, comments,
 * and tags. Route handlers query the database directly — there is no service
 * layer. Validation is inline in each handler. This file is long by design.
 *
 * TODO: split into separate route files per resource
 * TODO: extract database queries into a repository layer
 * TODO: extract validation into shared middleware
 */

const express = require('express');
const router = express.Router();
const { db } = require('./src/db/connection');
const { authenticate } = require('./src/middleware/auth');
const { getTasks, getTaskById } = require('./get-tasks');
const { validateEmail, isNonEmptyString } = require('./src/utils/validation');
const { VALID_TASK_STATUSES } = require('./src/utils/constants');

// ─── Tasks ────────────────────────────────────────────────────────────────────

router.get('/tasks', (req, res) => {
  const { status, project_id, assignee_id, page, page_size } = req.query;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_TASK_STATUSES.join(', ')}` });
  }

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  const tasks = getTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
  res.json(tasks);
});

router.post('/tasks', (req, res) => {
  const { title, description, project_id, assignee_id, due_date } = req.body;
  if (!title || !isNonEmptyString(title)) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (project_id) {
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(parseInt(project_id));
    if (!project) return res.status(400).json({ error: 'project not found' });
  }
  if (assignee_id) {
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(parseInt(assignee_id));
    if (!user) return res.status(400).json({ error: 'assignee not found' });
  }
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(
    title,
    description || null,
    project_id ? parseInt(project_id) : null,
    assignee_id ? parseInt(assignee_id) : null,
    due_date || null
  );
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

router.get('/tasks/:id', (req, res) => {
  const task = getTaskById(parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, project_id, assignee_id, due_date } = req.body;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_TASK_STATUSES.join(', ')}` });
  }

  const updatedTitle = title !== undefined ? title : existing.title;
  const updatedDesc = description !== undefined ? description : existing.description;
  const updatedStatus = status !== undefined ? status : existing.status;
  const updatedProject = project_id !== undefined ? project_id : existing.project_id;
  const updatedAssignee = assignee_id !== undefined ? assignee_id : existing.assignee_id;
  const updatedDue = due_date !== undefined ? due_date : existing.due_date;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(updatedTitle, updatedDesc, updatedStatus, updatedProject, updatedAssignee, updatedDue, completedAt, id);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(task);
});

router.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ deleted: true });
});

// ─── Helper exported for projectHelpers.js (creates circular dep risk) ────────

function getTasksForProject(projectId) {
  return db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
}

module.exports = router;
module.exports.getTasksForProject = getTasksForProject;
