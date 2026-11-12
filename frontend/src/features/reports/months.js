/**
 * @file Formatting of "YYYY-MM" month keys for display.
 */

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const MONTH_NAME_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const SHORT_MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const LONG_MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const JANUARY_SUFFIX = "-01";

/**
 * Returns the first day of the month as a UTC date.
 *
 * @param {string} monthKey - Month key, for example "2026-10".
 * @returns {Date} Midnight UTC on the first day of the month.
 */
function monthKeyToDate(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * Formats a month as its short name, for example "Oct".
 *
 * @param {string} monthKey - Month key, for example "2026-10".
 * @returns {string} The short month name.
 */
export function formatShortMonth(monthKey) {
  return SHORT_MONTH_FORMATTER.format(monthKeyToDate(monthKey));
}

/**
 * Formats a month as its full name without the year, for example "October".
 *
 * @param {string} monthKey - Month key, for example "2026-10".
 * @returns {string} The month name.
 */
export function formatMonthName(monthKey) {
  return MONTH_NAME_FORMATTER.format(monthKeyToDate(monthKey));
}

/**
 * Formats a month as its short name and year, for example "Oct 2026".
 *
 * @param {string} monthKey - Month key, for example "2026-10".
 * @returns {string} The short month and year.
 */
export function formatShortMonthYear(monthKey) {
  return SHORT_MONTH_YEAR_FORMATTER.format(monthKeyToDate(monthKey));
}

/**
 * Formats a month as its full name and year, for example "October 2026".
 *
 * @param {string} monthKey - Month key, for example "2026-10".
 * @returns {string} The full month and year.
 */
export function formatLongMonthYear(monthKey) {
  return LONG_MONTH_YEAR_FORMATTER.format(monthKeyToDate(monthKey));
}

/**
 * Returns the year of a month key.
 *
 * @param {string} monthKey - Month key, for example "2026-10".
 * @returns {string} The four-digit year, for example "2026".
 */
export function monthYear(monthKey) {
  return monthKey.slice(0, 4);
}

/**
 * Returns whether the month is January, where a chart's time axis starts a new year.
 *
 * @param {string} monthKey - Month key, for example "2026-01".
 * @returns {boolean} True for January.
 */
export function isJanuary(monthKey) {
  return monthKey.endsWith(JANUARY_SUFFIX);
}
