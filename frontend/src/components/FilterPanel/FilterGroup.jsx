/**
 * @file Titled group of related filter controls inside a filter panel.
 */

import styles from "./FilterPanel.module.css";

/**
 * Renders a fieldset whose legend names the filter, for example "Price".
 *
 * @param {object} props - Group props.
 * @param {string} props.legend - Name of the filter.
 * @param {import("react").ReactNode} props.children - The group's controls.
 * @returns {JSX.Element} The filter group.
 */
export default function FilterGroup({ legend, children }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}
