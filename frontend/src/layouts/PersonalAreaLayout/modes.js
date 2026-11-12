/**
 * @file Work modes of the personal area and the options each mode offers in its sidebar.
 */

import { ROUTES } from "@/routes/paths.js";

/**
 * Available modes, in display order. A mode with options shows them in a
 * sidebar and opens its first option by default; a mode without options has
 * no sidebar.
 *
 * @type {ReadonlyArray<{value: string, label: string, path: string, options: ReadonlyArray<{label: string, path: string}>}>}
 */
export const MODES = Object.freeze([
  {
    value: "sell",
    label: "Sell",
    path: ROUTES.sell,
    options: [
      { label: "Orders", path: ROUTES.sellOrders },
      { label: "Products", path: ROUTES.sellProducts },
    ],
  },
  {
    value: "buy",
    label: "Buy",
    path: ROUTES.buy,
    options: [
      { label: "Shopping", path: ROUTES.buyShopping },
      { label: "Pending Orders", path: ROUTES.buyPendingOrders },
      { label: "Purchases", path: ROUTES.buyPurchases },
    ],
  },
  { value: "reports", label: "Reports", path: ROUTES.reports, options: [] },
]);

/** Mode that opens right after signing in. */
export const DEFAULT_MODE = MODES[0];

/**
 * Returns the mode with the given value.
 *
 * @param {string} value - Mode value, for example "sell".
 * @returns {{value: string, label: string, path: string, options: ReadonlyArray<{label: string, path: string}>}} The mode.
 * @throws {Error} If no mode has this value.
 */
export function getMode(value) {
  const mode = MODES.find((candidate) => candidate.value === value);
  if (!mode) {
    throw new Error(`Unknown mode: ${value}`);
  }
  return mode;
}

/**
 * Returns the mode whose pages contain the given URL path, or null outside every mode (for example on the profile page).
 *
 * @param {string} pathname - Current URL path.
 * @returns {{value: string, label: string, path: string, options: ReadonlyArray<{label: string, path: string}>} | null} The current mode.
 */
export function findModeByPath(pathname) {
  return MODES.find((mode) => pathname === mode.path || pathname.startsWith(`${mode.path}/`)) ?? null;
}
