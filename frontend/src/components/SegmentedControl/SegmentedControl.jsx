/**
 * @file Labeled row of mutually exclusive options, built on native radio buttons so keyboards and screen readers work as usual.
 */

import { useId } from "react";
import styles from "./SegmentedControl.module.css";

/**
 * Renders a label followed by a group of options where at most one is selected.
 *
 * @param {object} props - Control props.
 * @param {string} props.label - Visible name of the group, shown before the options.
 * @param {string} props.name - Name shared by the radio buttons.
 * @param {ReadonlyArray<{value: string, label: string}>} props.options - Options in display order.
 * @param {string | null} props.value - Value of the selected option, or null when none is selected.
 * @param {function(string): void} props.onChange - Called with the value of the option the user picks.
 * @returns {JSX.Element} The segmented control.
 */
export default function SegmentedControl({ label, name, options, value, onChange }) {
  const labelId = useId();

  return (
    <div className={styles.control}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className={styles.input}
            />
            <span className={styles.optionLabel}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
