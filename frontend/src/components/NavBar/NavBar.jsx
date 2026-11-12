/**
 * @file Top bar of the public pages: the brand, linking home, and the sign-in and sign-up links.
 */

import { Link, NavLink } from "react-router";
import Brand from "@/components/Brand/Brand.jsx";
import TopBar from "@/components/TopBar/TopBar.jsx";
import { topBarItemClassName } from "@/components/TopBar/topBarItemClassName.js";
import { ROUTES } from "@/routes/paths.js";
import styles from "./NavBar.module.css";

/**
 * Renders the public top bar.
 *
 * It has no link to the personal area, which can only be reached by signing in.
 *
 * @returns {JSX.Element} The navigation bar.
 */
export default function NavBar() {
  return (
    <TopBar label="Main">
      <Link to={ROUTES.home} className={styles.brandLink}>
        <Brand />
      </Link>
      <div className={styles.links}>
        <NavLink to={ROUTES.signIn} className={topBarItemClassName}>
          Sign in
        </NavLink>
        <NavLink to={ROUTES.signUp} className={topBarItemClassName}>
          Sign up
        </NavLink>
      </div>
    </TopBar>
  );
}
