/**
 * @description Express error middleware that responds with a JSON error using the error's status code.
 * @param {Error} err - The error that was thrown
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next callback
 * @returns {void} Nothing; sends the JSON error response
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err.stack || err);
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
