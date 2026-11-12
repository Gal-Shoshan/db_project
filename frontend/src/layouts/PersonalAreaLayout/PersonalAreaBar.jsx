/**
 * @file Top bar of the personal area: the brand, the mode selector, the profile link and the log-out button.
 */

import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/auth/useAuth.js";
import Brand from "@/components/Brand/Brand.jsx";
import SegmentedControl from "@/components/SegmentedControl/SegmentedControl.jsx";
import TopBar from "@/components/TopBar/TopBar.jsx";
import { topBarItemClassName } from "@/components/TopBar/topBarItemClassName.js";
import { ROUTES } from "@/routes/paths.js";
import { MODES, findModeByPath, getMode } from "./modes.js";
import styles from "./PersonalAreaBar.module.css";

const MODE_FIELD_NAME = "mode";

/**
 * Renders the full-width personal-area top bar.
 *
 * The brand is not a link, and there is no link to the home page or back to
 * the personal area: choosing a mode is the way back from the profile. On the
 * profile page no mode is selected, so any mode can be picked to return.
 *
 * @returns {JSX.Element} The personal-area top bar.
 */
export default function PersonalAreaBar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedMode = findModeByPath(pathname);

  /**
   * Opens the chosen mode.
   *
   * @param {string} modeValue - Value of the chosen mode.
   */
  const handleModeChange = (modeValue) => {
    navigate(getMode(modeValue).path);
  };

  /**
   * Ends the session and opens the sign-in page.
   */
  const handleLogOut = () => {
    signOut();
    navigate(ROUTES.signIn, { replace: true });
  };

  return (
    <TopBar label="Personal area" fullWidth>
      <Brand />
      <div className={styles.mode}>
        <SegmentedControl
          label="Mode"
          name={MODE_FIELD_NAME}
          options={MODES}
          value={selectedMode?.value ?? null}
          onChange={handleModeChange}
        />
      </div>
      <div className={styles.actions}>
        <NavLink to={ROUTES.profile} className={topBarItemClassName}>
          View profile
        </NavLink>
        <button type="button" className={topBarItemClassName()} onClick={handleLogOut}>
          Log out
        </button>
      </div>
    </TopBar>
  );
}
