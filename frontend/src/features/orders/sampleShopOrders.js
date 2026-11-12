/**
 * @file Sample orders that made-up buyers placed with the signed-in user's shop, waiting for the user's approval.
 *
 * The orders hold products of the shop's sample product list, and are built
 * with a seeded pseudo-random generator, so they are the same on every load
 * and in every test. They were placed during the 14 days up to the evening of
 * November 10, 2026, and are numbered from ORD-2001, apart from the user's own
 * orders.
 */

import { SAMPLE_SHOP_PRODUCTS } from "@/features/shop/sampleShopProducts.js";
import { CURRENT_USER, SAMPLE_BUYERS } from "@/features/users/users.js";
import { createSeededRandom, pickFrom, randomInteger } from "@/utils/seededRandom.js";
import { getItemsTotal } from "./orderItems.js";
import { MINUTES_PER_DAY, createRandomItems, minutesBefore, numberInOrderPlaced } from "./sampleOrderParts.js";

/** Number of sample orders placed with the user's shop. */
export const SAMPLE_SHOP_ORDER_COUNT = 18;

/** Running number of the earliest sample order placed with the user's shop. */
export const FIRST_SHOP_ORDER_NUMBER = 2001;

const RANDOM_SEED = 20261109;
const LATEST_ORDER_TIME_MS = Date.parse("2026-11-10T21:30:00Z");
const MAX_ORDER_AGE_DAYS = 14;

/**
 * Builds one sample order from a made-up buyer to the user's shop, without its order number.
 *
 * @param {function(): number} random - Random number generator.
 * @returns {Omit<import("./orderSelectors.js").Order, "id">} The order.
 */
function createShopOrder(random) {
  const buyer = pickFrom(random, SAMPLE_BUYERS);
  const items = createRandomItems(random, SAMPLE_SHOP_PRODUCTS);
  const ageMinutes = randomInteger(random, 0, MAX_ORDER_AGE_DAYS * MINUTES_PER_DAY);

  return {
    placedAt: new Date(minutesBefore(LATEST_ORDER_TIME_MS, ageMinutes)).toISOString(),
    approvedAt: null,
    buyerId: buyer.id,
    buyer: buyer.name,
    sellerId: CURRENT_USER.id,
    seller: CURRENT_USER.shopName,
    items,
    price: getItemsTotal(items),
  };
}

/**
 * Builds the sample shop orders from the fixed seed, numbered in the order they were placed.
 *
 * @returns {ReadonlyArray<import("./orderSelectors.js").Order>} The orders, oldest first.
 */
function buildSampleShopOrders() {
  const random = createSeededRandom(RANDOM_SEED);
  return numberInOrderPlaced(
    Array.from({ length: SAMPLE_SHOP_ORDER_COUNT }, () => createShopOrder(random)),
    FIRST_SHOP_ORDER_NUMBER,
  );
}

/**
 * The sample orders placed with the user's shop, oldest first.
 *
 * @type {ReadonlyArray<import("./orderSelectors.js").Order>}
 */
export const SAMPLE_SHOP_ORDERS = buildSampleShopOrders();
