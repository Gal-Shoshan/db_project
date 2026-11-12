/**
 * @file Native button in the application's primary or secondary style.
 */

import { buttonClassName } from "./buttonClassName.js";

/**
 * Renders a native button with the application's button styles.
 *
 * @param {object} props - Button props; any other prop is passed to the native button.
 * @param {"primary" | "secondary" | "danger"} [props.variant="primary"] - Visual weight of the button.
 * @param {boolean} [props.fullWidth=false] - Whether the button stretches to the width of its container.
 * @param {"button" | "submit" | "reset"} [props.type="button"] - Native button type.
 * @param {import("react").ReactNode} props.children - Button label.
 * @returns {JSX.Element} The button.
 */
export default function Button({ variant = "primary", fullWidth = false, type = "button", children, ...buttonProps }) {
  return (
    <button type={type} className={buttonClassName(variant, fullWidth)} {...buttonProps}>
      {children}
    </button>
  );
}
