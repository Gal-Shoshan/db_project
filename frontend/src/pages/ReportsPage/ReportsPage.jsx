/**
 * @file Page of the Reports mode: monthly sales and purchase volumes as key figures, a chart and a table.
 */

import { useId } from "react";
import Card from "@/components/Card/Card.jsx";
import ChartLegend from "@/components/ChartLegend/ChartLegend.jsx";
import PageTitle from "@/components/PageTitle/PageTitle.jsx";
import StatTile from "@/components/StatTile/StatTile.jsx";
import VolumeChart from "@/features/reports/components/VolumeChart/VolumeChart.jsx";
import VolumeTable from "@/features/reports/components/VolumeTable/VolumeTable.jsx";
import { MONTHLY_VOLUMES, VOLUME_SERIES } from "@/features/reports/monthlyVolumes.js";
import { formatLongMonthYear, formatMonthName, formatShortMonthYear } from "@/features/reports/months.js";
import { summarizeVolumes } from "@/features/reports/summarizeVolumes.js";
import {
  formatCompactCurrency,
  formatSignedCompactCurrency,
  formatSignedPercent,
} from "@/utils/formatters.js";
import styles from "./ReportsPage.module.css";

/**
 * Returns the color of a volume series.
 *
 * @param {"sales" | "purchases"} key - The series.
 * @returns {string} Its CSS color.
 */
const seriesColor = (key) => VOLUME_SERIES.find((series) => series.key === key).color;

/**
 * Returns the direction of a change.
 *
 * @param {number} change - The change as a ratio.
 * @returns {"up" | "down" | "none"} The direction.
 */
function changeDirection(change) {
  if (change > 0) {
    return "up";
  }
  if (change < 0) {
    return "down";
  }
  return "none";
}

/**
 * Returns the stat-tile change of the latest month's sales against the month before; for sales, a rise is good.
 *
 * @param {ReturnType<typeof summarizeVolumes>} summary - The headline figures.
 * @returns {{text: string, direction: string, tone: string} | undefined} The change, or undefined when there is no month before.
 */
function latestSalesDelta(summary) {
  if (summary.latestSalesChange === null) {
    return undefined;
  }
  const direction = changeDirection(summary.latestSalesChange);
  const toneByDirection = { up: "good", down: "bad", none: "neutral" };
  return {
    text: `${formatSignedPercent(summary.latestSalesChange)} vs ${formatMonthName(summary.previous.month)}`,
    direction,
    tone: toneByDirection[direction],
  };
}

/**
 * Renders the reports dashboard: key figures, the monthly volume chart and the monthly breakdown table.
 *
 * The figures are fixed placeholders, marked "Sample data", until the
 * reports come from the server.
 *
 * @returns {JSX.Element} The Reports page.
 */
export default function ReportsPage() {
  const chartTitleId = useId();
  const tableTitleId = useId();
  const summary = summarizeVolumes(MONTHLY_VOLUMES);
  const period = `${formatShortMonthYear(summary.firstMonth)} – ${formatShortMonthYear(summary.lastMonth)}`;

  return (
    <div className={styles.reports}>
      <header className={styles.header}>
        <div>
          <PageTitle title="Reports" />
          <p className={styles.subtitle}>Sales and purchases by month, {period}</p>
        </div>
        <p className={styles.sampleBadge}>Sample data</p>
      </header>

      <section className={styles.keyFigures} aria-label="Key figures">
        <StatTile
          label="Total sales"
          value={formatCompactCurrency(summary.totalSales)}
          caption={period}
          trend={{ values: MONTHLY_VOLUMES.map((month) => month.sales), accentColor: seriesColor("sales") }}
        />
        <StatTile
          label="Total purchases"
          value={formatCompactCurrency(summary.totalPurchases)}
          caption={period}
          trend={{ values: MONTHLY_VOLUMES.map((month) => month.purchases), accentColor: seriesColor("purchases") }}
        />
        <StatTile
          label="Net (sales − purchases)"
          value={formatSignedCompactCurrency(summary.net)}
          caption={`Over ${MONTHLY_VOLUMES.length} months`}
        />
        <StatTile
          label={`${formatLongMonthYear(summary.lastMonth)} sales`}
          value={formatCompactCurrency(summary.latest.sales)}
          delta={latestSalesDelta(summary)}
        />
      </section>

      <Card aria-labelledby={chartTitleId}>
        <div className={styles.panelHeader}>
          <h2 id={chartTitleId} className={styles.panelTitle}>
            Monthly volume
          </h2>
          <ChartLegend series={VOLUME_SERIES} />
        </div>
        <VolumeChart months={MONTHLY_VOLUMES} />
      </Card>

      <Card aria-labelledby={tableTitleId}>
        <h2 id={tableTitleId} className={`${styles.panelTitle} ${styles.tableTitle}`}>
          Monthly breakdown
        </h2>
        <VolumeTable months={MONTHLY_VOLUMES} totals={{ sales: summary.totalSales, purchases: summary.totalPurchases }} />
      </Card>
    </div>
  );
}
