/**
 * @file The whole sample order list the app starts with, and the number the next new order gets.
 */

import { getNextOrderNumber } from "./orderItems.js";
import { SAMPLE_PENDING_ORDERS } from "./samplePendingOrders.js";
import { SAMPLE_PURCHASES } from "./samplePurchases.js";
import { SAMPLE_SHOP_ORDERS } from "./sampleShopOrders.js";

/**
 * Every sample order: the user's purchases and pending orders, and the orders placed with the user's shop.
 *
 * @type {ReadonlyArray<import("./orderSelectors.js").Order>}
 */
export const SAMPLE_ORDERS = Object.freeze([...SAMPLE_PURCHASES, ...SAMPLE_PENDING_ORDERS, ...SAMPLE_SHOP_ORDERS]);

/** Running number of the first order placed after the app starts: one more than the highest sample number. */
export const FIRST_NEW_ORDER_NUMBER = getNextOrderNumber(SAMPLE_ORDERS);
