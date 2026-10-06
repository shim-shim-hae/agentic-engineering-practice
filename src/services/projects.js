const projectsQueries = require('../db/queries/projects');
const tasksQueries = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

function getProjectStats(projectId) {
  const rows = tasksQueries.countByStatusForProject(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

function listProjects() {
  return projectsQueries.findAll();
}

function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  return projectsQueries.insert(name, description || null, owner_id || null);
}

function getProjectById(id) {
  const project = projectsQueries.findById(id);
  if (!project) throw httpError(404, 'Project not found');
  return { ...project, stats: getProjectStats(id) };
}

function updateProject(id, data) {
  const existing = projectsQueries.findById(id);
  if (!existing) throw httpError(404, 'Project not found');

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectsQueries.update(id, name, description, ownerId);
}

function deleteProject(id) {
  if (projectsQueries.remove(id) === 0) throw httpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProjectById, updateProject, deleteProject };
