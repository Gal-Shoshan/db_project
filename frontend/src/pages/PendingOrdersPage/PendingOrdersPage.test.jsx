/**
 * @file Tests for the Pending Orders page: layout, the orders table, sorting, filters, order details and cancelling.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatOrderDate } from "@/features/orders/orderDates.js";
import { NO_ORDER_FILTERS } from "@/features/orders/orderListQuery.js";
import { PENDING_ORDERS_LIST } from "@/features/orders/orderLists.js";
import { SAMPLE_PENDING_ORDERS } from "@/features/orders/samplePendingOrders.js";
import { filterOrders, sortOrders } from "@/features/orders/searchOrders.js";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";
import { formatCurrency } from "@/utils/formatters.js";

const ORDER_COUNT = SAMPLE_PENDING_ORDERS.length;
const NEWEST_FIRST = sortOrders(SAMPLE_PENDING_ORDERS, "newest", PENDING_ORDERS_LIST);
const NEWEST_ORDER = NEWEST_FIRST[0];
const CANCEL_BUTTON_NAME = /^Cancel order ORD-/;

/**
 * Returns the left sidebar of the Buy mode.
 *
 * @returns {HTMLElement} The navigation region with the Buy options.
 */
const buySidebar = () => screen.getByRole("navigation", { name: "Buy options" });

/**
 * Signs in through the form, picks the Buy mode and opens its Pending Orders option.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openPendingOrders() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  const personalAreaBar = screen.getByRole("navigation", { name: "Personal area" });
  await user.click(within(personalAreaBar).getByRole("radio", { name: "Buy" }));
  await user.click(within(buySidebar()).getByRole("link", { name: "Pending Orders" }));
  return { user };
}

/**
 * Returns the pending orders table.
 *
 * @returns {HTMLElement} The table.
 */
const ordersTable = () => screen.getByRole("table", { name: "Orders waiting for the seller to accept them" });

/**
 * Returns the body rows of the pending orders table, one per order.
 *
 * @returns {HTMLElement[]} The order rows, in display order.
 */
const orderRows = () => within(ordersTable()).getAllByRole("row").slice(1);

/**
 * Returns the order numbers shown in the table, read from the Cancel buttons.
 *
 * @returns {string[]} The order numbers, in display order.
 */
const shownOrderIds = () =>
  within(ordersTable())
    .getAllByRole("button", { name: CANCEL_BUTTON_NAME })
    .map((button) => button.textContent.replace("Cancel order ", ""));

/**
 * Returns the row of the order with the given number.
 *
 * @param {string} orderId - Order number, for example "ORD-1001".
 * @returns {HTMLElement} The table row.
 */
const rowOf = (orderId) => within(ordersTable()).getByRole("button", { name: `Cancel order ${orderId}` }).closest("tr");

/**
 * Returns the number of sample orders that pass the given filters.
 *
 * @param {Partial<import("@/features/orders/orderListQuery.js").OrderListQuery>} changes - Filter values.
 * @returns {number} The number of matching orders.
 */
const countMatches = (changes) => filterOrders(SAMPLE_PENDING_ORDERS, { ...NO_ORDER_FILTERS, ...changes }, PENDING_ORDERS_LIST).length;

/**
 * Asserts that the elements appear in the page in the given order.
 *
 * @param {...HTMLElement} elements - Elements in their expected order.
 */
function expectInDocumentOrder(...elements) {
  elements.slice(1).forEach((element, index) => {
    const isAfterPrevious = elements[index].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(isAfterPrevious).toBeTruthy();
  });
}

