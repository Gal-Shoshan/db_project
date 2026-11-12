/**
 * @file Tests for the shop's sample products, the Edit and New product form checks, product codes, and building or editing a product.
 */

import { describe, expect, it } from "vitest";
import { FREE_DELIVERY_MIN_PRICE } from "@/features/catalog/catalogConfig.js";
import { CURRENT_USER } from "@/features/users/users.js";
import { MAX_SAMPLE_STOCK, SAMPLE_SHOP_PRODUCT_COUNT, SAMPLE_SHOP_PRODUCTS } from "./sampleShopProducts.js";
import {
  MAX_TITLE_LENGTH,
  applyProductEdit,
  createNewShopProduct,
  formatShopProductId,
  getNextShopProductNumber,
} from "./shopProducts.js";
import {
  LONG_BRAND_MESSAGE,
  LONG_TITLE_MESSAGE,
  MISSING_BRAND_MESSAGE,
  MISSING_CATEGORY_MESSAGE,
  MISSING_TITLE_MESSAGE,
  PRICE_FORMAT_MESSAGE,
  PRICE_RANGE_MESSAGE,
  STOCK_MESSAGE,
  validateNewProduct,
  validateProductEdit,
} from "./validateProductForm.js";

const VALID_VALUES = Object.freeze({ title: "  Desk Lamp, Brass  ", price: "24.5", stock: "12" });

/**
 * Returns the errors of the form with some values changed from VALID_VALUES.
 *
 * @param {Partial<{title: string, price: string, stock: string}>} changes - Field texts to use instead.
 * @returns {Record<string, string>} The error of each invalid field.
 */
const errorsFor = (changes) => validateProductEdit({ ...VALID_VALUES, ...changes }).errors;

describe("SAMPLE_SHOP_PRODUCTS", () => {
  it("has 24 products of the user's shop with their own codes", () => {
    expect(SAMPLE_SHOP_PRODUCTS).toHaveLength(SAMPLE_SHOP_PRODUCT_COUNT);
    SAMPLE_SHOP_PRODUCTS.forEach((product, index) => {
      expect(product.id).toBe(`S${String(index + 1).padStart(4, "0")}`);
      expect(product.sellerId).toBe(CURRENT_USER.id);
    });
  });

  it("is available exactly when its quantity in stock is above 0, and some products start unavailable", () => {
    SAMPLE_SHOP_PRODUCTS.forEach((product) => {
      expect(product.inStock).toBe(product.stock > 0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.stock).toBeLessThanOrEqual(MAX_SAMPLE_STOCK);
    });
    expect(SAMPLE_SHOP_PRODUCTS.some((product) => product.stock === 0)).toBe(true);
    expect(SAMPLE_SHOP_PRODUCTS.some((product) => product.stock > 0)).toBe(true);
  });
});

describe("validateProductEdit", () => {
  it("returns the trimmed name and the price and quantity as numbers when every field is valid", () => {
    expect(validateProductEdit(VALID_VALUES)).toEqual({
      errors: {},
      changes: { title: "Desk Lamp, Brass", price: 24.5, stock: 12 },
    });
  });

  it("requires a name of at most 120 characters", () => {
    expect(errorsFor({ title: "   " })).toEqual({ title: MISSING_TITLE_MESSAGE });
    expect(errorsFor({ title: "x".repeat(MAX_TITLE_LENGTH) })).toEqual({});
    expect(errorsFor({ title: "x".repeat(MAX_TITLE_LENGTH + 1) })).toEqual({ title: LONG_TITLE_MESSAGE });
  });

  it("requires a price above $0 with at most two decimals", () => {
    expect(errorsFor({ price: "abc" })).toEqual({ price: PRICE_FORMAT_MESSAGE });
    expect(errorsFor({ price: "9.999" })).toEqual({ price: PRICE_FORMAT_MESSAGE });
    expect(errorsFor({ price: "-5" })).toEqual({ price: PRICE_FORMAT_MESSAGE });
    expect(errorsFor({ price: "0" })).toEqual({ price: PRICE_RANGE_MESSAGE });
    expect(errorsFor({ price: "100000.01" })).toEqual({ price: PRICE_RANGE_MESSAGE });
    expect(errorsFor({ price: "0.01" })).toEqual({});
  });

  it("accepts a whole quantity from 0 to 9,999, where 0 is allowed", () => {
    expect(errorsFor({ stock: "0" })).toEqual({});
    expect(errorsFor({ stock: "9999" })).toEqual({});
    expect(errorsFor({ stock: "10000" })).toEqual({ stock: STOCK_MESSAGE });
    expect(errorsFor({ stock: "2.5" })).toEqual({ stock: STOCK_MESSAGE });
    expect(errorsFor({ stock: "-1" })).toEqual({ stock: STOCK_MESSAGE });
    expect(errorsFor({ stock: "" })).toEqual({ stock: STOCK_MESSAGE });
  });

  it("reports every invalid field and returns no changes", () => {
    expect(validateProductEdit({ title: "", price: "", stock: "x" })).toEqual({
      errors: { title: MISSING_TITLE_MESSAGE, price: PRICE_FORMAT_MESSAGE, stock: STOCK_MESSAGE },
      changes: null,
    });
  });
});

