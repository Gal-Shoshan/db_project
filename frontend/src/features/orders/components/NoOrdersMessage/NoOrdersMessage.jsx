/**
 * @file Message shown in place of an order list when it shows no order.
 */

import Button from "@/components/Button/Button.jsx";
import styles from "./NoOrdersMessage.module.css";

/**
 * Renders a title and a short explanation, with a "Clear all filters" button when filters hide every order.
 *
 * @param {object} props - Message props.
 * @param {string} props.title - Main line, for example "No pending orders match your filters.".
 * @param {string} props.text - Explanation under the title.
 * @param {function(): void} [props.onClearFilters] - Called when the clear button is pressed; without it there is no button.
 * @returns {JSX.Element} The message.
 */
export default function NoOrdersMessage({ title, text, onClearFilters }) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      <p className={styles.text}>{text}</p>
      {onClearFilters && (
        <Button variant="secondary" onClick={onClearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
