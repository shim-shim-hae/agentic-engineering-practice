/**
 * @description Stub handler that logs a task-update webhook payload.
 * @param {Object} payload - Webhook request body
 * @returns {Object} { received: true }
 */
function handleTaskUpdate(payload) {
  // TODO: process webhook payload
  console.log('[WEBHOOK] Received:', payload);
  return { received: true };
}

module.exports = { handleTaskUpdate };