describe("applyProductEdit", () => {
  const DISCOUNTED = Object.freeze({ ...SAMPLE_SHOP_PRODUCTS[0], price: 40, listPrice: 50, stock: 5, inStock: true });

  it("sets the new values and makes a product with 0 in stock unavailable", () => {
    const edited = applyProductEdit(DISCOUNTED, { title: "New name", price: 45, stock: 0 });
    expect(edited).toMatchObject({ title: "New name", price: 45, stock: 0, inStock: false, listPrice: 50 });
    expect(applyProductEdit(edited, { title: "New name", price: 45, stock: 3 }).inStock).toBe(true);
  });

  it("follows the new price for free delivery and drops a list price that no longer shows a discount", () => {
    const cheaper = applyProductEdit(DISCOUNTED, { title: "x", price: FREE_DELIVERY_MIN_PRICE - 1, stock: 1 });
    expect(cheaper).toMatchObject({ freeDelivery: false, listPrice: 50 });
    const pricier = applyProductEdit(DISCOUNTED, { title: "x", price: 50, stock: 1 });
    expect(pricier).toMatchObject({ freeDelivery: true, listPrice: null });
  });
});

describe("validateNewProduct", () => {
  const NEW_VALUES = Object.freeze({
    title: " Desk Lamp ",
    brand: " Oakhaven ",
    category: "home-kitchen",
    price: "30",
    stock: "4",
  });

  it("returns the trimmed values, with the price and quantity as numbers, when every field is valid", () => {
    expect(validateNewProduct(NEW_VALUES)).toEqual({
      errors: {},
      product: { title: "Desk Lamp", brand: "Oakhaven", category: "home-kitchen", price: 30, stock: 4 },
    });
  });

  it("requires a brand and a category from the catalog's list, as well as the shared fields", () => {
    const result = validateNewProduct({ title: "", brand: "  ", category: "", price: "", stock: "" });
    expect(result).toEqual({
      errors: {
        title: MISSING_TITLE_MESSAGE,
        brand: MISSING_BRAND_MESSAGE,
        category: MISSING_CATEGORY_MESSAGE,
        price: PRICE_FORMAT_MESSAGE,
        stock: STOCK_MESSAGE,
      },
      product: null,
    });
    expect(validateNewProduct({ ...NEW_VALUES, category: "garden" }).errors).toEqual({
      category: MISSING_CATEGORY_MESSAGE,
    });
    expect(validateNewProduct({ ...NEW_VALUES, brand: "b".repeat(61) }).errors).toEqual({ brand: LONG_BRAND_MESSAGE });
  });
});

describe("product codes and new products", () => {
  it("formats codes with four digits and numbers new products after the highest code", () => {
    expect(formatShopProductId(7)).toBe("S0007");
    expect(getNextShopProductNumber([{ id: "S0003" }, { id: "S0024" }, { id: "S0010" }])).toBe(25);
    expect(getNextShopProductNumber([])).toBe(1);
  });

  it("builds a new product of the user's shop with no discount and no ratings, added today", () => {
    const product = createNewShopProduct(
      { title: "Desk Lamp", brand: "Oakhaven", category: "home-kitchen", price: 30, stock: 0 },
      { id: "S0025", featuredRank: -1 },
    );
    expect(product).toEqual({
      id: "S0025",
      title: "Desk Lamp",
      brand: "Oakhaven",
      sellerId: CURRENT_USER.id,
      category: "home-kitchen",
      price: 30,
      listPrice: null,
      rating: 0,
      reviewCount: 0,
      stock: 0,
      inStock: false,
      freeDelivery: false,
      daysSinceAdded: 0,
      featuredRank: -1,
    });
  });
});
