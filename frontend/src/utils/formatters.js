/**
 * @file Number formatting shared across the application (US English, US dollars).
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const COUNT_FORMATTER = new Intl.NumberFormat("en-US");
const WHOLE_CURRENCY_OPTIONS = { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 };
const WHOLE_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", WHOLE_CURRENCY_OPTIONS);
const SIGNED_WHOLE_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  ...WHOLE_CURRENCY_OPTIONS,
  signDisplay: "exceptZero",
});
const COMPACT_CURRENCY_OPTIONS = {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
};
const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", COMPACT_CURRENCY_OPTIONS);
const SIGNED_COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  ...COMPACT_CURRENCY_OPTIONS,
  signDisplay: "exceptZero",
});
const SIGNED_PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/**
 * Formats an amount of money in US dollars, with cents.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {string} The formatted amount, for example "$1,299.99".
 */
export function formatCurrency(amount) {
  return CURRENCY_FORMATTER.format(amount);
}

/**
 * Formats an amount of money in whole US dollars.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {string} The formatted amount, for example "$48,200".
 */
export function formatWholeCurrency(amount) {
  return WHOLE_CURRENCY_FORMATTER.format(amount);
}

/**
 * Formats an amount of money in whole US dollars with a + or - sign; zero has no sign.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {string} The formatted amount, for example "+$2,800" or "-$1,350".
 */
export function formatSignedWholeCurrency(amount) {
  return SIGNED_WHOLE_CURRENCY_FORMATTER.format(amount);
}

/**
 * Formats an amount of money in short form, with at most one decimal.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {string} The formatted amount, for example "$513.5K" or "$20K".
 */
export function formatCompactCurrency(amount) {
  return COMPACT_CURRENCY_FORMATTER.format(amount);
}

/**
 * Formats an amount of money in short form with a + or - sign; zero has no sign.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {string} The formatted amount, for example "+$117.2K".
 */
export function formatSignedCompactCurrency(amount) {
  return SIGNED_COMPACT_CURRENCY_FORMATTER.format(amount);
}

/**
 * Formats a ratio as a percentage with a + or - sign and at most one decimal; zero has no sign.
 *
 * @param {number} ratio - The ratio, where 0.142 means 14.2%.
 * @returns {string} The formatted percentage, for example "+14.2%".
 */
export function formatSignedPercent(ratio) {
  return SIGNED_PERCENT_FORMATTER.format(ratio);
}

/**
 * Formats a whole number with thousands separators.
 *
 * @param {number} count - The number to format.
 * @returns {string} The formatted number, for example "12,345".
 */
export function formatCount(count) {
  return COUNT_FORMATTER.format(count);
}
