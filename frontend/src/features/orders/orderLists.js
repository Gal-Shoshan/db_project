/**
 * @file The app's order lists and how each one shows its orders: the date it uses and the person it names.
 *
 * The user's own lists (Pending Orders and Purchases) name the seller of each
 * order; the user's shop list (Sell mode Orders) names the buyer.
 */

import { SELLERS } from "@/features/sellers/sellers.js";
import { SAMPLE_BUYERS } from "@/features/users/users.js";
import { ORDER_SORT_OPTIONS } from "./ordersConfig.js";

/**
 * The other person in an order, as a list names them.
 *
 * @typedef {object} OrderParty
 * @property {"sellerId" | "buyerId"} idField - Order field that holds the person's id.
 * @property {"seller" | "buyer"} nameField - Order field that holds the person's name.
 * @property {string} param - URL query parameter of the person filter, for example "seller".
 * @property {string} columnLabel - Heading of the table column and the details row, for example "Seller" or "Order by".
 * @property {string} filterLegend - Name of the person filter, for example "Seller" or "Buyer".
 * @property {string} sortLabel - Label of the sort order by the person's name.
 * @property {ReadonlyArray<{id: string, name: string}>} people - Choices of the person filter, in display order.
 */

/**
 * How one order list shows its orders.
 *
 * @typedef {object} OrderList
 * @property {"placedAt" | "approvedAt"} dateField - The date in the Date column, the date filter and date sorting.
 * @property {string} dateLegend - Name of the date filter, for example "Order date".
 * @property {OrderParty} party - The person the list names.
 */

/** Sort order id that sorts a list by its person's name, from A to Z. */
export const NAME_SORT_ID = "name";

/** The seller, named in the user's own orders. */
export const SELLER_PARTY = Object.freeze({
  idField: "sellerId",
  nameField: "seller",
  param: "seller",
  columnLabel: "Seller",
  filterLegend: "Seller",
  sortLabel: "Seller: A to Z",
  people: SELLERS,
});

/** The buyer, named in the orders of the user's shop. */
export const BUYER_PARTY = Object.freeze({
  idField: "buyerId",
  nameField: "buyer",
  param: "buyer",
  columnLabel: "Order by",
  filterLegend: "Buyer",
  sortLabel: "Buyer: A to Z",
  people: SAMPLE_BUYERS,
});

/**
 * Buy mode Pending Orders: the user's orders that wait for the seller, by the day they were placed.
 *
 * @type {Readonly<OrderList>}
 */
export const PENDING_ORDERS_LIST = Object.freeze({
  dateField: "placedAt",
  dateLegend: "Order date",
  party: SELLER_PARTY,
});

/**
 * Buy mode Purchases: the user's orders that the seller approved, by the day they were approved.
 *
 * @type {Readonly<OrderList>}
 */
export const PURCHASES_LIST = Object.freeze({
  dateField: "approvedAt",
  dateLegend: "Date approved",
  party: SELLER_PARTY,
});

/**
 * Sell mode Orders: orders placed with the user's shop that wait for the user's approval, by the day they were placed.
 *
 * @type {Readonly<OrderList>}
 */
export const SHOP_ORDERS_LIST = Object.freeze({
  dateField: "placedAt",
  dateLegend: "Order date",
  party: BUYER_PARTY,
});

/**
 * Returns the sort orders of a list: the shared ones, then sorting by the list's person.
 *
 * @param {OrderParty} party - The person the list names.
 * @returns {Array<{id: string, label: string}>} The sort orders, in display order.
 */
export function getOrderSortOptions(party) {
  return [...ORDER_SORT_OPTIONS, { id: NAME_SORT_ID, label: party.sortLabel }];
}
