/**
 * @file Monthly sales and purchase volumes shown on the Reports page.
 *
 * These are fixed placeholder figures, used until the reports are served by
 * the server. Each month is a "YYYY-MM" key; amounts are in US dollars.
 */

/**
 * Sales and purchases of one month.
 *
 * @typedef {object} MonthlyVolume
 * @property {string} month - Month key, for example "2026-10".
 * @property {number} sales - Total sales in the month, in dollars.
 * @property {number} purchases - Total purchases in the month, in dollars.
 */

/**
 * The twelve months shown, oldest first.
 *
 * @type {ReadonlyArray<MonthlyVolume>}
 */
export const MONTHLY_VOLUMES = Object.freeze([
  { month: "2025-11", sales: 48200, purchases: 31500 },
  { month: "2025-12", sales: 61750, purchases: 27900 },
  { month: "2026-01", sales: 33400, purchases: 22100 },
  { month: "2026-02", sales: 29850, purchases: 24600 },
  { month: "2026-03", sales: 36900, purchases: 28300 },
  { month: "2026-04", sales: 41250, purchases: 26750 },
  { month: "2026-05", sales: 44600, purchases: 30200 },
  { month: "2026-06", sales: 39800, purchases: 33900 },
  { month: "2026-07", sales: 37150, purchases: 35400 },
  { month: "2026-08", sales: 42300, purchases: 38800 },
  { month: "2026-09", sales: 45900, purchases: 47250 },
  { month: "2026-10", sales: 52400, purchases: 49600 },
]);

/**
 * The two volumes, in their fixed display order. Each keeps its color on every chart, legend and table.
 *
 * @type {ReadonlyArray<{key: "sales" | "purchases", label: string, color: string}>}
 */
export const VOLUME_SERIES = Object.freeze([
  { key: "sales", label: "Sales", color: "var(--color-series-1)" },
  { key: "purchases", label: "Purchases", color: "var(--color-series-2)" },
]);
