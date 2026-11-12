/**
 * @file Tests for the Sell mode Orders page: layout, the table of orders to approve, sorting, the buyer filter, and Close, Approve and Unapprove.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatOrderDate } from "@/features/orders/orderDates.js";
import { NO_ORDER_FILTERS } from "@/features/orders/orderListQuery.js";
import { SHOP_ORDERS_LIST } from "@/features/orders/orderLists.js";
import { SAMPLE_SHOP_ORDERS } from "@/features/orders/sampleShopOrders.js";
import { filterOrders, sortOrders } from "@/features/orders/searchOrders.js";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";
import { formatCurrency } from "@/utils/formatters.js";

const ORDER_COUNT = SAMPLE_SHOP_ORDERS.length;
const NEWEST_FIRST = sortOrders(SAMPLE_SHOP_ORDERS, "newest", SHOP_ORDERS_LIST);
const NEWEST_ORDER = NEWEST_FIRST[0];
const DETAILS_BUTTON_NAME = /, view details of order (ORD-\d+)$/;

/**
 * Signs in through the form, which opens the Sell mode's Orders page.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openSellOrders() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  return { user };
}

/**
 * Returns the table of orders waiting for approval.
 *
 * @returns {HTMLElement} The table.
 */
const ordersTable = () => screen.getByRole("table", { name: "Orders waiting for your approval" });

/**
 * Returns the order numbers shown in the table, read from the date buttons.
 *
 * @returns {string[]} The order numbers, in display order.
 */
const shownOrderIds = () =>
  within(ordersTable())
    .getAllByRole("button", { name: DETAILS_BUTTON_NAME })
    .map((button) => button.textContent.match(/ORD-\d+$/)[0]);

/**
 * Returns the row of the order with the given number.
 *
 * @param {string} orderId - Order number, for example "ORD-2001".
 * @returns {HTMLElement} The table row.
 */
const rowOf = (orderId) =>
  within(ordersTable())
    .getByRole("button", { name: new RegExp(`view details of order ${orderId}$`) })
    .closest("tr");

/**
 * Opens the details window of the newest order by clicking its buyer's name.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @returns {Promise<HTMLElement>} The details window.
 */
async function openNewestOrderDetails(user) {
  await user.click(within(rowOf(NEWEST_ORDER.id)).getByText(NEWEST_ORDER.buyer));
  return screen.getByRole("dialog", { name: "Order details" });
}

describe("OrdersPage (Sell mode)", () => {
  it("opens after signing in and shows Filters and Sort by above the orders table", async () => {
    await openSellOrders();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Orders");
    const filtersButton = screen.getByRole("button", { name: /Filters/ });
    const isTableAfterFilters = filtersButton.compareDocumentPosition(ordersTable()) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(isTableAfterFilters).toBeTruthy();
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
  });

  it("lists every order waiting for approval, newest first, with its date, price and buyer", async () => {
    await openSellOrders();

    const columnHeaders = within(ordersTable()).getAllByRole("columnheader");
    expect(columnHeaders.map((header) => header.textContent)).toEqual(["Date", "Price", "Order by"]);
    expect(screen.getByText(`${ORDER_COUNT} orders waiting for approval`)).toBeInTheDocument();
    expect(shownOrderIds()).toEqual(NEWEST_FIRST.map((order) => order.id));
    const firstRow = rowOf(NEWEST_ORDER.id);
    expect(within(firstRow).getByRole("rowheader")).toHaveTextContent(formatOrderDate(NEWEST_ORDER.placedAt));
    expect(firstRow).toHaveTextContent(formatCurrency(NEWEST_ORDER.price));
    expect(firstRow).toHaveTextContent(NEWEST_ORDER.buyer);
  });

  it("sorts by buyer name from A to Z", async () => {
    const { user } = await openSellOrders();

    await user.selectOptions(screen.getByLabelText("Sort by"), "Buyer: A to Z");

    expect(shownOrderIds()).toEqual(sortOrders(SAMPLE_SHOP_ORDERS, "name", SHOP_ORDERS_LIST).map((order) => order.id));
  });

  it("filters by buyer", async () => {
    const { user } = await openSellOrders();
    await user.click(screen.getByRole("button", { name: /Filters/ }));
    const panel = screen.getByRole("region", { name: "Filters" });

    await user.click(within(within(panel).getByRole("group", { name: "Buyer" })).getByLabelText(NEWEST_ORDER.buyer));

    const buyerOrders = filterOrders(SAMPLE_SHOP_ORDERS, { ...NO_ORDER_FILTERS, people: [NEWEST_ORDER.buyerId] }, SHOP_ORDERS_LIST);
    expect(screen.getByText(`${buyerOrders.length} of ${ORDER_COUNT} orders waiting for approval`)).toBeInTheDocument();
    expect(shownOrderIds()).toHaveLength(buyerOrders.length);
  });

  it("opens the order details with Close, Approve and Unapprove when a row is clicked, and Close keeps the order", async () => {
    const { user } = await openSellOrders();

    const details = await openNewestOrderDetails(user);

    expect(within(details).getByText(NEWEST_ORDER.id)).toBeInTheDocument();
    expect(within(details).getByText("Order by")).toBeInTheDocument();
    expect(within(details).getByText(NEWEST_ORDER.buyer)).toBeInTheDocument();
    NEWEST_ORDER.items.forEach((item) => expect(within(details).getByText(item.title)).toBeInTheDocument());
    const [, footerCloseButton] = within(details).getAllByRole("button", { name: "Close" });
    expect(footerCloseButton).toHaveTextContent("Close");
    expect(within(details).getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(within(details).getByRole("button", { name: "Unapprove" })).toBeInTheDocument();

    await user.click(footerCloseButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shownOrderIds()).toContain(NEWEST_ORDER.id);
  });

  it("approves an order: it leaves the list and a notice says so", async () => {
    const { user } = await openSellOrders();
    const details = await openNewestOrderDetails(user);

    await user.click(within(details).getByRole("button", { name: "Approve" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shownOrderIds()).not.toContain(NEWEST_ORDER.id);
    expect(screen.getByText(`${ORDER_COUNT - 1} orders waiting for approval`)).toBeInTheDocument();
    const notice = screen.getByText(`Order ${NEWEST_ORDER.id} from ${NEWEST_ORDER.buyer} was approved.`, { exact: false });
    expect(notice).toHaveFocus();
  });

  it("unapproves an order: it is deleted from the list and a notice says so", async () => {
    const { user } = await openSellOrders();
    const details = await openNewestOrderDetails(user);

    await user.click(within(details).getByRole("button", { name: "Unapprove" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shownOrderIds()).not.toContain(NEWEST_ORDER.id);
    expect(screen.getByText(`${ORDER_COUNT - 1} orders waiting for approval`)).toBeInTheDocument();
    expect(screen.getByText(/was unapproved and deleted from your orders and the buyer's\.$/)).toHaveFocus();
  });

  it("keeps a decided order off the list after visiting another mode", async () => {
    const { user } = await openSellOrders();
    const details = await openNewestOrderDetails(user);
    await user.click(within(details).getByRole("button", { name: "Approve" }));

    const personalAreaBar = screen.getByRole("navigation", { name: "Personal area" });
    await user.click(within(personalAreaBar).getByRole("radio", { name: "Buy" }));
    await user.click(within(personalAreaBar).getByRole("radio", { name: "Sell" }));

    expect(shownOrderIds()).not.toContain(NEWEST_ORDER.id);
  });
});
