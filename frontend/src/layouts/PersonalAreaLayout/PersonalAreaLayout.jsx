/**
 * @file Page frame of the personal area: the personal-area top bar above the current mode or page.
 */

import { Outlet } from "react-router";
import PersonalAreaBar from "./PersonalAreaBar.jsx";
import styles from "./PersonalAreaLayout.module.css";

/**
 * Renders the personal-area top bar and, below it across the full width, the page that matches the current route.
 *
 * @returns {JSX.Element} The page frame.
 */
export default function PersonalAreaLayout() {
  return (
    <div className={styles.layout}>
      <PersonalAreaBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
