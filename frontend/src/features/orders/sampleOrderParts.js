/**
 * @file Building blocks shared by the sample order lists: a seller's products, random items, timestamps and order numbers.
 */

import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { SELLERS } from "@/features/sellers/sellers.js";
import { pickFrom, randomInteger } from "@/utils/seededRandom.js";
import { formatOrderId, getItemsTotal } from "./orderItems.js";

/** Most product lines in one sample order. */
export const MAX_ITEMS_PER_ORDER = 4;

/** Most units of one product in one sample order. */
export const MAX_QUANTITY_PER_ITEM = 3;

/** Minutes in one day, for spreading sample orders over a number of days. */
export const MINUTES_PER_DAY = 24 * 60;

const MS_PER_MINUTE = 60_000;

/**
 * Returns the given catalog products grouped by the seller that sells them.
 *
 * @param {ReadonlyArray<import("@/features/catalog/sampleProducts.js").Product>} products - Products to group.
 * @returns {Map<string, import("@/features/catalog/sampleProducts.js").Product[]>} The products, by seller id.
 */
function groupProductsBySeller(products) {
  const productsBySeller = new Map(SELLERS.map((seller) => [seller.id, []]));
  products.forEach((product) => productsBySeller.get(product.sellerId).push(product));
  return productsBySeller;
}

/** Every catalog product, by seller id. */
export const PRODUCTS_BY_SELLER = groupProductsBySeller(SAMPLE_PRODUCTS);

/** The catalog products that can be ordered now, by seller id. */
export const IN_STOCK_PRODUCTS_BY_SELLER = groupProductsBySeller(SAMPLE_PRODUCTS.filter((product) => product.inStock));

/**
 * Returns the given number of different products, picked at random.
 *
 * @template {{id: string}} Product
 * @param {function(): number} random - Random number generator.
 * @param {ReadonlyArray<Product>} products - Products to pick from.
 * @param {number} count - How many products to pick; must not exceed the number of products.
 * @returns {Product[]} The picked products.
 */
function pickDistinctProducts(random, products, count) {
  const pickedById = new Map();
  while (pickedById.size < count) {
    const product = pickFrom(random, products);
    pickedById.set(product.id, product);
  }
  return [...pickedById.values()];
}

/**
 * Picks one to MAX_ITEMS_PER_ORDER different products with random quantities from 1 to MAX_QUANTITY_PER_ITEM.
 *
 * @param {function(): number} random - Random number generator.
 * @param {ReadonlyArray<{id: string, title: string, price: number}>} products - Products to pick from.
 * @returns {import("./orderItems.js").OrderItem[]} The order items.
 */
export function createRandomItems(random, products) {
  const pickedProducts = pickDistinctProducts(random, products, randomInteger(random, 1, MAX_ITEMS_PER_ORDER));
  return pickedProducts.map((product) => ({
    productId: product.id,
    title: product.title,
    quantity: randomInteger(random, 1, MAX_QUANTITY_PER_ITEM),
    unitPrice: product.price,
  }));
}

/**
 * Picks a seller at random, then random items from the seller's products.
 *
 * @param {function(): number} random - Random number generator.
 * @param {Map<string, import("@/features/catalog/sampleProducts.js").Product[]>} productsBySeller - Products to pick from, by seller id.
 * @returns {{sellerId: string, seller: string, items: import("./orderItems.js").OrderItem[], price: number}} The order's seller, items and total.
 */
export function createRandomOrderContents(random, productsBySeller) {
  const seller = pickFrom(random, SELLERS);
  const items = createRandomItems(random, productsBySeller.get(seller.id));
  return { sellerId: seller.id, seller: seller.name, items, price: getItemsTotal(items) };
}

/**
 * Returns the moment a number of minutes before another one.
 *
 * @param {number} timeMs - The later moment, in milliseconds since 1970.
 * @param {number} minutes - How many minutes earlier.
 * @returns {number} The earlier moment, in milliseconds since 1970.
 */
export function minutesBefore(timeMs, minutes) {
  return timeMs - minutes * MS_PER_MINUTE;
}

/**
 * Returns the moment a number of minutes after another one.
 *
 * @param {number} timeMs - The earlier moment, in milliseconds since 1970.
 * @param {number} minutes - How many minutes later.
 * @returns {number} The later moment, in milliseconds since 1970.
 */
export function minutesAfter(timeMs, minutes) {
  return timeMs + minutes * MS_PER_MINUTE;
}

/**
 * Sorts orders by the time they were placed and numbers them in that order.
 *
 * @template {{placedAt: string}} Order
 * @param {Order[]} orders - Orders without numbers.
 * @param {number} firstOrderNumber - Running number of the earliest order.
 * @returns {ReadonlyArray<Order & {id: string}>} The numbered orders, oldest first.
 */
export function numberInOrderPlaced(orders, firstOrderNumber) {
  const oldestFirst = [...orders].sort((left, right) => left.placedAt.localeCompare(right.placedAt));
  return Object.freeze(
    oldestFirst.map((order, index) => Object.freeze({ id: formatOrderId(firstOrderNumber + index), ...order })),
  );
}
