/**
 * @file Tests for searching, filtering, sorting and paging the catalog.
 */

import { describe, expect, it } from "vitest";
import { NO_FILTERS } from "./catalogQuery.js";
import { SAMPLE_PRODUCTS } from "./sampleProducts.js";
import { filterProducts, searchCatalog, sortProducts } from "./searchCatalog.js";

const PAGE_SIZE = 50;
const BASE_QUERY = Object.freeze({ q: "", ...NO_FILTERS, sort: "featured", page: 1 });

/**
 * Builds a test product, filling every field the test does not care about.
 *
 * @param {Partial<import("./sampleProducts.js").Product>} fields - Fields that matter to the test.
 * @returns {import("./sampleProducts.js").Product} The product.
 */
function makeProduct(fields) {
  return {
    id: "T1",
    title: "Test Product",
    brand: "Testco",
    category: "electronics",
    price: 10,
    listPrice: null,
    rating: 4,
    reviewCount: 10,
    inStock: true,
    freeDelivery: false,
    daysSinceAdded: 10,
    featuredRank: 0,
    ...fields,
  };
}

const PRODUCTS = [
  makeProduct({ id: "A", title: "Bluetooth Speaker, Black", price: 24.99, rating: 4.6, reviewCount: 900, daysSinceAdded: 30, featuredRank: 0 }),
  makeProduct({ id: "B", title: "Field Guide to Birds", category: "books", price: 25, rating: 3.2, inStock: false, featuredRank: 1, daysSinceAdded: 2 }),
  makeProduct({ id: "C", title: "Camping Tent", category: "sports-outdoors", price: 199.99, rating: 4.6, reviewCount: 50, freeDelivery: true, featuredRank: 2, daysSinceAdded: 90 }),
  makeProduct({ id: "D", title: "Wireless Speaker Pro", brand: "Lumen", price: 250, rating: 1.9, freeDelivery: true, featuredRank: 3, daysSinceAdded: 1 }),
];

/**
 * Returns the ids of the products that match a search state built on BASE_QUERY.
 *
 * @param {Partial<import("./catalogQuery.js").CatalogQuery>} changes - Search values to apply.
 * @returns {string[]} The ids of the matching products.
 */
const matchingIds = (changes) => filterProducts(PRODUCTS, { ...BASE_QUERY, ...changes }).map((product) => product.id);

describe("filterProducts", () => {
  it("matches products that contain every search word, in any case", () => {
    expect(matchingIds({ q: "SPEAKER" })).toEqual(["A", "D"]);
    expect(matchingIds({ q: "wireless speaker" })).toEqual(["D"]);
  });

  it("searches the brand and the category name too", () => {
    expect(matchingIds({ q: "lumen" })).toEqual(["D"]);
    expect(matchingIds({ q: "books" })).toEqual(["B"]);
  });

  it("filters by any of the selected categories", () => {
    expect(matchingIds({ categories: ["books", "sports-outdoors"] })).toEqual(["B", "C"]);
  });

  it("filters by price range, counting the lower bound in and the upper bound out", () => {
    expect(matchingIds({ price: "under-25" })).toEqual(["A"]);
    expect(matchingIds({ price: "25-50" })).toEqual(["B"]);
    expect(matchingIds({ price: "200-plus" })).toEqual(["D"]);
  });

  it("filters by lowest rating, stock and free delivery", () => {
    expect(matchingIds({ minRating: 4 })).toEqual(["A", "C"]);
    expect(matchingIds({ inStock: true })).toEqual(["A", "C", "D"]);
    expect(matchingIds({ freeDelivery: true })).toEqual(["C", "D"]);
  });

  it("combines all filters", () => {
    expect(matchingIds({ q: "speaker", freeDelivery: true, minRating: 1 })).toEqual(["D"]);
  });
});

describe("sortProducts", () => {
  /**
   * Returns the ids of PRODUCTS in the given sort order.
   *
   * @param {string} sortId - Sort order id.
   * @returns {string[]} The sorted ids.
   */
  const sortedIds = (sortId) => sortProducts(PRODUCTS, sortId).map((product) => product.id);

  it("orders by every sort option", () => {
    expect(sortedIds("featured")).toEqual(["A", "B", "C", "D"]);
    expect(sortedIds("price-asc")).toEqual(["A", "B", "C", "D"]);
    expect(sortedIds("price-desc")).toEqual(["D", "C", "B", "A"]);
    expect(sortedIds("newest")).toEqual(["D", "B", "A", "C"]);
  });

  it("breaks rating ties by the number of ratings", () => {
    expect(sortedIds("rating")).toEqual(["A", "C", "B", "D"]);
  });

  it("does not change the list it is given", () => {
    sortProducts(PRODUCTS, "price-desc");
    expect(PRODUCTS.map((product) => product.id)).toEqual(["A", "B", "C", "D"]);
  });
});

describe("searchCatalog", () => {
  it("splits the 237 sample products into 5 pages of at most 50", () => {
    const firstPage = searchCatalog(SAMPLE_PRODUCTS, BASE_QUERY, PAGE_SIZE);
    expect(firstPage).toMatchObject({ totalCount: 237, pageCount: 5, page: 1, firstItemNumber: 1, lastItemNumber: 50 });
    expect(firstPage.items).toHaveLength(50);
  });

  it("puts the remainder on the last page", () => {
    const lastPage = searchCatalog(SAMPLE_PRODUCTS, { ...BASE_QUERY, page: 5 }, PAGE_SIZE);
    expect(lastPage).toMatchObject({ page: 5, firstItemNumber: 201, lastItemNumber: 237 });
    expect(lastPage.items).toHaveLength(37);
  });

  it("shows the last page when the requested page is past it", () => {
    expect(searchCatalog(SAMPLE_PRODUCTS, { ...BASE_QUERY, page: 99 }, PAGE_SIZE).page).toBe(5);
  });

  it("reports no pages and no item range when nothing matches", () => {
    const empty = searchCatalog(SAMPLE_PRODUCTS, { ...BASE_QUERY, q: "no-such-product" }, PAGE_SIZE);
    expect(empty).toMatchObject({ items: [], totalCount: 0, pageCount: 0, page: 1, firstItemNumber: 0, lastItemNumber: 0 });
  });
});
