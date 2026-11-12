/**
 * @file Labeled input with an optional hint and error message, for forms.
 */

import { useId } from "react";
import styles from "./FormField.module.css";

/**
 * Renders a label and an input, and links the hint and error text to the input for screen readers.
 *
 * @param {object} props - Field props; any other prop is passed to the native input.
 * @param {string} props.label - Visible label text.
 * @param {string} props.name - Input name, also the key of the field's value in the form state.
 * @param {string} [props.hint] - Help text shown under the input.
 * @param {string} [props.error] - Error message shown under the input; marks the input invalid.
 * @returns {JSX.Element} The form field.
 */
export default function FormField({ label, name, hint, error, ...inputProps }) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
