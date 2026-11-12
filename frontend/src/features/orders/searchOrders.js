/**
 * @file Filtering and sorting order lists by the list's date (placed or approved) and the person it names (seller or buyer).
 *
 * These are pure functions over an order list, so the same rules can later be
 * applied to orders fetched from an API.
 */

import { toLocalDateKey } from "./orderDates.js";
import { NAME_SORT_ID } from "./orderLists.js";
import { ORDER_PRICE_RANGES } from "./ordersConfig.js";

const PRICE_RANGES_BY_ID = new Map(ORDER_PRICE_RANGES.map((range) => [range.id, range]));

/**
 * Returns comparators for each sort order of a list. Ties fall back to newest first, then order number.
 *
 * @param {import("./orderLists.js").OrderList} list - How the list shows its orders.
 * @returns {Readonly<Record<string, function(object, object): number>>} Comparators by sort order id.
 */
function createComparators({ dateField, party }) {
  /**
   * Compares two orders from newest to oldest, then by order number.
   *
   * @param {object} left - First order.
   * @param {object} right - Second order.
   * @returns {number} Negative when left comes first.
   */
  const byNewest = (left, right) => right[dateField].localeCompare(left[dateField]) || left.id.localeCompare(right.id);

  return Object.freeze({
    newest: byNewest,
    oldest: (left, right) => left[dateField].localeCompare(right[dateField]) || left.id.localeCompare(right.id),
    "price-asc": (left, right) => left.price - right.price || byNewest(left, right),
    "price-desc": (left, right) => right.price - left.price || byNewest(left, right),
    [NAME_SORT_ID]: (left, right) =>
      left[party.nameField].localeCompare(right[party.nameField]) || byNewest(left, right),
  });
}

/**
 * Returns whether the order's price is in the selected range.
 *
 * @param {{price: number}} order - The order.
 * @param {string | null} priceRangeId - Selected price range id, or null for any price.
 * @returns {boolean} True when the order matches.
 */
function matchesPrice(order, priceRangeId) {
  const range = PRICE_RANGES_BY_ID.get(priceRangeId);
  return !range || (order.price >= range.min && order.price < range.max);
}

/**
 * Returns whether a timestamp falls on a day within the selected dates; both limits are included.
 *
 * @param {string} timestamp - ISO 8601 timestamp.
 * @param {string | null} from - Earliest day, as "YYYY-MM-DD", or null for no limit.
 * @param {string | null} to - Latest day, as "YYYY-MM-DD", or null for no limit.
 * @returns {boolean} True when the timestamp matches.
 */
function matchesDates(timestamp, from, to) {
  const day = toLocalDateKey(timestamp);
  return (from === null || day >= from) && (to === null || day <= to);
}

/**
 * Returns the orders that pass every filter, in their original order.
 *
 * @template {{price: number}} Order
 * @param {ReadonlyArray<Order>} orders - All orders of the list.
 * @param {Pick<import("./orderListQuery.js").OrderListQuery, "people" | "price" | "from" | "to">} filters - The filter values.
 * @param {import("./orderLists.js").OrderList} list - How the list shows its orders: the date and the person the filters apply to.
 * @returns {Order[]} The matching orders.
 */
export function filterOrders(orders, filters, { dateField, party }) {
  return orders.filter((order) => {
    const matchesPerson = filters.people.length === 0 || filters.people.includes(order[party.idField]);
    const matchesDay = matchesDates(order[dateField], filters.from, filters.to);
    return matchesPerson && matchesPrice(order, filters.price) && matchesDay;
  });
}

/**
 * Returns a sorted copy of the orders; an unknown sort order sorts newest first.
 *
 * @template Order
 * @param {ReadonlyArray<Order>} orders - Orders to sort.
 * @param {string} sortId - Sort order id from the list's sort options.
 * @param {import("./orderLists.js").OrderList} list - How the list shows its orders: the date and the person the sorts use.
 * @returns {Order[]} The sorted orders.
 */
export function sortOrders(orders, sortId, list) {
  const comparators = createComparators(list);
  return [...orders].sort(comparators[sortId] ?? comparators.newest);
}

/**
 * Returns the orders that pass the filters, in the chosen sort order.
 *
 * @template Order
 * @param {ReadonlyArray<Order>} orders - All orders of the list.
 * @param {import("./orderListQuery.js").OrderListQuery} query - The filters and sort order.
 * @param {import("./orderLists.js").OrderList} list - How the list shows its orders.
 * @returns {Order[]} The orders to show.
 */
export function searchOrders(orders, query, list) {
  return sortOrders(filterOrders(orders, query, list), query.sort, list);
}
