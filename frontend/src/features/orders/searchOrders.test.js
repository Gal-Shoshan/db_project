/**
 * @file Tests for filtering and sorting order lists by their date and person, and for the order date helpers.
 */

import { describe, expect, it } from "vitest";
import { formatOrderDate, formatOrderDateTime, isDateKey, toLocalDateKey } from "./orderDates.js";
import { NO_ORDER_FILTERS } from "./orderListQuery.js";
import { PENDING_ORDERS_LIST, PURCHASES_LIST, SHOP_ORDERS_LIST } from "./orderLists.js";
import { filterOrders, searchOrders, sortOrders } from "./searchOrders.js";

/**
 * Returns the timestamp of a local date and time, so date tests pass in every time zone.
 *
 * @param {number} month - Month number, 1 for January.
 * @param {number} day - Day of the month.
 * @param {number} [hour=12] - Hour of the day, 0 to 23.
 * @returns {string} The ISO 8601 timestamp.
 */
const localTimestamp = (month, day, hour = 12) => new Date(2026, month - 1, day, hour).toISOString();

/**
 * Builds a test order with a single item, approved two days after it was placed.
 *
 * @param {string} id - Order number.
 * @param {string} placedAt - ISO 8601 timestamp of the order.
 * @param {string} sellerId - Seller id.
 * @param {string} seller - Seller name.
 * @param {number} price - Order total in dollars.
 * @returns {import("./orderSelectors.js").Order} The order.
 */
const testOrder = (id, placedAt, sellerId, seller, price) => ({
  id,
  placedAt,
  approvedAt: new Date(Date.parse(placedAt) + 2 * 24 * 60 * 60_000).toISOString(),
  buyerId: `buyer-of-${id}`,
  buyer: `Buyer ${5 - Number(id.slice(4))}`,
  sellerId,
  seller,
  items: [{ productId: "P0001", title: "Test product", quantity: 1, unitPrice: price }],
  price,
});

const ORDERS = Object.freeze([
  testOrder("ORD-1", localTimestamp(10, 1, 0), "harborview", "Harborview Traders", 50),
  testOrder("ORD-2", localTimestamp(10, 15), "brightside", "Brightside Goods", 120),
  testOrder("ORD-3", localTimestamp(10, 31, 23), "harborview", "Harborview Traders", 49.99),
  testOrder("ORD-4", localTimestamp(11, 5), "maple-street", "Maple Street Market", 120),
]);

/**
 * Returns the order numbers of a list of orders.
 *
 * @param {ReadonlyArray<{id: string}>} orders - The orders.
 * @returns {string[]} The order numbers, in list order.
 */
const ids = (orders) => orders.map((order) => order.id);

/**
 * Returns the numbers of the test orders that pass the filters, by the day they were placed.
 *
 * @param {Partial<import("./orderListQuery.js").OrderListQuery>} changes - Filter values.
 * @returns {string[]} The matching order numbers.
 */
const placedMatches = (changes) => ids(filterOrders(ORDERS, { ...NO_ORDER_FILTERS, ...changes }, PENDING_ORDERS_LIST));

/**
 * Returns the test order numbers in the given sort order, by the day they were placed.
 *
 * @param {string} sortId - Sort order id.
 * @returns {string[]} The sorted order numbers.
 */
const placedSorted = (sortId) => ids(sortOrders(ORDERS, sortId, PENDING_ORDERS_LIST));

