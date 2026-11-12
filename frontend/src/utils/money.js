/**
 * @file Arithmetic on amounts of money in dollars.
 */

const CENTS_PER_DOLLAR = 100;

/**
 * Rounds an amount of money to whole cents.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {number} The rounded amount.
 */
export function roundToCents(amount) {
  return Math.round(amount * CENTS_PER_DOLLAR) / CENTS_PER_DOLLAR;
}
