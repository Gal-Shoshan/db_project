/**
 * @file Tests that the sample purchases are complete and their data is valid.
 */

import { describe, expect, it } from "vitest";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { getSeller } from "@/features/sellers/sellers.js";
import { CURRENT_USER } from "@/features/users/users.js";
import { getItemsTotal } from "./orderItems.js";
import { MAX_ITEMS_PER_ORDER, MAX_QUANTITY_PER_ITEM } from "./sampleOrderParts.js";
import {
  FIRST_PURCHASE_NUMBER,
  MAX_APPROVAL_MINUTES,
  MIN_APPROVAL_MINUTES,
  SAMPLE_PURCHASE_COUNT,
  SAMPLE_PURCHASES,
} from "./samplePurchases.js";

const PRODUCTS_BY_ID = new Map(SAMPLE_PRODUCTS.map((product) => [product.id, product]));
const MS_PER_MINUTE = 60_000;

/**
 * Returns whether every product of a purchase can be ordered now.
 *
 * @param {import("./orderSelectors.js").Order} purchase - The purchase.
 * @returns {boolean} True when every product is in stock.
 */
const isFullyInStock = (purchase) => purchase.items.every((item) => PRODUCTS_BY_ID.get(item.productId).inStock);

describe("SAMPLE_PURCHASES", () => {
  it("has 36 purchases numbered from ORD-1001 in the order they were placed", () => {
    expect(SAMPLE_PURCHASES).toHaveLength(SAMPLE_PURCHASE_COUNT);
    SAMPLE_PURCHASES.forEach((purchase, index) => {
      expect(purchase.id).toBe(`ORD-${FIRST_PURCHASE_NUMBER + index}`);
      if (index > 0) {
        expect(purchase.placedAt >= SAMPLE_PURCHASES[index - 1].placedAt).toBe(true);
      }
    });
  });

  it("was approved one hour to three days after it was placed, in September 2026 at the latest", () => {
    SAMPLE_PURCHASES.forEach((purchase) => {
      const approvalMinutes = (Date.parse(purchase.approvedAt) - Date.parse(purchase.placedAt)) / MS_PER_MINUTE;
      expect(approvalMinutes).toBeGreaterThanOrEqual(MIN_APPROVAL_MINUTES);
      expect(approvalMinutes).toBeLessThanOrEqual(MAX_APPROVAL_MINUTES);
      expect(purchase.approvedAt < "2026-10-01").toBe(true);
    });
  });

  it("was bought by the signed-in user, holds the seller's own catalog products and is priced at the sum of its items", () => {
    SAMPLE_PURCHASES.forEach((purchase) => {
      expect(purchase.buyerId).toBe(CURRENT_USER.id);
      expect(purchase.seller).toBe(getSeller(purchase.sellerId).name);
      expect(purchase.items.length).toBeGreaterThanOrEqual(1);
      expect(purchase.items.length).toBeLessThanOrEqual(MAX_ITEMS_PER_ORDER);
      purchase.items.forEach((item) => {
        expect(PRODUCTS_BY_ID.get(item.productId).sellerId).toBe(purchase.sellerId);
        expect(item.quantity).toBeLessThanOrEqual(MAX_QUANTITY_PER_ITEM);
      });
      expect(purchase.price).toBe(getItemsTotal(purchase.items));
    });
  });

  it("has purchases whose products are all in stock, and some with a product that is unavailable now", () => {
    expect(SAMPLE_PURCHASES.some(isFullyInStock)).toBe(true);
    expect(SAMPLE_PURCHASES.some((purchase) => !isFullyInStock(purchase))).toBe(true);
  });
});
