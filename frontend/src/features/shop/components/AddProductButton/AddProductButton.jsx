/**
 * @file Round "+" button that stays at the bottom right of the window and opens the New product window.
 */

import styles from "./AddProductButton.module.css";

/**
 * Renders the floating "+" button; screen readers hear "Add a new product".
 *
 * @param {object} props - Button props.
 * @param {function(): void} props.onClick - Called when the button is pressed.
 * @returns {JSX.Element} The button.
 */
export default function AddProductButton({ onClick }) {
  return (
    <button
      type="button"
      className={styles.addButton}
      aria-label="Add a new product"
      title="Add a new product"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className={styles.plusIcon} aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}
