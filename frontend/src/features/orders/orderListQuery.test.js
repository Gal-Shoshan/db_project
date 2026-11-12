/**
 * @file Tests for reading and writing an order list's filters and sort order in the URL.
 */

import { describe, expect, it } from "vitest";
import {
  NO_ORDER_FILTERS,
  countActiveOrderFilters,
  parseOrderListQuery,
  toOrderListSearchParams,
} from "./orderListQuery.js";
import { BUYER_PARTY, SELLER_PARTY } from "./orderLists.js";

const DEFAULT_QUERY = { ...NO_ORDER_FILTERS, sort: "newest" };

describe("parseOrderListQuery", () => {
  it("returns the defaults for an empty query string", () => {
    expect(parseOrderListQuery(new URLSearchParams(), SELLER_PARTY)).toEqual(DEFAULT_QUERY);
  });

  it("reads every parameter and lists the sellers in display order", () => {
    const params = new URLSearchParams(
      "seller=harborview&seller=brightside&price=50-100&from=2026-10-01&to=2026-10-31&sort=price-asc",
    );
    expect(parseOrderListQuery(params, SELLER_PARTY)).toEqual({
      people: ["brightside", "harborview"],
      price: "50-100",
      from: "2026-10-01",
      to: "2026-10-31",
      sort: "price-asc",
    });
  });

  it("reads buyers from the buyer parameter for a list that names buyers", () => {
    const params = new URLSearchParams("buyer=mei-chen&seller=brightside&sort=name");
    expect(parseOrderListQuery(params, BUYER_PARTY)).toEqual({ ...DEFAULT_QUERY, people: ["mei-chen"], sort: "name" });
  });

  it("ignores unknown people, price ranges and sort orders, and dates that do not exist", () => {
    const params = new URLSearchParams("seller=nobody&price=cheap&from=2026-02-30&to=yesterday&sort=random");
    expect(parseOrderListQuery(params, SELLER_PARTY)).toEqual(DEFAULT_QUERY);
  });
});

describe("toOrderListSearchParams", () => {
  it("writes nothing for the defaults", () => {
    expect(toOrderListSearchParams(DEFAULT_QUERY, SELLER_PARTY).toString()).toBe("");
  });

  it("writes a query string that reads back to the same state", () => {
    const query = { people: ["dana-levi", "sofia-rossi"], price: "500-plus", from: "2026-11-01", to: null, sort: "name" };
    const params = toOrderListSearchParams(query, BUYER_PARTY);
    expect(params.getAll("buyer")).toEqual(["dana-levi", "sofia-rossi"]);
    expect(parseOrderListQuery(params, BUYER_PARTY)).toEqual(query);
  });
});

describe("countActiveOrderFilters", () => {
  it("counts each person, the price range and each date limit", () => {
    expect(countActiveOrderFilters(NO_ORDER_FILTERS)).toBe(0);
    const filters = { people: ["brightside", "harborview"], price: "under-50", from: "2026-10-01", to: "2026-10-31" };
    expect(countActiveOrderFilters(filters)).toBe(5);
  });
});
