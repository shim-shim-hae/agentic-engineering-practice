/**
 * @description Checks that a string looks like an email address.
 * @param {string} email - Value to check
 * @returns {boolean} True if the value matches a basic email pattern
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @description Checks that a value is a string with non-whitespace content.
 * @param {*} val - Value to check
 * @returns {boolean} True if val is a non-blank string
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

module.exports = { validateEmail, isNonEmptyString };
