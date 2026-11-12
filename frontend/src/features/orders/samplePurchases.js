/**
 * @file Sample purchases: orders of the signed-in user that the sellers approved, used until they come from an API.
 *
 * Purchases are built from the sample catalog with a seeded pseudo-random
 * generator, so they are the same on every load and in every test. They were
 * placed from early May to late September 2026, before any pending order, and
 * each seller approved theirs one hour to three days later. Some of their
 * products are out of stock now.
 */

import { CURRENT_USER } from "@/features/users/users.js";
import { createSeededRandom, randomInteger } from "@/utils/seededRandom.js";
import {
  MINUTES_PER_DAY,
  PRODUCTS_BY_SELLER,
  createRandomOrderContents,
  minutesAfter,
  minutesBefore,
  numberInOrderPlaced,
} from "./sampleOrderParts.js";

/**
 * An order of the signed-in user that the seller approved, so it has an approval date.
 *
 * @typedef {import("./orderSelectors.js").Order} Purchase
 */

/** Number of purchases in the sample list. */
export const SAMPLE_PURCHASE_COUNT = 36;

/** Running number of the earliest sample purchase, which is also the earliest order of all. */
export const FIRST_PURCHASE_NUMBER = 1001;

/** Shortest time a sample seller took to accept an order, in minutes. */
export const MIN_APPROVAL_MINUTES = 60;

/** Longest time a sample seller took to accept an order, in minutes. */
export const MAX_APPROVAL_MINUTES = 3 * MINUTES_PER_DAY;

const RANDOM_SEED = 20260925;
const LATEST_PURCHASE_TIME_MS = Date.parse("2026-09-25T18:00:00Z");
const MAX_PURCHASE_AGE_DAYS = 145;

/**
 * Builds one sample purchase without its order number.
 *
 * @param {function(): number} random - Random number generator.
 * @returns {Omit<Purchase, "id">} The purchase.
 */
function createPurchase(random) {
  const contents = createRandomOrderContents(random, PRODUCTS_BY_SELLER);
  const ageMinutes = randomInteger(random, 0, MAX_PURCHASE_AGE_DAYS * MINUTES_PER_DAY);
  const placedAtMs = minutesBefore(LATEST_PURCHASE_TIME_MS, ageMinutes);
  const approvedAtMs = minutesAfter(placedAtMs, randomInteger(random, MIN_APPROVAL_MINUTES, MAX_APPROVAL_MINUTES));

  return {
    placedAt: new Date(placedAtMs).toISOString(),
    approvedAt: new Date(approvedAtMs).toISOString(),
    buyerId: CURRENT_USER.id,
    buyer: CURRENT_USER.name,
    ...contents,
  };
}

/**
 * Builds the sample purchases from the fixed seed, numbered in the order they were placed.
 *
 * @returns {ReadonlyArray<Purchase>} The purchases, oldest first.
 */
function buildSamplePurchases() {
  const random = createSeededRandom(RANDOM_SEED);
  return numberInOrderPlaced(
    Array.from({ length: SAMPLE_PURCHASE_COUNT }, () => createPurchase(random)),
    FIRST_PURCHASE_NUMBER,
  );
}

/**
 * The sample purchases, oldest first.
 *
 * @type {ReadonlyArray<Purchase>}
 */
export const SAMPLE_PURCHASES = buildSamplePurchases();
