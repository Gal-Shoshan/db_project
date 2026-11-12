/**
 * @file Labeled drop-down list with an optional error message, for forms; it uses FormField's styles so both look the same.
 */

import { useId } from "react";
import styles from "@/components/FormField/FormField.module.css";

/**
 * Renders a label and a select element, with a first "choose" option that has an empty value.
 *
 * @param {object} props - Field props; any other prop is passed to the native select.
 * @param {string} props.label - Visible label text.
 * @param {string} props.name - Select name, also the key of the field's value in the form state.
 * @param {string} props.placeholder - Text of the empty first option, for example "Choose a category".
 * @param {ReadonlyArray<{id: string, label: string}>} props.options - Choices in display order.
 * @param {string} [props.error] - Error message shown under the list; marks the list invalid.
 * @returns {JSX.Element} The form field.
 */
export default function SelectField({ label, name, placeholder, options, error, ...selectProps }) {
  const selectId = useId();
  const errorId = `${selectId}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
