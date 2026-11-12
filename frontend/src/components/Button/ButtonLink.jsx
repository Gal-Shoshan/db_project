/**
 * @file Router link styled as a button, for calls to action that navigate to another page.
 */

import { Link } from "react-router";
import { buttonClassName } from "./buttonClassName.js";

/**
 * Renders a router link that looks like a button.
 *
 * @param {object} props - Link props; any other prop is passed to the router Link.
 * @param {string} props.to - Path of the page to open.
 * @param {"primary" | "secondary"} [props.variant="primary"] - Visual weight of the link.
 * @param {import("react").ReactNode} props.children - Link label.
 * @returns {JSX.Element} The link.
 */
export default function ButtonLink({ to, variant = "primary", children, ...linkProps }) {
  return (
    <Link to={to} className={buttonClassName(variant)} {...linkProps}>
      {children}
    </Link>
  );
}
