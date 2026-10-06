const usersQueries = require('../db/queries/users');
const { sendEmail } = require('./email');
const { validateEmail, isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

function listUsers() {
  return usersQueries.findAll();
}

function getUserById(id) {
  const user = usersQueries.findById(id);
  if (!user) throw httpError(404, 'User not found');
  return user;
}

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

function updateUser(id, data) {
  const existing = usersQueries.findById(id);
  if (!existing) throw httpError(404, 'User not found');
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return usersQueries.update(id, name, email);
}

function deleteUser(id) {
  if (usersQueries.remove(id) === 0) throw httpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
