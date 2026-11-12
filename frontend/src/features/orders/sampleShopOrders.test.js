/**
 * @file Tests that the sample orders placed with the user's shop are complete and their data is valid.
 */

import { describe, expect, it } from "vitest";
import { SAMPLE_SHOP_PRODUCTS } from "@/features/shop/sampleShopProducts.js";
import { CURRENT_USER, SAMPLE_BUYERS } from "@/features/users/users.js";
import { getItemsTotal } from "./orderItems.js";
import { FIRST_NEW_ORDER_NUMBER, SAMPLE_ORDERS } from "./sampleOrders.js";
import { FIRST_SHOP_ORDER_NUMBER, SAMPLE_SHOP_ORDER_COUNT, SAMPLE_SHOP_ORDERS } from "./sampleShopOrders.js";

const SHOP_PRODUCTS_BY_ID = new Map(SAMPLE_SHOP_PRODUCTS.map((product) => [product.id, product]));
const BUYER_NAMES_BY_ID = new Map(SAMPLE_BUYERS.map((buyer) => [buyer.id, buyer.name]));

describe("SAMPLE_SHOP_ORDERS", () => {
  it("has 18 orders numbered from ORD-2001 in the order they were placed", () => {
    expect(SAMPLE_SHOP_ORDERS).toHaveLength(SAMPLE_SHOP_ORDER_COUNT);
    SAMPLE_SHOP_ORDERS.forEach((order, index) => {
      expect(order.id).toBe(`ORD-${FIRST_SHOP_ORDER_NUMBER + index}`);
      if (index > 0) {
        expect(order.placedAt >= SAMPLE_SHOP_ORDERS[index - 1].placedAt).toBe(true);
      }
    });
  });

  it("was placed by a made-up buyer with the user's shop, and waits for the user's approval", () => {
    SAMPLE_SHOP_ORDERS.forEach((order) => {
      expect(order).toMatchObject({ sellerId: CURRENT_USER.id, seller: CURRENT_USER.shopName, approvedAt: null });
      expect(order.buyer).toBe(BUYER_NAMES_BY_ID.get(order.buyerId));
      expect(order.buyerId).not.toBe(CURRENT_USER.id);
    });
    expect(new Set(SAMPLE_SHOP_ORDERS.map((order) => order.buyerId)).size).toBeGreaterThanOrEqual(4);
  });

  it("holds the shop's own products, priced at the sum of its items", () => {
    SAMPLE_SHOP_ORDERS.forEach((order) => {
      order.items.forEach((item) => {
        expect(SHOP_PRODUCTS_BY_ID.get(item.productId)).toMatchObject({ title: item.title, price: item.unitPrice });
      });
      expect(order.price).toBe(getItemsTotal(order.items));
    });
  });

  it("was placed during the 14 days up to November 10, 2026", () => {
    SAMPLE_SHOP_ORDERS.forEach((order) => {
      expect(order.placedAt >= "2026-10-27T21:30:00.000Z" && order.placedAt <= "2026-11-10T21:30:00.000Z").toBe(true);
    });
  });
});

describe("SAMPLE_ORDERS", () => {
  it("holds every sample order once and numbers new orders after the highest one", () => {
    const ids = SAMPLE_ORDERS.map((order) => order.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FIRST_NEW_ORDER_NUMBER).toBe(FIRST_SHOP_ORDER_NUMBER + SAMPLE_SHOP_ORDER_COUNT);
  });
});
