/**
 * @file Left sidebar with a titled list of navigation links.
 */

import { NavLink } from "react-router";
import styles from "./SideNav.module.css";

/**
 * Returns the class names of a sidebar link, highlighting the link of the current page.
 *
 * @param {{isActive: boolean}} linkState - State that NavLink passes in.
 * @returns {string} The class names to apply.
 */
function sideNavLinkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

/**
 * Renders a sidebar whose links lead to the given pages.
 *
 * @param {object} props - Sidebar props.
 * @param {string} props.title - Heading shown above the links.
 * @param {string} props.label - Accessible name of the navigation region.
 * @param {ReadonlyArray<{label: string, path: string}>} props.items - Links in display order.
 * @returns {JSX.Element} The sidebar.
 */
export default function SideNav({ title, label, items }) {
  return (
    <nav className={styles.sideNav} aria-label={label}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} className={sideNavLinkClassName}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
