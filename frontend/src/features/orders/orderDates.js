/**
 * @file Display and comparison of order timestamps, in the user's own time zone.
 *
 * Order dates are compared as "YYYY-MM-DD" date keys, the same format a date
 * input uses, so a date filter matches the calendar day the user sees.
 */

const ORDER_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const ORDER_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Pads a month or day number to two digits.
 *
 * @param {number} value - Month or day number.
 * @returns {string} The padded number, for example "07".
 */
const padTwoDigits = (value) => String(value).padStart(2, "0");

/**
 * Formats the day an order was placed.
 *
 * @param {string} timestamp - ISO 8601 timestamp.
 * @returns {string} The date, for example "Nov 10, 2026".
 */
export function formatOrderDate(timestamp) {
  return ORDER_DATE_FORMATTER.format(new Date(timestamp));
}

/**
 * Formats the day and time an order was placed.
 *
 * @param {string} timestamp - ISO 8601 timestamp.
 * @returns {string} The date and time, for example "Nov 10, 2026, 4:30 PM".
 */
export function formatOrderDateTime(timestamp) {
  return ORDER_DATE_TIME_FORMATTER.format(new Date(timestamp));
}

/**
 * Returns the calendar day of a timestamp in the user's time zone.
 *
 * @param {string} timestamp - ISO 8601 timestamp.
 * @returns {string} The date key, for example "2026-11-10".
 */
export function toLocalDateKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;
}

/**
 * Returns whether the value is a real calendar date written as "YYYY-MM-DD".
 *
 * @param {unknown} value - Value to check, for example a URL parameter.
 * @returns {boolean} True for a valid date key such as "2026-02-28"; false for "2026-02-30".
 */
export function isDateKey(value) {
  if (typeof value !== "string" || !DATE_KEY_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
