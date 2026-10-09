const usersQueries = require('../db/queries/users');
const { sendEmail } = require('./email');
const { validateEmail, isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Lists all users.
 * @returns {Object[]} All users, newest first
 */
function listUsers() {
  return usersQueries.findAll();
}

/**
 * @description Gets a user by ID.
 * @param {number} id - ID of the user
 * @returns {Object} The user
 */
function getUserById(id) {
  const user = usersQueries.findById(id);
  if (!user) throw httpError(404, 'User not found');
  return user;
}

/**
 * @description Validates input, creates a user and sends a welcome email.
 * @param {Object} data - User fields
 * @param {string} data.name - User name
 * @param {string} data.email - User email address
 * @returns {Promise<Object>} Resolves with the newly created user
 */
async function createUser({ name, email }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  if (!email || !isNonEmptyString(email)) throw httpError(400, 'email is required');
  if (!validateEmail(email)) throw httpError(400, 'Invalid email address');

  let user;
  try {
    user = usersQueries.insert(name, email);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      throw httpError(409, 'email already exists');
    }
    throw err;
  }

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });

  return user;
}

/**
 * @description Updates a user, keeping existing values for fields not supplied.
 * @param {number} id - ID of the user
 * @param {Object} data - Fields to change
 * @param {string} [data.name] - New user name
 * @param {string} [data.email] - New email address
 * @returns {Object} The updated user
 */
function updateUser(id, data) {
  const existing = usersQueries.findById(id);
  if (!existing) throw httpError(404, 'User not found');
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return usersQueries.update(id, name, email);
}

/**
 * @description Deletes a user.
 * @param {number} id - ID of the user
 * @returns {Object} { deleted: true }
 */
function deleteUser(id) {
  if (usersQueries.remove(id) === 0) throw httpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
