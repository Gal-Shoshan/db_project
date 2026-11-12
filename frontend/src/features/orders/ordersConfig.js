/**
 * @file Fixed settings of the order lists: filter choices, sort orders and the status labels.
 */

/**
 * Order price filter choices; an order matches when min <= price < max.
 *
 * @type {ReadonlyArray<{id: string, label: string, min: number, max: number}>}
 */
export const ORDER_PRICE_RANGES = Object.freeze([
  { id: "under-50", label: "Under $50", min: 0, max: 50 },
  { id: "50-100", label: "$50 to $100", min: 50, max: 100 },
  { id: "100-250", label: "$100 to $250", min: 100, max: 250 },
  { id: "250-500", label: "$250 to $500", min: 250, max: 500 },
  { id: "500-plus", label: "$500 & above", min: 500, max: Infinity },
]);

/**
 * Sort orders every order list offers, in display order; the first one is the default. Each list adds sorting by the name of the person it shows.
 *
 * @type {ReadonlyArray<{id: string, label: string}>}
 */
export const ORDER_SORT_OPTIONS = Object.freeze([
  { id: "newest", label: "Date: Newest First" },
  { id: "oldest", label: "Date: Oldest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
]);

/** Sort order used when none is chosen. */
export const DEFAULT_ORDER_SORT = ORDER_SORT_OPTIONS[0].id;

/** Status shown for an order that the seller has not accepted yet. */
export const PENDING_STATUS_LABEL = "Waiting for the seller to accept";

/** Status shown for an order that the seller accepted. */
export const APPROVED_STATUS_LABEL = "Approved by the seller";
