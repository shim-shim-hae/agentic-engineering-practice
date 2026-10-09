/**
 * @description Express middleware that logs the timestamp, method and URL of each request.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next callback
 * @returns {void} Nothing; calls next()
 */
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

module.exports = { requestLogger };
