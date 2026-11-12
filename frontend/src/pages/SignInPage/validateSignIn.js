/**
 * @file Sign-in form checks: both fields must be filled in.
 */

export const EMAIL_REQUIRED_MESSAGE = "Enter your email.";
export const PASSWORD_REQUIRED_MESSAGE = "Enter your password.";

/**
 * Returns whether a field value is empty or holds only spaces.
 *
 * @param {string} value - Field value.
 * @returns {boolean} True when the value has no visible characters.
 */
const isBlank = (value) => value.trim() === "";

/**
 * Returns the sign-in form's errors keyed by field name; an empty object means the form is valid.
 *
 * @param {{email: string, password: string}} values - Current form values.
 * @returns {Record<string, string>} Error message of each invalid field.
 */
export function validateSignIn({ email, password }) {
  const errors = {};
  if (isBlank(email)) {
    errors.email = EMAIL_REQUIRED_MESSAGE;
  }
  if (isBlank(password)) {
    errors.password = PASSWORD_REQUIRED_MESSAGE;
  }
  return errors;
}
