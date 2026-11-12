/**
 * @file Chart legend: a color swatch and a name for each series.
 */

import styles from "./ChartLegend.module.css";

/**
 * Renders the legend; the names use the text color, and the swatch beside each carries the series color.
 *
 * @param {object} props - Legend props.
 * @param {ReadonlyArray<{key: string, label: string, color: string}>} props.series - Series in chart order.
 * @returns {JSX.Element} The legend.
 */
export default function ChartLegend({ series }) {
  return (
    <ul className={styles.legend} aria-label="Legend">
      {series.map((item) => (
        <li key={item.key} className={styles.item}>
          <span className={styles.swatch} style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
