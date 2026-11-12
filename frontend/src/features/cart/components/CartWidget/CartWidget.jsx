/**
 * @file Cart window that floats at the bottom right: closed, it shows the cart icon and the total; open, it shows the products too.
 */

import { useId, useRef, useState } from "react";
import CartIcon from "@/features/cart/components/CartIcon/CartIcon.jsx";
import CartPanel from "@/features/cart/components/CartPanel/CartPanel.jsx";
import { useCart } from "@/features/cart/useCart.js";
import { formatCount, formatCurrency } from "@/utils/formatters.js";
import styles from "./CartWidget.module.css";

/**
 * Returns "item" or "items" to match a count.
 *
 * @param {number} count - Number of units.
 * @returns {string} The noun in the right number.
 */
const itemsNoun = (count) => (count === 1 ? "item" : "items");

/**
 * Renders the cart window, which opens and closes with its top row; Escape also closes it.
 *
 * The window is a disclosure, not a modal dialog, so the user can keep
 * adding products from the page while it is open.
 *
 * @returns {JSX.Element} The cart window.
 */
export default function CartWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef(null);
  const { itemCount, total } = useCart();

  /**
   * Closes the open cart when Escape is pressed inside it, and returns focus to the top row.
   *
   * @param {import("react").KeyboardEvent<HTMLElement>} event - The key press.
   */
  const closeOnEscape = (event) => {
    if (event.key !== "Escape" || !isOpen) {
      return;
    }
    setIsOpen(false);
    toggleRef.current.focus();
  };

  return (
    <aside className={`${styles.widget} ${isOpen ? styles.open : ""}`} aria-label="Cart" onKeyDown={closeOnEscape}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <CartIcon className={styles.icon} />
          {itemCount > 0 && <span className={styles.badge}>{formatCount(itemCount)}</span>}
        </span>
        <span className="visually-hidden">
          Cart, {formatCount(itemCount)} {itemsNoun(itemCount)},
        </span>{" "}
        <span className={styles.total}>{formatCurrency(total)}</span>
        <svg viewBox="0 0 24 24" className={styles.chevron} aria-hidden="true">
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
      {isOpen && <CartPanel id={panelId} />}
    </aside>
  );
}
