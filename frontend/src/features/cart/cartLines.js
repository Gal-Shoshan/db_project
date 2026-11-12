/**
 * @file Rules of the shopping cart: adding products or an earlier order's items, changing quantities, removing lines, totals, and turning the cart into orders.
 *
 * These are pure functions that return a new list of lines and never change
 * the one they are given, so the cart provider can use them in state updates.
 */

import { getItemsTotal } from "@/features/orders/orderItems.js";
import { getSeller } from "@/features/sellers/sellers.js";

/**
 * A product in the cart, with the details an order needs.
 *
 * @typedef {object} CartLine
 * @property {string} productId - Product code from the catalog.
 * @property {string} title - Product name.
 * @property {number} unitPrice - Price of one unit in dollars, when it was added.
 * @property {string} sellerId - Seller id from SELLERS.
 * @property {number} quantity - Number of units, from 1 to MAX_QUANTITY_PER_PRODUCT.
 */

/** Most units of one product the cart holds. */
export const MAX_QUANTITY_PER_PRODUCT = 10;

/** Fewest units of a product in the cart; going lower means removing the product. */
export const MIN_QUANTITY_PER_PRODUCT = 1;

/**
 * The cart with nothing in it.
 *
 * @type {ReadonlyArray<CartLine>}
 */
export const EMPTY_CART = Object.freeze([]);

/**
 * Keeps a quantity within the cart's limits.
 *
 * @param {number} quantity - Requested quantity.
 * @returns {number} The quantity, between MIN_QUANTITY_PER_PRODUCT and MAX_QUANTITY_PER_PRODUCT.
 */
const clampQuantity = (quantity) => Math.min(Math.max(quantity, MIN_QUANTITY_PER_PRODUCT), MAX_QUANTITY_PER_PRODUCT);

/**
 * Returns how many units of a product are in the cart.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {string} productId - Product code.
 * @returns {number} The quantity; 0 when the product is not in the cart.
 */
export function getQuantityInCart(lines, productId) {
  return lines.find((line) => line.productId === productId)?.quantity ?? 0;
}

/**
 * Changes the quantity of a product in the cart, within the cart's limits.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {string} productId - Product code.
 * @param {number} change - Units to add, or a negative number of units to take away.
 * @returns {ReadonlyArray<CartLine>} The new cart lines.
 */
export function changeQuantity(lines, productId, change) {
  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: clampQuantity(line.quantity + change) } : line,
  );
}

/**
 * Adds units of a product: a new line at the end, or more units on the product's line, up to MAX_QUANTITY_PER_PRODUCT.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {import("@/features/catalog/sampleProducts.js").Product} product - The product to add; out-of-stock products are not added.
 * @param {number} units - How many units to add, at least 1.
 * @returns {ReadonlyArray<CartLine>} The new cart lines.
 */
function addUnits(lines, product, units) {
  if (!product.inStock) {
    return lines;
  }
  if (getQuantityInCart(lines, product.id) > 0) {
    return changeQuantity(lines, product.id, units);
  }
  const newLine = {
    productId: product.id,
    title: product.title,
    unitPrice: product.price,
    sellerId: product.sellerId,
    quantity: clampQuantity(units),
  };
  return [...lines, newLine];
}

/**
 * Adds one unit of a product: a new line at the end, or one more unit on the product's line.
 *
 * Products that are out of stock, and products already at MAX_QUANTITY_PER_PRODUCT, are not added.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {import("@/features/catalog/sampleProducts.js").Product} product - The product to add.
 * @returns {ReadonlyArray<CartLine>} The new cart lines.
 */
export function addProductToCart(lines, product) {
  return addUnits(lines, product, 1);
}

/**
 * What adding an earlier order's items to the cart did.
 *
 * @typedef {object} ReorderResult
 * @property {ReadonlyArray<CartLine>} lines - The new cart lines.
 * @property {number} addedUnits - Units that were added.
 * @property {number} unitsOverLimit - Units of in-stock products left out because the product reached MAX_QUANTITY_PER_PRODUCT.
 * @property {string[]} unavailableTitles - Products not added because they are out of stock or no longer sold.
 */

/**
 * Adds the items of an earlier order to the cart, with their quantities, at today's catalog prices.
 *
 * Products that are out of stock or no longer sold are left out, and no
 * product goes past MAX_QUANTITY_PER_PRODUCT.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {ReadonlyArray<import("@/features/orders/orderItems.js").OrderItem>} items - The order's items.
 * @param {function(string): (import("@/features/catalog/sampleProducts.js").Product | undefined)} findProduct - Returns the catalog product with a code.
 * @returns {ReorderResult} The new cart lines and what was added.
 */
export function addOrderItemsToCart(lines, items, findProduct) {
  let nextLines = lines;
  let addedUnits = 0;
  let unitsOverLimit = 0;
  const unavailableTitles = [];
  for (const item of items) {
    const product = findProduct(item.productId);
    if (!product?.inStock) {
      unavailableTitles.push(item.title);
      continue;
    }
    const quantityBefore = getQuantityInCart(nextLines, product.id);
    nextLines = addUnits(nextLines, product, item.quantity);
    const unitsAdded = getQuantityInCart(nextLines, product.id) - quantityBefore;
    addedUnits += unitsAdded;
    unitsOverLimit += item.quantity - unitsAdded;
  }
  return { lines: nextLines, addedUnits, unitsOverLimit, unavailableTitles };
}

/**
 * Removes a product from the cart.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {string} productId - Product code.
 * @returns {ReadonlyArray<CartLine>} The new cart lines.
 */
export function removeFromCart(lines, productId) {
  return lines.filter((line) => line.productId !== productId);
}

/**
 * Returns the number of units in the cart and their total price.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @returns {{itemCount: number, total: number}} The number of units, and the total in dollars.
 */
export function getCartSummary(lines) {
  return {
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
    total: getItemsTotal(lines),
  };
}

/**
 * Groups the cart lines by seller, keeping the order in which each seller first appears.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @returns {Map<string, CartLine[]>} The lines of each seller, by seller id.
 */
function groupLinesBySeller(lines) {
  const linesBySeller = new Map();
  lines.forEach((line) => {
    linesBySeller.set(line.sellerId, [...(linesBySeller.get(line.sellerId) ?? []), line]);
  });
  return linesBySeller;
}

/**
 * Turns the cart into orders, one per seller, because each seller approves their own order.
 *
 * @param {ReadonlyArray<CartLine>} lines - The cart lines.
 * @param {string} placedAt - When the orders are placed, as an ISO 8601 timestamp.
 * @param {{id: string, name: string}} buyer - The user placing the orders.
 * @returns {Array<Omit<import("@/features/orders/orderSelectors.js").Order, "id">>} The orders, waiting for approval and without order numbers.
 */
export function createOrdersFromCart(lines, placedAt, buyer) {
  return [...groupLinesBySeller(lines)].map(([sellerId, sellerLines]) => {
    const items = sellerLines.map(({ productId, title, quantity, unitPrice }) => ({
      productId,
      title,
      quantity,
      unitPrice,
    }));
    return {
      placedAt,
      approvedAt: null,
      buyerId: buyer.id,
      buyer: buyer.name,
      sellerId,
      seller: getSeller(sellerId).name,
      items,
      price: getItemsTotal(items),
    };
  });
}
