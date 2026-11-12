/**
 * @file Line above an order list that says how many orders it shows.
 */

import { formatCount } from "@/utils/formatters.js";
import styles from "./OrderCountSummary.module.css";

/**
 * Renders the count, for example "24 pending orders", or "5 of 24 pending orders" when filters hide some.
 *
 * @param {object} props - Summary props.
 * @param {number} props.shownCount - Number of orders that pass the filters.
 * @param {number} props.totalCount - Number of orders in the list.
 * @param {string} props.singular - What one order is called, for example "pending order".
 * @param {string} props.plural - What several orders are called, for example "pending orders".
 * @returns {JSX.Element} The summary line.
 */
export default function OrderCountSummary({ shownCount, totalCount, singular, plural }) {
  const isFiltered = shownCount !== totalCount;
  const shownPart = isFiltered ? `${formatCount(shownCount)} of ${formatCount(totalCount)}` : formatCount(totalCount);

  return (
    <p className={styles.summary} aria-live="polite">
      {shownPart} {totalCount === 1 ? singular : plural}
    </p>
  );
}
