/**
 * @file Class names for links and buttons inside a top bar, so both look the same.
 */

import styles from "./TopBar.module.css";

/**
 * Returns the class names of a top-bar item, highlighting the item of the current page.
 *
 * Accepts the state object that NavLink passes to its className callback, so
 * it can be given to NavLink directly; call it with no argument for a button.
 *
 * @param {{isActive?: boolean}} [itemState] - Whether the item belongs to the current page.
 * @returns {string} The class names to apply.
 */
export function topBarItemClassName({ isActive = false } = {}) {
  return isActive ? `${styles.item} ${styles.active}` : styles.item;
}