describe("PendingOrdersPage", () => {
  it("is a Buy option and shows Filters and Sort by above the orders table", async () => {
    await openPendingOrders();

    expect(within(buySidebar()).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Shopping",
      "Pending Orders",
      "Purchases",
    ]);
    expect(within(buySidebar()).getByRole("link", { name: "Pending Orders" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pending Orders");
    expectInDocumentOrder(
      screen.getByRole("button", { name: /Filters/ }),
      screen.getByLabelText("Sort by"),
      ordersTable(),
    );
  });

  it("lists every pending order, newest first, with its date, price and seller", async () => {
    await openPendingOrders();

    const columnHeaders = within(ordersTable()).getAllByRole("columnheader");
    expect(columnHeaders.map((header) => header.textContent)).toEqual(["Date", "Price", "Seller", "Actions"]);
    expect(screen.getByText(`${ORDER_COUNT} pending orders`)).toBeInTheDocument();
    expect(shownOrderIds()).toEqual(NEWEST_FIRST.map((order) => order.id));
    const firstRowCells = within(orderRows()[0]).getAllByRole("cell");
    expect(within(orderRows()[0]).getByRole("rowheader")).toHaveTextContent(formatOrderDate(NEWEST_ORDER.placedAt));
    expect(firstRowCells[0]).toHaveTextContent(formatCurrency(NEWEST_ORDER.price));
    expect(firstRowCells[1]).toHaveTextContent(NEWEST_ORDER.seller);
  });

  it("sorts by price from low to high", async () => {
    const { user } = await openPendingOrders();

    await user.selectOptions(screen.getByLabelText("Sort by"), "Price: Low to High");

    expect(shownOrderIds()).toEqual(sortOrders(SAMPLE_PENDING_ORDERS, "price-asc", PENDING_ORDERS_LIST).map((order) => order.id));
  });

  it("filters by seller and clears the filters", async () => {
    const { user } = await openPendingOrders();
    const filtersButton = screen.getByRole("button", { name: /Filters/ });

    await user.click(filtersButton);
    const panel = screen.getByRole("region", { name: "Filters" });
    await user.click(within(panel).getByRole("checkbox", { name: NEWEST_ORDER.seller }));

    const sellerOrderCount = countMatches({ people: [NEWEST_ORDER.sellerId] });
    expect(screen.getByText(`${sellerOrderCount} of ${ORDER_COUNT} pending orders`)).toBeInTheDocument();
    expect(orderRows()).toHaveLength(sellerOrderCount);
    orderRows().forEach((row) => expect(row).toHaveTextContent(NEWEST_ORDER.seller));
    expect(filtersButton).toHaveAccessibleName("Filters, 1 active");

    await user.click(within(panel).getByRole("button", { name: "Clear all filters" }));
    expect(screen.getByText(`${ORDER_COUNT} pending orders`)).toBeInTheDocument();
  });

  it("filters by order date and says so when no order matches", async () => {
    const { user } = await openPendingOrders();
    await user.click(screen.getByRole("button", { name: /Filters/ }));

    await user.type(screen.getByLabelText("From"), "2026-11-01");
    const sinceNovemberCount = countMatches({ from: "2026-11-01" });
    expect(screen.getByText(`${sinceNovemberCount} of ${ORDER_COUNT} pending orders`)).toBeInTheDocument();

    await user.clear(screen.getByLabelText("From"));
    await user.type(screen.getByLabelText("From"), "2026-12-01");
    expect(screen.getByText("No pending orders match your filters.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const emptyMessageClearButton = screen.getAllByRole("button", { name: "Clear all filters" }).at(-1);
    await user.click(emptyMessageClearButton);
    expect(orderRows()).toHaveLength(ORDER_COUNT);
  });

  it("opens the order details when a row is clicked, and closes them", async () => {
    const { user } = await openPendingOrders();

    await user.click(within(rowOf(NEWEST_ORDER.id)).getByText(NEWEST_ORDER.seller));

    const details = screen.getByRole("dialog", { name: "Order details" });
    expect(within(details).getByText(NEWEST_ORDER.id)).toBeInTheDocument();
    expect(within(details).getByText(NEWEST_ORDER.seller)).toBeInTheDocument();
    NEWEST_ORDER.items.forEach((item) => expect(within(details).getByText(item.title)).toBeInTheDocument());
    const totalRow = within(details).getByRole("rowheader", { name: "Order total" }).closest("tr");
    expect(totalRow).toHaveTextContent(formatCurrency(NEWEST_ORDER.price));

    await user.click(within(details).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the order details from the keyboard with the date button", async () => {
    const { user } = await openPendingOrders();

    within(rowOf(NEWEST_ORDER.id)).getByRole("button", { name: /view details of order/ }).focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog", { name: "Order details" })).toHaveTextContent(NEWEST_ORDER.id);
  });

  it("asks before cancelling, and keeps the order when the user changes their mind", async () => {
    const { user } = await openPendingOrders();

    await user.click(within(rowOf(NEWEST_ORDER.id)).getByRole("button", { name: CANCEL_BUTTON_NAME }));

    const confirmation = screen.getByRole("dialog", { name: "Cancel this order?" });
    expect(confirmation).toHaveTextContent(NEWEST_ORDER.id);
    expect(screen.queryByRole("dialog", { name: "Order details" })).not.toBeInTheDocument();

    await user.click(within(confirmation).getByRole("button", { name: "Keep order" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(orderRows()).toHaveLength(ORDER_COUNT);
  });

  it("cancels the order after confirmation, removes its row and reports it", async () => {
    const { user } = await openPendingOrders();

    await user.click(within(rowOf(NEWEST_ORDER.id)).getByRole("button", { name: CANCEL_BUTTON_NAME }));
    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shownOrderIds()).toEqual(NEWEST_FIRST.slice(1).map((order) => order.id));
    expect(screen.getByText(`${ORDER_COUNT - 1} pending orders`)).toBeInTheDocument();
    const notice = screen.getByText(new RegExp(`^Your order ${NEWEST_ORDER.id} from .* was cancelled\\.$`));
    expect(notice).toHaveFocus();
  });

  it("keeps a cancelled order cancelled after visiting another page", async () => {
    const { user } = await openPendingOrders();
    await user.click(within(rowOf(NEWEST_ORDER.id)).getByRole("button", { name: CANCEL_BUTTON_NAME }));
    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    await user.click(within(buySidebar()).getByRole("link", { name: "Shopping" }));
    await user.click(within(buySidebar()).getByRole("link", { name: "Pending Orders" }));

    expect(orderRows()).toHaveLength(ORDER_COUNT - 1);
    expect(shownOrderIds()).not.toContain(NEWEST_ORDER.id);
  });
});
