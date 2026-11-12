/**
 * @file Star rating display that fills stars in proportion to the rating, including partial stars.
 */

import styles from "./RatingStars.module.css";

const DEFAULT_MAX_RATING = 5;
const STAR_PATH =
  "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z";

/**
 * Returns a rating as text: whole ratings without decimals, others with one decimal.
 *
 * @param {number} rating - The rating.
 * @returns {string} The rating, for example "4" or "4.3".
 */
const formatRating = (rating) => (Number.isInteger(rating) ? String(rating) : rating.toFixed(1));

/**
 * Renders a row of star shapes.
 *
 * @param {object} props - Row props.
 * @param {number} props.count - Number of stars.
 * @param {string} props.className - Class that sets the stars' color.
 * @returns {JSX.Element} The star row.
 */
function StarRow({ count, className }) {
  return (
    <span className={`${styles.row} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" className={styles.star} aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/**
 * Renders the rating as stars, announced to screen readers as "N out of M stars".
 *
 * @param {object} props - Rating props.
 * @param {number} props.rating - The rating, from 0 to maxRating.
 * @param {number} [props.maxRating=5] - The highest possible rating.
 * @returns {JSX.Element} The star rating.
 */
export default function RatingStars({ rating, maxRating = DEFAULT_MAX_RATING }) {
  const filledPercent = (Math.min(Math.max(rating, 0), maxRating) / maxRating) * 100;

  return (
    <span className={styles.stars} role="img" aria-label={`${formatRating(rating)} out of ${maxRating} stars`}>
      <StarRow count={maxRating} className={styles.empty} />
      <span className={styles.filled} style={{ width: `${filledPercent}%` }}>
        <StarRow count={maxRating} className={styles.full} />
      </span>
    </span>
  );
}
