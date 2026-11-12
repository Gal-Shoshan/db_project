/**
 * @file Searching, filtering, sorting and paging the product catalog.
 *
 * These are pure functions over a product list, so the same rules can later
 * be applied to products fetched from an API.
 */

import { getPageCount } from "@/components/Pagination/pagination.js";
import { CATEGORIES, PRICE_RANGES } from "./catalogConfig.js";

const FIRST_PAGE = 1;
const CATEGORY_LABELS = new Map(CATEGORIES.map((category) => [category.id, category.label]));
const PRICE_RANGES_BY_ID = new Map(PRICE_RANGES.map((range) => [range.id, range]));

/**
 * Comparators for each sort order. Ties keep the featured order, so results are stable.
 *
 * @type {Readonly<Record<string, function(import("./sampleProducts.js").Product, import("./sampleProducts.js").Product): number>>}
 */
const SORT_COMPARATORS = Object.freeze({
  featured: (left, right) => left.featuredRank - right.featuredRank,
  "price-asc": (left, right) => left.price - right.price || left.featuredRank - right.featuredRank,
  "price-desc": (left, right) => right.price - left.price || left.featuredRank - right.featuredRank,
  rating: (left, right) =>
    right.rating - left.rating || right.reviewCount - left.reviewCount || left.featuredRank - right.featuredRank,
  newest: (left, right) => left.daysSinceAdded - right.daysSinceAdded || left.featuredRank - right.featuredRank,
});

/**
 * Returns whether the product's title, brand or category contains every word of the search text.
 *
 * @param {import("./sampleProducts.js").Product} product - The product.
 * @param {string[]} searchWords - Lowercase search words; an empty list matches every product.
 * @returns {boolean} True when the product matches.
 */
function matchesSearch(product, searchWords) {
  const searchableText = `${product.title} ${product.brand} ${CATEGORY_LABELS.get(product.category)}`.toLowerCase();
  return searchWords.every((word) => searchableText.includes(word));
}

/**
 * Returns whether the product's price is in the selected range.
 *
 * @param {import("./sampleProducts.js").Product} product - The product.
 * @param {string | null} priceRangeId - Selected price range id, or null for any price.
 * @returns {boolean} True when the product matches.
 */
function matchesPrice(product, priceRangeId) {
  const range = PRICE_RANGES_BY_ID.get(priceRangeId);
  return !range || (product.price >= range.min && product.price < range.max);
}

/**
 * Returns whether the product passes every filter of the search state.
 *
 * @param {import("./sampleProducts.js").Product} product - The product.
 * @param {import("./catalogQuery.js").CatalogQuery} query - The search state.
 * @returns {boolean} True when the product matches.
 */
function matchesFilters(product, query) {
  const matchesCategory = query.categories.length === 0 || query.categories.includes(product.category);
  const matchesRating = query.minRating === null || product.rating >= query.minRating;
  const matchesStock = !query.inStock || product.inStock;
  const matchesDelivery = !query.freeDelivery || product.freeDelivery;
  return matchesCategory && matchesPrice(product, query.price) && matchesRating && matchesStock && matchesDelivery;
}

/**
 * Returns the products that match the search text and the filters, in their original order.
 *
 * @param {ReadonlyArray<import("./sampleProducts.js").Product>} products - All products.
 * @param {import("./catalogQuery.js").CatalogQuery} query - The search state.
 * @returns {import("./sampleProducts.js").Product[]} The matching products.
 */
export function filterProducts(products, query) {
  const searchWords = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter((product) => matchesSearch(product, searchWords) && matchesFilters(product, query));
}

/**
 * Returns a sorted copy of the products; an unknown sort order keeps the featured order.
 *
 * @param {ReadonlyArray<import("./sampleProducts.js").Product>} products - Products to sort.
 * @param {string} sortId - Sort order id from SORT_OPTIONS.
 * @returns {import("./sampleProducts.js").Product[]} The sorted products.
 */
export function sortProducts(products, sortId) {
  return [...products].sort(SORT_COMPARATORS[sortId] ?? SORT_COMPARATORS.featured);
}

/**
 * Searches, filters, sorts and pages the catalog.
 *
 * A requested page past the last one shows the last page.
 *
 * @param {ReadonlyArray<import("./sampleProducts.js").Product>} products - All products.
 * @param {import("./catalogQuery.js").CatalogQuery} query - The search state.
 * @param {number} pageSize - Most products on one page.
 * @returns {{items: import("./sampleProducts.js").Product[], totalCount: number, page: number, pageCount: number, firstItemNumber: number, lastItemNumber: number}}
 *   The products on the page, the number of matches, the page shown, the number of pages, and the
 *   1-based positions of the first and last product shown (both 0 when nothing matches).
 */
export function searchCatalog(products, query, pageSize) {
  const matches = sortProducts(filterProducts(products, query), query.sort);
  const pageCount = getPageCount(matches.length, pageSize);
  const page = Math.min(Math.max(query.page, FIRST_PAGE), Math.max(pageCount, FIRST_PAGE));
  const startIndex = (page - FIRST_PAGE) * pageSize;
  const items = matches.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalCount: matches.length,
    page,
    pageCount,
    firstItemNumber: items.length > 0 ? startIndex + 1 : 0,
    lastItemNumber: startIndex + items.length,
  };
}
