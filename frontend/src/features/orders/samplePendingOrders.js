/**
 * @file Sample orders of the signed-in user that the sellers have not approved yet, used until orders come from an API.
 *
 * Orders are built from the sample catalog with a seeded pseudo-random
 * generator, so they are the same on every load and in every test. Each order
 * holds in-stock products of its own seller, and the orders were placed during
 * the 45 days up to the evening of November 10, 2026, after every sample
 * purchase, so their numbers follow the purchases' numbers.
 */

import { CURRENT_USER } from "@/features/users/users.js";
import { createSeededRandom, randomInteger } from "@/utils/seededRandom.js";
import {
  IN_STOCK_PRODUCTS_BY_SELLER,
  MINUTES_PER_DAY,
  createRandomOrderContents,
  minutesBefore,
  numberInOrderPlaced,
} from "./sampleOrderParts.js";
import { FIRST_PURCHASE_NUMBER, SAMPLE_PURCHASE_COUNT } from "./samplePurchases.js";

/**
 * An order of the signed-in user that the seller has not approved yet, so its approval date is null.
 *
 * @typedef {import("./orderSelectors.js").Order} PendingOrder
 */

/** Number of orders in the sample list. */
export const SAMPLE_PENDING_ORDER_COUNT = 24;

/** Running number of the earliest sample pending order, right after the last sample purchase. */
export const FIRST_PENDING_ORDER_NUMBER = FIRST_PURCHASE_NUMBER + SAMPLE_PURCHASE_COUNT;

const RANDOM_SEED = 20261110;
const LATEST_ORDER_TIME_MS = Date.parse("2026-11-10T21:30:00Z");
const MAX_ORDER_AGE_DAYS = 45;

/**
 * Builds one sample order without its order number.
 *
 * @param {function(): number} random - Random number generator.
 * @returns {Omit<PendingOrder, "id">} The order.
 */
function createOrder(random) {
  const contents = createRandomOrderContents(random, IN_STOCK_PRODUCTS_BY_SELLER);
  const ageMinutes = randomInteger(random, 0, MAX_ORDER_AGE_DAYS * MINUTES_PER_DAY);
  return {
    placedAt: new Date(minutesBefore(LATEST_ORDER_TIME_MS, ageMinutes)).toISOString(),
    approvedAt: null,
    buyerId: CURRENT_USER.id,
    buyer: CURRENT_USER.name,
    ...contents,
  };
}

/**
 * Builds the sample orders from the fixed seed, numbered in the order they were placed.
 *
 * @returns {ReadonlyArray<PendingOrder>} The orders, oldest first.
 */
function buildSamplePendingOrders() {
  const random = createSeededRandom(RANDOM_SEED);
  return numberInOrderPlaced(
    Array.from({ length: SAMPLE_PENDING_ORDER_COUNT }, () => createOrder(random)),
    FIRST_PENDING_ORDER_NUMBER,
  );
}

/**
 * The sample pending orders, oldest first.
 *
 * @type {ReadonlyArray<PendingOrder>}
 */
export const SAMPLE_PENDING_ORDERS = buildSamplePendingOrders();
