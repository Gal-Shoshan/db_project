/**
 * @file The marketplace's order record, and the parts of the shared order list each page shows.
 *
 * Every order is stored once, with its buyer and its seller. The buyer's
 * Pending Orders and Purchases and the seller's Orders are views of the same
 * list, so removing an order removes it from all of them, and approving an
 * order moves it from the buyer's Pending Orders to their Purchases.
 */

/**
 * An order between a buyer and a seller.
 *
 * @typedef {object} Order
 * @property {string} id - Order number, for example "ORD-1001".
 * @property {string} placedAt - When the buyer placed the order, as an ISO 8601 UTC timestamp.
 * @property {string | null} approvedAt - When the seller approved the order, or null while it waits for approval.
 * @property {string} buyerId - Id of the user who placed the order.
 * @property {string} buyer - Name of the buyer.
 * @property {string} sellerId - Id of the seller who receives the order.
 * @property {string} seller - Name of the seller.
 * @property {import("./orderItems.js").OrderItem[]} items - Ordered products, each product once.
 * @property {number} price - Total price of the order in dollars.
 */

/**
 * Returns whether the order still waits for the seller's approval.
 *
 * @param {Order} order - The order.
 * @returns {boolean} True until the seller approves it.
 */
export function isAwaitingApproval(order) {
  return order.approvedAt === null;
}

/**
 * Returns a buyer's orders that wait for the seller's approval: the buyer's Pending Orders.
 *
 * @param {ReadonlyArray<Order>} orders - The shared order list.
 * @param {string} buyerId - Id of the buyer.
 * @returns {Order[]} The pending orders, in list order.
 */
export function selectPendingOrdersOf(orders, buyerId) {
  return orders.filter((order) => order.buyerId === buyerId && isAwaitingApproval(order));
}

/**
 * Returns a buyer's orders that the seller approved: the buyer's Purchases.
 *
 * @param {ReadonlyArray<Order>} orders - The shared order list.
 * @param {string} buyerId - Id of the buyer.
 * @returns {Order[]} The purchases, in list order.
 */
export function selectPurchasesOf(orders, buyerId) {
  return orders.filter((order) => order.buyerId === buyerId && !isAwaitingApproval(order));
}

/**
 * Returns the orders placed with a seller that wait for the seller's approval: the seller's Orders.
 *
 * @param {ReadonlyArray<Order>} orders - The shared order list.
 * @param {string} sellerId - Id of the seller.
 * @returns {Order[]} The orders to approve, in list order.
 */
export function selectOrdersAwaitingApprovalBy(orders, sellerId) {
  return orders.filter((order) => order.sellerId === sellerId && isAwaitingApproval(order));
}