describe("filterOrders", () => {
  it("keeps every order when no filter is set", () => {
    expect(placedMatches({})).toEqual(["ORD-1", "ORD-2", "ORD-3", "ORD-4"]);
  });

  it("keeps the orders of the selected sellers", () => {
    expect(placedMatches({ people: ["harborview", "maple-street"] })).toEqual(["ORD-1", "ORD-3", "ORD-4"]);
  });

  it("keeps the orders of the selected buyers in a list that names buyers", () => {
    const filters = { ...NO_ORDER_FILTERS, people: ["buyer-of-ORD-2"] };
    expect(ids(filterOrders(ORDERS, filters, SHOP_ORDERS_LIST))).toEqual(["ORD-2"]);
  });

  it("includes the lower price of a range and excludes the upper one", () => {
    expect(placedMatches({ price: "under-50" })).toEqual(["ORD-3"]);
    expect(placedMatches({ price: "50-100" })).toEqual(["ORD-1"]);
  });

  it("includes orders placed at any time on the first and the last day of the date range", () => {
    expect(placedMatches({ from: "2026-10-01", to: "2026-10-31" })).toEqual(["ORD-1", "ORD-2", "ORD-3"]);
    expect(placedMatches({ from: "2026-11-01" })).toEqual(["ORD-4"]);
  });

  it("applies the date range to the approval day when asked to", () => {
    const filters = { ...NO_ORDER_FILTERS, from: "2026-11-01" };
    expect(ids(filterOrders(ORDERS, filters, PURCHASES_LIST))).toEqual(["ORD-3", "ORD-4"]);
  });

  it("applies every filter together", () => {
    expect(placedMatches({ people: ["harborview"], price: "50-100", from: "2026-10-01" })).toEqual(["ORD-1"]);
  });
});

describe("sortOrders", () => {
  it("sorts by date, newest or oldest first", () => {
    expect(placedSorted("newest")).toEqual(["ORD-4", "ORD-3", "ORD-2", "ORD-1"]);
    expect(placedSorted("oldest")).toEqual(["ORD-1", "ORD-2", "ORD-3", "ORD-4"]);
  });

  it("sorts by the approval date when asked to", () => {
    const approvedLate = { ...ORDERS[0], id: "ORD-5", approvedAt: localTimestamp(12, 1) };
    expect(ids(sortOrders([...ORDERS, approvedLate], "newest", PURCHASES_LIST))[0]).toBe("ORD-5");
  });

  it("sorts by price and puts the newer order first when prices tie", () => {
    expect(placedSorted("price-asc")).toEqual(["ORD-3", "ORD-1", "ORD-4", "ORD-2"]);
    expect(placedSorted("price-desc")).toEqual(["ORD-4", "ORD-2", "ORD-1", "ORD-3"]);
  });

  it("sorts by the name of the list's person from A to Z", () => {
    expect(placedSorted("name")).toEqual(["ORD-2", "ORD-3", "ORD-1", "ORD-4"]);
    expect(ids(sortOrders(ORDERS, "name", SHOP_ORDERS_LIST))).toEqual(["ORD-4", "ORD-3", "ORD-2", "ORD-1"]);
  });

  it("sorts newest first for an unknown sort order and leaves the input unchanged", () => {
    expect(placedSorted("unknown")).toEqual(["ORD-4", "ORD-3", "ORD-2", "ORD-1"]);
    expect(ids(ORDERS)).toEqual(["ORD-1", "ORD-2", "ORD-3", "ORD-4"]);
  });
});

describe("searchOrders", () => {
  it("filters, then sorts", () => {
    const query = { ...NO_ORDER_FILTERS, people: ["harborview"], sort: "price-desc" };
    expect(ids(searchOrders(ORDERS, query, PENDING_ORDERS_LIST))).toEqual(["ORD-1", "ORD-3"]);
  });
});

describe("order dates", () => {
  it("formats the date, and the date and time, of an order", () => {
    const placedAt = new Date(2026, 10, 3, 9, 5).toISOString();
    expect(formatOrderDate(placedAt)).toBe("Nov 3, 2026");
    expect(formatOrderDateTime(placedAt)).toMatch(/^Nov 3, 2026, 9:05\sAM$/);
  });

  it("returns the local calendar day of a timestamp", () => {
    expect(toLocalDateKey(localTimestamp(11, 3, 23))).toBe("2026-11-03");
    expect(toLocalDateKey(localTimestamp(1, 9, 0))).toBe("2026-01-09");
  });

  it("accepts only real dates written as YYYY-MM-DD", () => {
    expect(isDateKey("2026-02-28")).toBe(true);
    expect(isDateKey("2028-02-29")).toBe(true);
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(isDateKey("2026-2-28")).toBe(false);
    expect(isDateKey("")).toBe(false);
    expect(isDateKey(null)).toBe(false);
  });
});
