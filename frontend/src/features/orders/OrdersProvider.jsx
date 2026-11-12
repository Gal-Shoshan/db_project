/**
 * @file Provider that holds the marketplace's shared order list for the personal area.
 *
 * Each order is stored once, with its buyer and its seller, the way a server
 * would keep it. The pages show parts of this list: the user's Pending Orders
 * and Purchases in the Buy mode, and the orders waiting for the user's
 * approval in the Sell mode. The list starts as the sample orders, lives in
 * memory and starts over at the next sign-in; no server is told about changes.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { formatOrderId } from "./orderItems.js";
import { OrdersContext } from "./OrdersContext.js";
import { FIRST_NEW_ORDER_NUMBER, SAMPLE_ORDERS } from "./sampleOrders.js";

/**
 * Provides the order list and the placeOrders, approveOrder and removeOrder actions to everything inside it.
 *
 * @param {object} props - Provider props.
 * @param {import("react").ReactNode} props.children - The part of the app that can use the orders.
 * @returns {JSX.Element} The provider.
 */
export default function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const nextOrderNumberRef = useRef(FIRST_NEW_ORDER_NUMBER);

  /**
   * Gives each new order the next order number and adds it to the list.
   *
   * @param {ReadonlyArray<Omit<import("./orderSelectors.js").Order, "id">>} newOrders - Orders without numbers.
   * @returns {import("./orderSelectors.js").Order[]} The placed orders, with their numbers.
   */
  const placeOrders = useCallback((newOrders) => {
    const firstNumber = nextOrderNumberRef.current;
    const placedOrders = newOrders.map((order, index) => ({ id: formatOrderId(firstNumber + index), ...order }));
    nextOrderNumberRef.current = firstNumber + newOrders.length;
    setOrders((currentOrders) => [...currentOrders, ...placedOrders]);
    return placedOrders;
  }, []);

  /**
   * Marks an order as approved by its seller now, which moves it to the buyer's Purchases.
   *
   * @param {string} orderId - Order number, for example "ORD-2001".
   */
  const approveOrder = useCallback((orderId) => {
    const approvedAt = new Date().toISOString();
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? { ...order, approvedAt } : order)),
    );
  }, []);

  /**
   * Deletes an order, so it leaves both the buyer's and the seller's lists; does nothing for an unknown number.
   *
   * @param {string} orderId - Order number, for example "ORD-1037".
   */
  const removeOrder = useCallback((orderId) => {
    setOrders((currentOrders) => currentOrders.filter((order) => order.id !== orderId));
  }, []);

  const store = useMemo(
    () => ({ orders, placeOrders, approveOrder, removeOrder }),
    [orders, placeOrders, approveOrder, removeOrder],
  );

  return <OrdersContext value={store}>{children}</OrdersContext>;
}
