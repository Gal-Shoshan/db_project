/**
 * @file Row at the top of a list page with the Filters button and the Sort by menu.
 */

import { useId } from "react";
import styles from "./FilterSortBar.module.css";

/**
 * Renders the Filters button, which opens and closes a filter panel, and the Sort by menu.
 *
 * @param {object} props - Bar props.
 * @param {number} props.activeFilterCount - Number of filters in use, shown on the Filters button.
 * @param {boolean} props.isFilterPanelOpen - Whether the filter panel is open.
 * @param {string} props.filterPanelId - Element id of the filter panel the button controls.
 * @param {function(): void} props.onToggleFilters - Called when the Filters button is pressed.
 * @param {ReadonlyArray<{id: string, label: string}>} props.sortOptions - Sort orders, in display order.
 * @param {string} props.sort - Selected sort order id.
 * @param {function(string): void} props.onSortChange - Called with the newly chosen sort order id.
 * @returns {JSX.Element} The bar.
 */
export default function FilterSortBar({
  activeFilterCount,
  isFilterPanelOpen,
  filterPanelId,
  onToggleFilters,
  sortOptions,
  sort,
  onSortChange,
}) {
  const sortSelectId = useId();

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.filtersButton}
        aria-label={activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : undefined}
        aria-expanded={isFilterPanelOpen}
        aria-controls={filterPanelId}
        onClick={onToggleFilters}
      >
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {activeFilterCount}
          </span>
        )}
      </button>
      <div className={styles.sort}>
        <label htmlFor={sortSelectId} className={styles.sortLabel}>
          Sort by
        </label>
        <select
          id={sortSelectId}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className={styles.select}
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
