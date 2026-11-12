/**
 * @file Placeholder product picture: a tinted square with an outline drawing of the product's category.
 */

import styles from "./ProductImage.module.css";

/**
 * Outline drawing of each category, drawn on a 64 by 64 grid.
 *
 * @type {Readonly<Record<string, JSX.Element>>}
 */
const CATEGORY_DRAWINGS = Object.freeze({
  electronics: (
    <>
      <rect x="12" y="16" width="40" height="26" rx="3" />
      <path d="M26 50h12M32 42v8" />
    </>
  ),
  "home-kitchen": (
    <>
      <path d="M18 22h22v18a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" />
      <path d="M40 26h3a6 6 0 0 1 0 12h-3" />
    </>
  ),
  books: (
    <>
      <path d="M14 16h14a4 4 0 0 1 4 4v28a3 3 0 0 0-3-3H14z" />
      <path d="M50 16H36a4 4 0 0 0-4 4v28a3 3 0 0 1 3-3h15z" />
    </>
  ),
  "sports-outdoors": (
    <>
      <circle cx="32" cy="32" r="17" />
      <path d="M15 32h34M32 15c7 6 7 28 0 34M32 15c-7 6-7 28 0 34" />
    </>
  ),
  "toys-games": (
    <>
      <rect x="13" y="32" width="17" height="17" rx="2" />
      <rect x="34" y="32" width="17" height="17" rx="2" />
      <rect x="23.5" y="13" width="17" height="17" rx="2" />
    </>
  ),
  beauty: (
    <>
      <rect x="22" y="26" width="20" height="25" rx="5" />
      <path d="M27 26v-5h10v5M29 13h6v8h-6z" />
    </>
  ),
});

/**
 * Renders the placeholder picture of a product's category; it is decorative, since the title names the product.
 *
 * @param {object} props - Image props.
 * @param {string} props.category - Category id of the product.
 * @returns {JSX.Element} The picture.
 */
export default function ProductImage({ category }) {
  return (
    <div className={`${styles.image} ${styles[category] ?? ""}`}>
      <svg viewBox="0 0 64 64" className={styles.drawing} aria-hidden="true">
        {CATEGORY_DRAWINGS[category]}
      </svg>
    </div>
  );
}
