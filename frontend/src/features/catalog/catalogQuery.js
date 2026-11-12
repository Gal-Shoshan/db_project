/**
 * @file Reads and writes the catalog's search state (text, filters, sort and page) in the URL query string.
 *
 * Keeping the state in the URL lets the browser's Back and Forward buttons
 * step through searches and pages. Unknown or invalid values fall back to
 * the defaults instead of failing.
 */

import { CATEGORIES, DEFAULT_SORT, PRICE_RANGES, RATING_THRESHOLDS, SORT_OPTIONS } from "./catalogConfig.js";

/**
 * The catalog search state.
 *
 * @typedef {object} CatalogQuery
 * @property {string} q - Search text; empty for no search.
 * @property {string[]} categories - Selected category ids; empty for all categories.
 * @property {string | null} price - Selected price range id, or null for any price.
 * @property {number | null} minRating - Lowest average rating to include, or null for any rating.
 * @property {boolean} inStock - Whether to show only products in stock.
 * @property {boolean} freeDelivery - Whether to show only products with free delivery.
 * @property {string} sort - Sort order id.
 * @property {number} page - Page number, starting at 1.
 */

const PARAMS = Object.freeze({
  search: "q",
  category: "category",
  price: "price",
  rating: "rating",
  inStock: "inStock",
  freeDelivery: "freeDelivery",
  sort: "sort",
  page: "page",
});
const FLAG_ON = "1";
const FIRST_PAGE = 1;
const CATEGORY_IDS = CATEGORIES.map((category) => category.id);
const PRICE_RANGE_IDS = new Set(PRICE_RANGES.map((range) => range.id));
const SORT_IDS = new Set(SORT_OPTIONS.map((option) => option.id));

/**
 * Filter values that select every product.
 *
 * @type {Readonly<Pick<CatalogQuery, "categories" | "price" | "minRating" | "inStock" | "freeDelivery">>}
 */
export const NO_FILTERS = Object.freeze({
  categories: [],
  price: null,
  minRating: null,
  inStock: false,
  freeDelivery: false,
});

/**
 * Returns the page number in a parameter value, or the first page when it is not a whole number of at least 1.
 *
 * @param {string | null} value - Raw parameter value.
 * @returns {number} The page number.
 */
function parsePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
}

/**
 * Returns the rating threshold in a parameter value, or null when it is not one of RATING_THRESHOLDS.
 *
 * @param {string | null} value - Raw parameter value.
 * @returns {number | null} The rating threshold.
 */
function parseRating(value) {
  const rating = Number(value);
  return RATING_THRESHOLDS.includes(rating) ? rating : null;
}

/**
 * Returns the catalog search state described by URL query parameters.
 *
 * @param {URLSearchParams} searchParams - The URL query parameters.
 * @returns {CatalogQuery} The search state.
 */
export function parseCatalogQuery(searchParams) {
  const requestedCategories = searchParams.getAll(PARAMS.category);
  const price = searchParams.get(PARAMS.price);
  const sort = searchParams.get(PARAMS.sort);

  return {
    q: (searchParams.get(PARAMS.search) ?? "").trim(),
    categories: CATEGORY_IDS.filter((id) => requestedCategories.includes(id)),
    price: PRICE_RANGE_IDS.has(price) ? price : null,
    minRating: parseRating(searchParams.get(PARAMS.rating)),
    inStock: searchParams.get(PARAMS.inStock) === FLAG_ON,
    freeDelivery: searchParams.get(PARAMS.freeDelivery) === FLAG_ON,
    sort: SORT_IDS.has(sort) ? sort : DEFAULT_SORT,
    page: parsePage(searchParams.get(PARAMS.page)),
  };
}

/**
 * Returns the URL query parameters that describe a search state, leaving out every default value.
 *
 * @param {CatalogQuery} query - The search state.
 * @returns {URLSearchParams} The query parameters.
 */
export function toSearchParams(query) {
  const params = new URLSearchParams();
  if (query.q) params.set(PARAMS.search, query.q);
  query.categories.forEach((id) => params.append(PARAMS.category, id));
  if (query.price) params.set(PARAMS.price, query.price);
  if (query.minRating !== null) params.set(PARAMS.rating, String(query.minRating));
  if (query.inStock) params.set(PARAMS.inStock, FLAG_ON);
  if (query.freeDelivery) params.set(PARAMS.freeDelivery, FLAG_ON);
  if (query.sort !== DEFAULT_SORT) params.set(PARAMS.sort, query.sort);
  if (query.page > FIRST_PAGE) params.set(PARAMS.page, String(query.page));
  return params;
}

/**
 * Returns how many filters are in use; each selected category counts as one.
 *
 * @param {Pick<CatalogQuery, "categories" | "price" | "minRating" | "inStock" | "freeDelivery">} filters - The filter values.
 * @returns {number} The number of active filters.
 */
export function countActiveFilters(filters) {
  return (
    filters.categories.length +
    Number(filters.price !== null) +
    Number(filters.minRating !== null) +
    Number(filters.inStock) +
    Number(filters.freeDelivery)
  );
}
