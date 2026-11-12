/**
 * @file Tests for the shared order list: each page's part of it, and placing, approving and removing orders.
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CURRENT_USER } from "@/features/users/users.js";
import { selectOrdersAwaitingApprovalBy, selectPendingOrdersOf, selectPurchasesOf } from "./orderSelectors.js";
import OrdersProvider from "./OrdersProvider.jsx";
import { FIRST_NEW_ORDER_NUMBER } from "./sampleOrders.js";
import { SAMPLE_PENDING_ORDERS } from "./samplePendingOrders.js";
import { SAMPLE_PURCHASES } from "./samplePurchases.js";
import { SAMPLE_SHOP_ORDERS } from "./sampleShopOrders.js";
import { useOrders } from "./useOrders.js";

const SHOP_ORDER = SAMPLE_SHOP_ORDERS[0];

/**
 * Renders the order store and returns a handle to its current value.
 *
 * @returns {{current: import("./useOrders.js").OrderStore}} The store, updated after each change.
 */
function renderOrderStore() {
  return renderHook(() => useOrders(), { wrapper: OrdersProvider }).result;
}

/**
 * Returns the order numbers of a list of orders.
 *
 * @param {ReadonlyArray<{id: string}>} orders - The orders.
 * @returns {string[]} The order numbers.
 */
const ids = (orders) => orders.map((order) => order.id);

describe("OrdersProvider", () => {
  it("shows each page its own part of the sample orders", () => {
    const store = renderOrderStore();

    expect(ids(selectPendingOrdersOf(store.current.orders, CURRENT_USER.id))).toEqual(ids(SAMPLE_PENDING_ORDERS));
    expect(ids(selectPurchasesOf(store.current.orders, CURRENT_USER.id))).toEqual(ids(SAMPLE_PURCHASES));
    expect(ids(selectOrdersAwaitingApprovalBy(store.current.orders, CURRENT_USER.id))).toEqual(ids(SAMPLE_SHOP_ORDERS));
  });

  it("moves an approved order from the buyer's pending orders to their purchases, and off the seller's list", () => {
    const store = renderOrderStore();

    act(() => store.current.approveOrder(SHOP_ORDER.id));

    const { orders } = store.current;
    expect(ids(selectPendingOrdersOf(orders, SHOP_ORDER.buyerId))).not.toContain(SHOP_ORDER.id);
    expect(ids(selectPurchasesOf(orders, SHOP_ORDER.buyerId))).toContain(SHOP_ORDER.id);
    expect(ids(selectOrdersAwaitingApprovalBy(orders, CURRENT_USER.id))).not.toContain(SHOP_ORDER.id);
    expect(orders.find((order) => order.id === SHOP_ORDER.id).approvedAt).toEqual(expect.any(String));
  });

  it("deletes a removed order from both the seller's list and the buyer's pending orders", () => {
    const store = renderOrderStore();
    expect(ids(selectPendingOrdersOf(store.current.orders, SHOP_ORDER.buyerId))).toContain(SHOP_ORDER.id);

    act(() => store.current.removeOrder(SHOP_ORDER.id));

    const { orders } = store.current;
    expect(ids(selectOrdersAwaitingApprovalBy(orders, CURRENT_USER.id))).not.toContain(SHOP_ORDER.id);
    expect(ids(selectPendingOrdersOf(orders, SHOP_ORDER.buyerId))).not.toContain(SHOP_ORDER.id);
    expect(orders).toHaveLength(SAMPLE_PURCHASES.length + SAMPLE_PENDING_ORDERS.length + SAMPLE_SHOP_ORDERS.length - 1);
  });

  it("numbers placed orders after every existing order", () => {
    const store = renderOrderStore();
    const draft = { ...SAMPLE_PENDING_ORDERS[0], placedAt: "2026-11-12T10:00:00.000Z" };
    delete draft.id;

    let placedOrders = [];
    act(() => {
      placedOrders = store.current.placeOrders([draft, draft]);
    });

    expect(ids(placedOrders)).toEqual([`ORD-${FIRST_NEW_ORDER_NUMBER}`, `ORD-${FIRST_NEW_ORDER_NUMBER + 1}`]);
    expect(ids(selectPendingOrdersOf(store.current.orders, CURRENT_USER.id))).toContain(`ORD-${FIRST_NEW_ORDER_NUMBER}`);
  });
});
