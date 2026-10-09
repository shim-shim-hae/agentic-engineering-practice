// TODO: replace with real JWT validation

/**
 * @description Express middleware that allows the request only if its x-api-key header matches the configured API key.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next callback
 * @returns {void} Nothing; calls next() or responds with 401
 */
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authenticate };
