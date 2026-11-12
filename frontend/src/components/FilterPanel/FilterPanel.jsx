/**
 * @file Panel that lays out groups of filters, with a button that clears them all.
 */

import Button from "@/components/Button/Button.jsx";
import styles from "./FilterPanel.module.css";

/**
 * Renders the filter groups side by side and a "Clear all filters" button under them.
 *
 * @param {object} props - Panel props.
 * @param {string} props.id - Element id, referenced by the Filters button.
 * @param {number} props.activeFilterCount - Number of filters in use; the clear button is disabled at 0.
 * @param {function(): void} props.onClear - Called when "Clear all filters" is pressed.
 * @param {import("react").ReactNode} props.children - The filter groups.
 * @returns {JSX.Element} The filter panel.
 */
export default function FilterPanel({ id, activeFilterCount, onClear, children }) {
  return (
    <section id={id} className={styles.panel} aria-label="Filters">
      <div className={styles.groups}>{children}</div>
      <div className={styles.footer}>
        <Button variant="secondary" onClick={onClear} disabled={activeFilterCount === 0}>
          Clear all filters
        </Button>
      </div>
    </section>
  );
}
