/**
 * @file Bar at the top of the page that holds the brand and the navigation items.
 */

import styles from "./TopBar.module.css";

/**
 * Renders the page header with a labeled navigation region; the caller lays out the items inside it.
 *
 * @param {object} props - Bar props.
 * @param {string} props.label - Accessible name of the navigation region.
 * @param {boolean} [props.fullWidth=false] - Whether the items span the whole window instead of the centered content width.
 * @param {import("react").ReactNode} props.children - Bar content, starting with the brand.
 * @returns {JSX.Element} The top bar.
 */
export default function TopBar({ label, fullWidth = false, children }) {
  const navClassName = fullWidth ? `${styles.nav} ${styles.fullWidth}` : styles.nav;

  return (
    <header className={styles.header}>
      <nav className={navClassName} aria-label={label}>
        {children}
      </nav>
    </header>
  );
}
