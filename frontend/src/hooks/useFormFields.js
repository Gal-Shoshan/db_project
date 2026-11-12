/**
 * @file Hook that holds the values of a form's controlled inputs.
 */

import { useState } from "react";

/**
 * Keeps form values in state and updates the value whose key matches the changed input's name.
 *
 * @param {Record<string, string>} initialValues - Starting value of each field, keyed by input name.
 * @returns {[Record<string, string>, function(import("react").ChangeEvent<HTMLInputElement>): void]}
 *   The current values, and the change handler to pass to each input's onChange.
 */
export function useFormFields(initialValues) {
  const [values, setValues] = useState(initialValues);

  /**
   * Stores the changed input's value under the input's name.
   *
   * @param {import("react").ChangeEvent<HTMLInputElement>} event - Change event from a named input.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  };

  return [values, handleChange];
}
