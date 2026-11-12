/**
 * @file Fixed settings of the product catalog: page size, categories, filter choices and sort orders.
 */

/** Most products shown on one catalog page. */
export const PRODUCTS_PER_PAGE = 50;

/** Products at or above this price, in dollars, ship for free. */
export const FREE_DELIVERY_MIN_PRICE = 35;

/**
 * Product categories, in display order.
 *
 * @type {ReadonlyArray<{id: string, label: string}>}
 */
export const CATEGORIES = Object.freeze([
  { id: "electronics", label: "Electronics" },
  { id: "home-kitchen", label: "Home & Kitchen" },
  { id: "books", label: "Books" },
  { id: "sports-outdoors", label: "Sports & Outdoors" },
  { id: "toys-games", label: "Toys & Games" },
  { id: "beauty", label: "Beauty & Personal Care" },
]);

/**
 * Price filter choices; a product matches when min <= price < max.
 *
 * @type {ReadonlyArray<{id: string, label: string, min: number, max: number}>}
 */
export const PRICE_RANGES = Object.freeze([
  { id: "under-25", label: "Under $25", min: 0, max: 25 },
  { id: "25-50", label: "$25 to $50", min: 25, max: 50 },
  { id: "50-100", label: "$50 to $100", min: 50, max: 100 },
  { id: "100-200", label: "$100 to $200", min: 100, max: 200 },
  { id: "200-plus", label: "$200 & above", min: 200, max: Infinity },
]);

/** Customer-review filter choices: the lowest average rating to include, best first. */
export const RATING_THRESHOLDS = Object.freeze([4, 3, 2, 1]);

/**
 * Sort orders, in display order; the first one is the default.
 *
 * @type {ReadonlyArray<{id: string, label: string}>}
 */
export const SORT_OPTIONS = Object.freeze([
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Avg. Customer Review" },
  { id: "newest", label: "Newest Arrivals" },
]);

/** Sort order used when none is chosen. */
export const DEFAULT_SORT = SORT_OPTIONS[0].id;
