/**
 * @file One checkbox or radio button of a filter group, with its label.
 */

import styles from "./FilterPanel.module.css";

/**
 * Renders a checkbox or radio button inside its clickable label.
 *
 * @param {object} props - Choice props.
 * @param {"checkbox" | "radio"} props.type - Kind of input.
 * @param {string} [props.name] - Name shared by the radio buttons of one group.
 * @param {boolean} props.checked - Whether the choice is selected.
 * @param {function(): void} props.onChange - Called when the user selects or clears the choice.
 * @param {import("react").ReactNode} props.children - Label of the choice.
 * @returns {JSX.Element} The labeled choice.
 */
export default function FilterChoice({ type, name, checked, onChange, children }) {
  return (
    <label className={styles.choice}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}
