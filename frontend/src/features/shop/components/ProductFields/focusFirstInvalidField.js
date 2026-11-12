/**
 * @file Moves keyboard focus to the first field of a form that has an error.
 */

/**
 * Focuses the first field, in the given order, whose name has an error; does nothing when no field has one.
 *
 * @param {HTMLFormElement} form - The form.
 * @param {Record<string, string>} errors - Error message of each invalid field, keyed by field name.
 * @param {ReadonlyArray<string>} fieldOrder - Field names in the order they appear in the form.
 */
export function focusFirstInvalidField(form, errors, fieldOrder) {
  const firstInvalidField = fieldOrder.find((name) => name in errors);
  if (firstInvalidField) {
    form.elements.namedItem(firstInvalidField).focus();
  }
}
