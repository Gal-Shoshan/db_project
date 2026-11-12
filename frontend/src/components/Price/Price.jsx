/**
 * @file Price in the style of online stores: a small currency sign, large dollars and raised cents.
 */

import { formatCount, formatCurrency } from "@/utils/formatters.js";
import styles from "./Price.module.css";

/**
 * Renders a price; screen readers hear the plainly formatted amount, for example "$29.99".
 *
 * @param {object} props - Price props.
 * @param {number} props.amount - Price in US dollars.
 * @returns {JSX.Element} The price.
 */
export default function Price({ amount }) {
  const [wholeDollars, cents] = amount.toFixed(2).split(".");

  return (
    <span className={styles.price}>
      <span className="visually-hidden">{formatCurrency(amount)}</span>
      <span className={styles.display} aria-hidden="true">
        <span className={styles.symbol}>$</span>
        <span className={styles.whole}>{formatCount(Number(wholeDollars))}</span>
        <span className={styles.fraction}>{cents}</span>
      </span>
    </span>
  );
}
