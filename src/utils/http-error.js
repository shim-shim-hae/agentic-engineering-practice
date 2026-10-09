/**
 * @description Creates an Error carrying an HTTP status code.
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} Error with a status property
 */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { httpError };
