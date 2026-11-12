/**
 * @file Class names shared by Button and ButtonLink, so links and buttons look the same.
 */

import styles from "./Button.module.css";

/**
 * Returns the class names of a button-styled element.
 *
 * @param {"primary" | "secondary" | "danger"} variant - Visual weight of the element.
 * @param {boolean} [fullWidth=false] - Whether the element stretches to the width of its container.
 * @returns {string} The class names to apply.
 */
export function buttonClassName(variant, fullWidth = false) {
  return [styles.button, styles[variant], fullWidth && styles.fullWidth].filter(Boolean).join(" ");
}
