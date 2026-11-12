/**
 * @file Tests that the sample catalog is complete and its data is valid.
 */

import { describe, expect, it } from "vitest";
import { SELLERS } from "@/features/sellers/sellers.js";
import { CATEGORIES, FREE_DELIVERY_MIN_PRICE } from "./catalogConfig.js";
import { SAMPLE_PRODUCT_COUNT, SAMPLE_PRODUCTS } from "./sampleProducts.js";

describe("SAMPLE_PRODUCTS", () => {
  it("has 237 products with unique ids", () => {
    expect(SAMPLE_PRODUCT_COUNT).toBe(237);
    expect(SAMPLE_PRODUCTS).toHaveLength(SAMPLE_PRODUCT_COUNT);
    expect(new Set(SAMPLE_PRODUCTS.map((product) => product.id)).size).toBe(SAMPLE_PRODUCT_COUNT);
  });

  it("has products in every category", () => {
    const usedCategories = new Set(SAMPLE_PRODUCTS.map((product) => product.category));
    expect([...usedCategories].sort()).toEqual(CATEGORIES.map((category) => category.id).sort());
  });

  it("has a known seller for every product, with the sellers sharing the products evenly", () => {
    const productCounts = SELLERS.map(
      (seller) => SAMPLE_PRODUCTS.filter((product) => product.sellerId === seller.id).length,
    );
    expect(productCounts.reduce((total, count) => total + count, 0)).toBe(SAMPLE_PRODUCT_COUNT);
    expect(Math.max(...productCounts) - Math.min(...productCounts)).toBeLessThanOrEqual(1);
  });

  it("has valid prices, ratings and delivery flags", () => {
    SAMPLE_PRODUCTS.forEach((product) => {
      expect(product.price).toBeGreaterThan(0);
      expect(product.rating).toBeGreaterThanOrEqual(1);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(product.reviewCount).toBeGreaterThanOrEqual(1);
      expect(product.listPrice === null || product.listPrice > product.price).toBe(true);
      expect(product.freeDelivery).toBe(product.price >= FREE_DELIVERY_MIN_PRICE);
    });
  });
});
