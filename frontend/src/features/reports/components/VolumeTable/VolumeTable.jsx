/**
 * @file Table of sales, purchases and net per month, with totals; the exact-figures twin of the volume chart.
 */

import { VOLUME_SERIES } from "@/features/reports/monthlyVolumes.js";
import { formatLongMonthYear, formatShortMonthYear } from "@/features/reports/months.js";
import { formatSignedWholeCurrency, formatWholeCurrency } from "@/utils/formatters.js";
import styles from "./VolumeTable.module.css";

/**
 * Renders a month's name: in full, or shortened on narrow screens, where screen readers still hear it in full.
 *
 * @param {object} props - Label props.
 * @param {string} props.monthKey - Month key, for example "2026-10".
 * @returns {JSX.Element} The month label.
 */
function MonthLabel({ monthKey }) {
  return (
    <>
      <span className={styles.longLabel}>{formatLongMonthYear(monthKey)}</span>
      <span className={styles.shortLabel} aria-hidden="true">
        {formatShortMonthYear(monthKey)}
      </span>
    </>
  );
}

/**
 * Renders one row of figures: a volume per series and the net.
 *
 * @param {object} props - Row props.
 * @param {import("react").ReactNode} props.heading - Row heading, for example the month.
 * @param {{sales: number, purchases: number}} props.figures - The row's amounts.
 * @returns {JSX.Element} The table row.
 */
function FigureRow({ heading, figures }) {
  return (
    <tr>
      <th scope="row" className={styles.rowHeading}>
        {heading}
      </th>
      {VOLUME_SERIES.map((series) => (
        <td key={series.key} className={styles.number}>
          {formatWholeCurrency(figures[series.key])}
        </td>
      ))}
      <td className={styles.number}>{formatSignedWholeCurrency(figures.sales - figures.purchases)}</td>
    </tr>
  );
}

/**
 * Renders the monthly breakdown table; the series columns carry the same swatches as the chart legend.
 *
 * @param {object} props - Table props.
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} props.months - Months, oldest first.
 * @param {{sales: number, purchases: number}} props.totals - Totals over all months.
 * @returns {JSX.Element} The table.
 */
export default function VolumeTable({ months, totals }) {
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className="visually-hidden">Sales, purchases and net by month, with totals</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            {VOLUME_SERIES.map((series) => (
              <th key={series.key} scope="col" className={styles.number}>
                <span className={styles.swatch} style={{ background: series.color }} aria-hidden="true" />
                {series.label}
              </th>
            ))}
            <th scope="col" className={styles.number}>
              Net
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <FigureRow key={month.month} heading={<MonthLabel monthKey={month.month} />} figures={month} />
          ))}
        </tbody>
        <tfoot>
          <FigureRow heading="Total" figures={totals} />
        </tfoot>
      </table>
    </div>
  );
}
