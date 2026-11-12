/**
 * @file Surface with a border, rounded corners and a shadow, used to group related content.
 */

import styles from "./Card.module.css";

/**
 * Renders a section styled as a card.
 *
 * @param {object} props - Card props; any other prop is passed to the section element.
 * @param {string} [props.className] - Extra class names, for example to set the card's width.
 * @param {import("react").ReactNode} props.children - Card content.
 * @returns {JSX.Element} The card.
 */
export default function Card({ className, children, ...sectionProps }) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(" ")} {...sectionProps}>
      {children}
    </section>
  );
}
