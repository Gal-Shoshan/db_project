/**
 * @file Outline drawing of a shopping cart.
 */

/**
 * Renders the decorative shopping cart icon; it takes the text color.
 *
 * @param {object} props - Icon props.
 * @param {string} [props.className] - Class names that set the icon's size.
 * @returns {JSX.Element} The icon.
 */
export default function CartIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 3.5h2.3l2.4 11a1.8 1.8 0 0 0 1.8 1.4h8.2a1.8 1.8 0 0 0 1.7-1.3L21 7.5H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}
