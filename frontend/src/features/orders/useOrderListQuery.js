/**
 * @file Hook that keeps an order list's filters and sort order in the URL.
 */

import { useSearchParams } from "react-router";
import { parseOrderListQuery, toOrderListSearchParams } from "./orderListQuery.js";

/**
 * Returns the order list state read from the URL, and a function that writes changes back to it.
 *
 * Each change adds a browser history entry, so Back and Forward step through the filters and sort orders.
 *
 * @param {import("./orderLists.js").OrderParty} party - The person the list names, which sets the person filter's parameter.
 * @returns {{query: import("./orderListQuery.js").OrderListQuery, updateQuery: function(Partial<import("./orderListQuery.js").OrderListQuery>): void}}
 *   The current state, and the function that applies changes to it.
 */
export function useOrderListQuery(party) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseOrderListQuery(searchParams, party);

  /**
   * Applies changes to the filters or the sort order.
   *
   * @param {Partial<import("./orderListQuery.js").OrderListQuery>} changes - Changed values.
   */
  const updateQuery = (changes) => {
    setSearchParams(toOrderListSearchParams({ ...query, ...changes }, party));
  };

  return { query, updateQuery };
}
