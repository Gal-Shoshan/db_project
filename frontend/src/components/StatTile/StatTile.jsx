/**
 * @file Key-figure tile: a label, a large value, and optionally a change, a caption and a trend line.
 */

import Sparkline from "@/components/Sparkline/Sparkline.jsx";
import styles from "./StatTile.module.css";

/**
 * Renders the arrow of a change; it is decorative, since the signed text already says the direction.
 *
 * @param {object} props - Arrow props.
 * @param {"up" | "down"} props.direction - Direction of the change.
 * @returns {JSX.Element} The arrow.
 */
function DeltaArrow({ direction }) {
  return (
    <svg viewBox="0 0 12 12" className={styles.arrow} aria-hidden="true">
      <path d={direction === "up" ? "M6 2l4 6H2z" : "M6 10L2 4h8z"} />
    </svg>
  );
}

/**
 * Renders a key figure.
 *
 * The change is shown with an arrow, a sign and a color, so its meaning
 * never depends on color alone. Its color says whether the change is good
 * or bad, which the caller decides.
 *
 * @param {object} props - Tile props.
 * @param {string} props.label - What the figure is, in sentence case.
 * @param {string} props.value - The formatted figure.
 * @param {{text: string, direction: "up" | "down" | "none", tone: "good" | "bad" | "neutral"}} [props.delta] - Change against an earlier period.
 * @param {string} [props.caption] - Extra context under the figure, for example the period.
 * @param {{values: ReadonlyArray<number>, accentColor: string}} [props.trend] - Values for a trend line.
 * @returns {JSX.Element} The tile.
 */
export default function StatTile({ label, value, delta, caption, trend }) {
  return (
    <div className={styles.tile}>
      <p className={styles.label}>{label}</p>
      <div className={styles.body}>
        <div>
          <p className={styles.value}>{value}</p>
          {delta && (
            <p className={`${styles.delta} ${styles[delta.tone]}`}>
              {delta.direction !== "none" && <DeltaArrow direction={delta.direction} />}
              {delta.text}
            </p>
          )}
          {caption && <p className={styles.caption}>{caption}</p>}
        </div>
        {trend && <Sparkline values={trend.values} accentColor={trend.accentColor} />}
      </div>
    </div>
  );
}
