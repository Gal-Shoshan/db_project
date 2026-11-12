/**
 * @file Layout of one personal-area mode: the mode's options in a left sidebar, next to the selected option's page.
 */

import { Navigate, Outlet, useMatch } from "react-router";
import SideNav from "@/components/SideNav/SideNav.jsx";
import { getMode } from "@/layouts/PersonalAreaLayout/modes.js";
import styles from "./ModeLayout.module.css";

/**
 * Renders the sidebar of a mode that has options, and the page of the current option beside it.
 *
 * Opening a mode that has options without choosing one shows its first
 * option. A mode without options has no sidebar.
 *
 * @param {object} props - Layout props.
 * @param {string} props.modeValue - Value of the mode, for example "sell".
 * @param {string} [props.contentClassName] - Extra class names for the page area, for example to leave room for a floating window.
 * @returns {JSX.Element} The mode layout, or a redirect to the mode's first option.
 */
export default function ModeLayout({ modeValue, contentClassName }) {
  const mode = getMode(modeValue);
  const hasOptions = mode.options.length > 0;
  const isModeRoot = useMatch(mode.path) !== null;

  if (hasOptions && isModeRoot) {
    return <Navigate to={mode.options[0].path} replace />;
  }

  return (
    <div className={styles.layout}>
      {hasOptions && <SideNav title={mode.label} label={`${mode.label} options`} items={mode.options} />}
      <div className={[styles.content, contentClassName].filter(Boolean).join(" ")}>
        <Outlet />
      </div>
    </div>
  );
}
