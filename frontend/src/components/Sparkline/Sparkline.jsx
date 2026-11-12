/**
 * @file Small trend line with the latest point marked in an accent color.
 */

import styles from "./Sparkline.module.css";

const DEFAULT_WIDTH = 112;
const DEFAULT_HEIGHT = 36;
const PADDING = 5;
const LATEST_POINT_RADIUS = 4;

/**
 * Returns the drawing coordinates of each value, scaled to fit the box between its lowest and highest value.
 *
 * @param {ReadonlyArray<number>} values - Values in time order; at least two.
 * @param {number} width - Box width in pixels.
 * @param {number} height - Box height in pixels.
 * @returns {Array<{x: number, y: number}>} The points, left to right.
 */
function toPoints(values, width, height) {
  const lowest = Math.min(...values);
  const range = Math.max(...values) - lowest || 1;
  const stepX = (width - 2 * PADDING) / (values.length - 1);
  return values.map((value, index) => ({
    x: PADDING + index * stepX,
    y: PADDING + (1 - (value - lowest) / range) * (height - 2 * PADDING),
  }));
}

/**
 * Renders a decorative trend line; the exact values must be available elsewhere on the page.
 *
 * @param {object} props - Sparkline props.
 * @param {ReadonlyArray<number>} props.values - Values in time order; at least two.
 * @param {string} props.accentColor - CSS color of the latest point, usually its series color.
 * @param {number} [props.width=112] - Width in pixels.
 * @param {number} [props.height=36] - Height in pixels.
 * @returns {JSX.Element} The sparkline.
 */
export default function Sparkline({ values, accentColor, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }) {
  const points = toPoints(values, width, height);
  const latestPoint = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.sparkline} aria-hidden="true">
      <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className={styles.line} />
      <circle cx={latestPoint.x} cy={latestPoint.y} r={LATEST_POINT_RADIUS} className={styles.latest} style={{ fill: accentColor }} />
    </svg>
  );
}
