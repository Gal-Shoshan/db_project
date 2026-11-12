/**
 * @file Sign-up checks that the browser's built-in form validation does not cover.
 */

export const PASSWORD_MISMATCH_MESSAGE = "Passwords do not match.";

/**
 * Returns the sign-up form's errors keyed by field name; an empty object means the form is valid.
 *
 * @param {{password: string, confirmPassword: string}} values - Current form values.
 * @returns {Record<string, string>} Error message of each invalid field.
 */
export function validateSignUp({ password, confirmPassword }) {
  return password === confirmPassword ? {} : { confirmPassword: PASSWORD_MISMATCH_MESSAGE };
}
