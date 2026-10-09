/**
 * @description Reports service health with the current timestamp.
 * @returns {Object} { status, timestamp }
 */
function getHealth() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

module.exports = { getHealth };
