const projectsQueries = require('../db/queries/projects');
const tasksQueries = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Summarises the number of tasks in a project by status.
 * @param {number} projectId - ID of the project
 * @returns {Object} Counts as { total, active, completed, archived }
 */
function getProjectStats(projectId) {
  const rows = tasksQueries.countByStatusForProject(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * @description Lists all projects.
 * @returns {Object[]} All projects, newest first
 */
function listProjects() {
  return projectsQueries.findAll();
}

/**
 * @description Validates input and creates a project.
 * @param {Object} data - Project fields
 * @param {string} data.name - Project name
 * @param {string} [data.description] - Project description
 * @param {number} [data.owner_id] - ID of the owning user
 * @returns {Object} The newly created project
 */
function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  return projectsQueries.insert(name, description || null, owner_id || null);
}

/**
 * @description Gets a project together with its task statistics.
 * @param {number} id - ID of the project
 * @returns {Object} The project with a stats field
 */
function getProjectById(id) {
  const project = projectsQueries.findById(id);
  if (!project) throw httpError(404, 'Project not found');
  return { ...project, stats: getProjectStats(id) };
}

/**
 * @description Updates a project, keeping existing values for fields not supplied.
 * @param {number} id - ID of the project
 * @param {Object} data - Fields to change
 * @param {string} [data.name] - New project name
 * @param {string} [data.description] - New project description
 * @param {number} [data.owner_id] - ID of the new owning user
 * @returns {Object} The updated project
 */
function updateProject(id, data) {
  const existing = projectsQueries.findById(id);
  if (!existing) throw httpError(404, 'Project not found');

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectsQueries.update(id, name, description, ownerId);
}

/**
 * @description Deletes a project.
 * @param {number} id - ID of the project
 * @returns {Object} { deleted: true }
 */
function deleteProject(id) {
  if (projectsQueries.remove(id) === 0) throw httpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProjectById, updateProject, deleteProject };
