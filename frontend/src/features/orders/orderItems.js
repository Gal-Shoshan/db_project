/**
 * @file Prices and numbers of orders: line totals, order totals and order numbers.
 *
 * Cart lines have the same unitPrice and quantity fields as order items, so
 * the cart uses these totals too.
 */

import { roundToCents } from "@/utils/money.js";

/**
 * A product line of an order.
 *
 * @typedef {object} OrderItem
 * @property {string} productId - Product code from the catalog.
 * @property {string} title - Product name at the time of the order.
 * @property {number} quantity - Number of units ordered, at least 1.
 * @property {number} unitPrice - Price of one unit in dollars.
 */

const ORDER_NUMBER_PREFIX = "ORD-";

/**
 * Returns the price of one order line: its unit price times its quantity.
 *
 * @param {{unitPrice: number, quantity: number}} item - The order line or cart line.
 * @returns {number} The line total in dollars, rounded to cents.
 */
export function getLineTotal(item) {
  return roundToCents(item.unitPrice * item.quantity);
}

/**
 * Returns the total price of several order lines.
 *
 * @param {ReadonlyArray<{unitPrice: number, quantity: number}>} items - The order lines or cart lines.
 * @returns {number} The total in dollars, rounded to cents; 0 for no lines.
 */
export function getItemsTotal(items) {
  return roundToCents(items.reduce((total, item) => total + getLineTotal(item), 0));
}

/**
 * Returns the order number shown to the user for a running number.
 *
 * @param {number} orderNumber - Running number of the order, for example 1001.
 * @returns {string} The order number, for example "ORD-1001".
 */
export function formatOrderId(orderNumber) {
  return `${ORDER_NUMBER_PREFIX}${orderNumber}`;
}

/**
 * Returns the running number after the highest order number in a list.
 *
 * @param {ReadonlyArray<{id: string}>} orders - Orders with numbers such as "ORD-1001".
 * @returns {number} The next free running number.
 */
export function getNextOrderNumber(orders) {
  const orderNumbers = orders.map((order) => Number(order.id.slice(ORDER_NUMBER_PREFIX.length)));
  return Math.max(...orderNumbers) + 1;
}
