/**
 * @file React context that carries the shared order list and the actions that place, approve and remove orders.
 */

import { createContext } from "react";

/**
 * Context value: the order list and its actions, or null outside OrdersProvider.
 *
 * @type {import("react").Context<import("./useOrders.js").OrderStore | null>}
 */
export const OrdersContext = createContext(null);
