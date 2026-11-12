/**
 * @file Hook that reads the shared order list from OrdersProvider.
 */

import { useContext } from "react";
import { OrdersContext } from "./OrdersContext.js";

/**
 * The shared order list and the actions on it.
 *
 * @typedef {object} OrderStore
 * @property {ReadonlyArray<import("./orderSelectors.js").Order>} orders - Every order, of every buyer and seller.
 * @property {function(ReadonlyArray<object>): import("./orderSelectors.js").Order[]} placeOrders - Numbers and adds new orders, and returns them.
 * @property {function(string): void} approveOrder - Marks the order with the given number as approved now.
 * @property {function(string): void} removeOrder - Deletes the order with the given number, for its buyer and its seller.
 */

/**
 * Returns the shared order list and its actions.
 *
 * @returns {OrderStore} The order store.
 * @throws {Error} If called outside OrdersProvider.
 */
export function useOrders() {
  const store = useContext(OrdersContext);
  if (store === null) {
    throw new Error("useOrders must be used inside OrdersProvider.");
  }
  return store;
}
