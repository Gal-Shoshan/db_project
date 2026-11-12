/**
 * @file Tests that the sample pending orders are complete and their data is valid.
 */

import { describe, expect, it } from "vitest";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { SELLERS } from "@/features/sellers/sellers.js";
import { CURRENT_USER } from "@/features/users/users.js";
import { roundToCents } from "@/utils/money.js";
import { ORDER_PRICE_RANGES } from "./ordersConfig.js";
import { NO_ORDER_FILTERS } from "./orderListQuery.js";
import { PENDING_ORDERS_LIST } from "./orderLists.js";
import { MAX_ITEMS_PER_ORDER, MAX_QUANTITY_PER_ITEM } from "./sampleOrderParts.js";
import { FIRST_PENDING_ORDER_NUMBER, SAMPLE_PENDING_ORDER_COUNT, SAMPLE_PENDING_ORDERS } from "./samplePendingOrders.js";
import { SAMPLE_PURCHASES } from "./samplePurchases.js";
import { filterOrders } from "./searchOrders.js";

const PRODUCTS_BY_ID = new Map(SAMPLE_PRODUCTS.map((product) => [product.id, product]));
const SELLER_NAMES_BY_ID = new Map(SELLERS.map((seller) => [seller.id, seller.name]));

describe("SAMPLE_PENDING_ORDERS", () => {
  it("has 24 orders, numbered after the purchases in the order they were placed", () => {
    expect(SAMPLE_PENDING_ORDERS).toHaveLength(SAMPLE_PENDING_ORDER_COUNT);
    SAMPLE_PENDING_ORDERS.forEach((order, index) => {
      expect(order.id).toBe(`ORD-${FIRST_PENDING_ORDER_NUMBER + index}`);
      if (index > 0) {
        expect(order.placedAt >= SAMPLE_PENDING_ORDERS[index - 1].placedAt).toBe(true);
      }
    });
  });

  it("has known sellers and in-stock products of that seller, with valid quantities", () => {
    SAMPLE_PENDING_ORDERS.forEach((order) => {
      expect(order).toMatchObject({ buyerId: CURRENT_USER.id, approvedAt: null });
      expect(order.seller).toBe(SELLER_NAMES_BY_ID.get(order.sellerId));
      expect(order.items.length).toBeGreaterThanOrEqual(1);
      expect(order.items.length).toBeLessThanOrEqual(MAX_ITEMS_PER_ORDER);
      expect(new Set(order.items.map((item) => item.productId)).size).toBe(order.items.length);
      order.items.forEach((item) => {
        const product = PRODUCTS_BY_ID.get(item.productId);
        expect(product.inStock).toBe(true);
        expect(product.sellerId).toBe(order.sellerId);
        expect(item.title).toBe(product.title);
        expect(item.unitPrice).toBe(product.price);
        expect(item.quantity).toBeGreaterThanOrEqual(1);
        expect(item.quantity).toBeLessThanOrEqual(MAX_QUANTITY_PER_ITEM);
      });
    });
  });

  it("prices each order at the sum of its items", () => {
    SAMPLE_PENDING_ORDERS.forEach((order) => {
      const itemsTotal = order.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      expect(order.price).toBe(roundToCents(itemsTotal));
    });
  });

  it("was placed after every purchase", () => {
    const latestPurchase = SAMPLE_PURCHASES.at(-1).placedAt;
    SAMPLE_PENDING_ORDERS.forEach((order) => expect(order.placedAt > latestPurchase).toBe(true));
  });

  it("was placed within the 45 days up to November 10, 2026", () => {
    const earliest = new Date(Date.parse("2026-11-10T21:30:00Z") - 45 * 24 * 60 * 60_000).toISOString();
    SAMPLE_PENDING_ORDERS.forEach((order) => {
      expect(order.placedAt >= earliest && order.placedAt <= "2026-11-10T21:30:00.000Z").toBe(true);
    });
  });

  it("spreads over several sellers and price ranges, so every filter has something to show", () => {
    expect(new Set(SAMPLE_PENDING_ORDERS.map((order) => order.sellerId)).size).toBeGreaterThanOrEqual(4);
    const usedPriceRanges = ORDER_PRICE_RANGES.filter(
      (range) => filterOrders(SAMPLE_PENDING_ORDERS, { ...NO_ORDER_FILTERS, price: range.id }, PENDING_ORDERS_LIST).length > 0,
    );
    expect(usedPriceRanges.length).toBeGreaterThanOrEqual(3);
  });
});
