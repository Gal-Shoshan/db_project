/**
 * @file Tests for reading and writing the catalog search state in the URL.
 */

import { describe, expect, it } from "vitest";
import { NO_FILTERS, countActiveFilters, parseCatalogQuery, toSearchParams } from "./catalogQuery.js";

const DEFAULT_QUERY = { q: "", ...NO_FILTERS, sort: "featured", page: 1 };

describe("parseCatalogQuery", () => {
  it("returns the defaults for an empty query string", () => {
    expect(parseCatalogQuery(new URLSearchParams())).toEqual(DEFAULT_QUERY);
  });

  it("reads every parameter", () => {
    const params = new URLSearchParams(
      "q=%20lamp%20&category=books&category=electronics&price=25-50&rating=4&inStock=1&freeDelivery=1&sort=price-asc&page=3",
    );
    expect(parseCatalogQuery(params)).toEqual({
      q: "lamp",
      categories: ["electronics", "books"],
      price: "25-50",
      minRating: 4,
      inStock: true,
      freeDelivery: true,
      sort: "price-asc",
      page: 3,
    });
  });

  it("ignores unknown or invalid values", () => {
    const params = new URLSearchParams("category=cars&price=cheap&rating=5&sort=random&page=-2&inStock=yes");
    expect(parseCatalogQuery(params)).toEqual(DEFAULT_QUERY);
  });

  it("treats a page that is not a whole number as the first page", () => {
    expect(parseCatalogQuery(new URLSearchParams("page=2.5")).page).toBe(1);
    expect(parseCatalogQuery(new URLSearchParams("page=abc")).page).toBe(1);
  });
});

describe("toSearchParams", () => {
  it("leaves out every default value", () => {
    expect(toSearchParams(DEFAULT_QUERY).toString()).toBe("");
  });

  it("writes a state that reads back unchanged", () => {
    const query = {
      q: "bluetooth speaker",
      categories: ["electronics"],
      price: "50-100",
      minRating: 3,
      inStock: true,
      freeDelivery: false,
      sort: "rating",
      page: 2,
    };
    expect(parseCatalogQuery(toSearchParams(query))).toEqual(query);
  });
});

describe("countActiveFilters", () => {
  it("counts each selected category and each other filter in use", () => {
    expect(countActiveFilters(NO_FILTERS)).toBe(0);
    expect(
      countActiveFilters({ categories: ["books", "beauty"], price: "under-25", minRating: null, inStock: true, freeDelivery: false }),
    ).toBe(4);
  });
});
