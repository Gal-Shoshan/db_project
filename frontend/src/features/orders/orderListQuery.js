/**
 * @file Reads and writes the filters and sort order of an order list, such as Pending Orders or the shop's Orders, in the URL query string.
 *
 * Keeping the state in the URL lets the browser's Back and Forward buttons
 * step through it. Unknown or invalid values fall back to the defaults
 * instead of failing.
 */

import { isDateKey } from "./orderDates.js";
import { NAME_SORT_ID } from "./orderLists.js";
import { DEFAULT_ORDER_SORT, ORDER_PRICE_RANGES, ORDER_SORT_OPTIONS } from "./ordersConfig.js";

/**
 * The filters and sort order of an order list.
 *
 * @typedef {object} OrderListQuery
 * @property {string[]} people - Selected ids of the person the list names (sellers or buyers); empty for everyone.
 * @property {string | null} price - Selected price range id, or null for any price.
 * @property {string | null} from - Earliest day of the list's date to include, as "YYYY-MM-DD", or null for no limit.
 * @property {string | null} to - Latest day of the list's date to include, as "YYYY-MM-DD", or null for no limit.
 * @property {string} sort - Sort order id.
 */

const PARAMS = Object.freeze({
  price: "price",
  from: "from",
  to: "to",
  sort: "sort",
});
const PRICE_RANGE_IDS = new Set(ORDER_PRICE_RANGES.map((range) => range.id));
const SORT_IDS = new Set([...ORDER_SORT_OPTIONS.map((option) => option.id), NAME_SORT_ID]);

/**
 * Filter values that select every order.
 *
 * @type {Readonly<Pick<OrderListQuery, "people" | "price" | "from" | "to">>}
 */
export const NO_ORDER_FILTERS = Object.freeze({
  people: [],
  price: null,
  from: null,
  to: null,
});

/**
 * Returns the date key in a parameter value, or null when it is not a valid "YYYY-MM-DD" date.
 *
 * @param {string | null} value - Raw parameter value.
 * @returns {string | null} The date key.
 */
function parseDateKey(value) {
  return isDateKey(value) ? value : null;
}

/**
 * Returns the order list state described by URL query parameters.
 *
 * @param {URLSearchParams} searchParams - The URL query parameters.
 * @param {import("./orderLists.js").OrderParty} party - The person the list names, which sets the person parameter and its choices.
 * @returns {OrderListQuery} The filters and sort order.
 */
export function parseOrderListQuery(searchParams, party) {
  const requestedPeople = searchParams.getAll(party.param);
  const price = searchParams.get(PARAMS.price);
  const sort = searchParams.get(PARAMS.sort);

  return {
    people: party.people.map((person) => person.id).filter((id) => requestedPeople.includes(id)),
    price: PRICE_RANGE_IDS.has(price) ? price : null,
    from: parseDateKey(searchParams.get(PARAMS.from)),
    to: parseDateKey(searchParams.get(PARAMS.to)),
    sort: SORT_IDS.has(sort) ? sort : DEFAULT_ORDER_SORT,
  };
}

/**
 * Returns the URL query parameters that describe an order list state, leaving out every default value.
 *
 * @param {OrderListQuery} query - The filters and sort order.
 * @param {import("./orderLists.js").OrderParty} party - The person the list names, which sets the person parameter.
 * @returns {URLSearchParams} The query parameters.
 */
export function toOrderListSearchParams(query, party) {
  const params = new URLSearchParams();
  query.people.forEach((id) => params.append(party.param, id));
  if (query.price) params.set(PARAMS.price, query.price);
  if (query.from) params.set(PARAMS.from, query.from);
  if (query.to) params.set(PARAMS.to, query.to);
  if (query.sort !== DEFAULT_ORDER_SORT) params.set(PARAMS.sort, query.sort);
  return params;
}

/**
 * Returns how many order filters are in use; each selected person counts as one, and so does each date limit.
 *
 * @param {Pick<OrderListQuery, "people" | "price" | "from" | "to">} filters - The filter values.
 * @returns {number} The number of active filters.
 */
export function countActiveOrderFilters(filters) {
  return (
    filters.people.length +
    Number(filters.price !== null) +
    Number(filters.from !== null) +
    Number(filters.to !== null)
  );
}
