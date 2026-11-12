/**
 * @file Headline figures computed from monthly sales and purchase volumes.
 */

/**
 * Returns the sum of one volume over all months.
 *
 * @param {ReadonlyArray<import("./monthlyVolumes.js").MonthlyVolume>} months - The months.
 * @param {"sales" | "purchases"} key - Which volume to add up.
 * @returns {number} The total in dollars.
 */
function sumOf(months, key) {
  return months.reduce((total, month) => total + month[key], 0);
}

/**
 * Returns the relative change from one amount to another, or null when the starting amount is zero.
 *
 * @param {number} from - Earlier amount.
 * @param {number} to - Later amount.
 * @returns {number | null} The change as a ratio, where 0.142 means up 14.2%.
 */
export function relativeChange(from, to) {
  return from === 0 ? null : (to - from) / from;
}

/**
 * Returns the month with the highest value of one volume; the earliest one wins a tie.
 *
 * @param {ReadonlyArray<import("./monthlyVolumes.js").MonthlyVolume>} months - The months.
 * @param {"sales" | "purchases"} key - Which volume to compare.
 * @returns {import("./monthlyVolumes.js").MonthlyVolume} The peak month.
 */
export function peakMonth(months, key) {
  return months.reduce((peak, month) => (month[key] > peak[key] ? month : peak));
}

/**
 * Returns the headline figures for a run of months.
 *
 * @param {ReadonlyArray<import("./monthlyVolumes.js").MonthlyVolume>} months - The months, oldest first; at least one.
 * @returns {{
 *   firstMonth: string,
 *   lastMonth: string,
 *   totalSales: number,
 *   totalPurchases: number,
 *   net: number,
 *   latest: import("./monthlyVolumes.js").MonthlyVolume,
 *   previous: import("./monthlyVolumes.js").MonthlyVolume | null,
 *   latestSalesChange: number | null,
 * }} The first and last month keys, the totals, net (sales minus purchases), the latest and previous
 *   months, and the latest month's sales change from the month before (null when there is no month before).
 * @throws {RangeError} If there are no months.
 */
export function summarizeVolumes(months) {
  if (months.length === 0) {
    throw new RangeError("summarizeVolumes needs at least one month.");
  }
  const totalSales = sumOf(months, "sales");
  const totalPurchases = sumOf(months, "purchases");
  const latest = months[months.length - 1];
  const previous = months.length > 1 ? months[months.length - 2] : null;

  return {
    firstMonth: months[0].month,
    lastMonth: latest.month,
    totalSales,
    totalPurchases,
    net: totalSales - totalPurchases,
    latest,
    previous,
    latestSalesChange: previous ? relativeChange(previous.sales, latest.sales) : null,
  };
}
