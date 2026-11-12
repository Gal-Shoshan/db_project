/**
 * @file Tests for the Purchases page: layout, the purchases table, sorting, the date filter, details and adding a purchase to the cart.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { formatOrderDate } from "@/features/orders/orderDates.js";
import { NO_ORDER_FILTERS } from "@/features/orders/orderListQuery.js";
import { PURCHASES_LIST } from "@/features/orders/orderLists.js";
import { SAMPLE_PURCHASES } from "@/features/orders/samplePurchases.js";
import { filterOrders, sortOrders } from "@/features/orders/searchOrders.js";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";
import { formatCurrency } from "@/utils/formatters.js";

const PURCHASE_COUNT = SAMPLE_PURCHASES.length;
const NEWEST_APPROVED_FIRST = sortOrders(SAMPLE_PURCHASES, "newest", PURCHASES_LIST);
const NEWEST_PURCHASE = NEWEST_APPROVED_FIRST[0];
const PRODUCTS_BY_ID = new Map(SAMPLE_PRODUCTS.map((product) => [product.id, product]));
const ADD_BUTTON_NAME = /^Add to cart the products of order /;

/**
 * Returns whether every product of a purchase can be ordered now.
 *
 * @param {import("@/features/orders/samplePurchases.js").Purchase} purchase - The purchase.
 * @returns {boolean} True when every product is in stock.
 */
const isFullyInStock = (purchase) => purchase.items.every((item) => PRODUCTS_BY_ID.get(item.productId).inStock);

const IN_STOCK_PURCHASE = SAMPLE_PURCHASES.find(isFullyInStock);
const PARTLY_UNAVAILABLE_PURCHASE = SAMPLE_PURCHASES.find((purchase) => !isFullyInStock(purchase));

/**
 * Returns the left sidebar of the Buy mode.
 *
 * @returns {HTMLElement} The navigation region with the Buy options.
 */
const buySidebar = () => screen.getByRole("navigation", { name: "Buy options" });

/**
 * Signs in through the form, picks the Buy mode and opens its Purchases option.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openPurchases() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  const personalAreaBar = screen.getByRole("navigation", { name: "Personal area" });
  await user.click(within(personalAreaBar).getByRole("radio", { name: "Buy" }));
  await user.click(within(buySidebar()).getByRole("link", { name: "Purchases" }));
  return { user };
}

/**
 * Returns the purchases table.
 *
 * @returns {HTMLElement} The table.
 */
const purchasesTable = () => screen.getByRole("table", { name: "Orders the sellers accepted" });

/**
 * Returns the order numbers shown in the table, read from the Add to cart buttons.
 *
 * @returns {string[]} The order numbers, in display order.
 */
const shownOrderIds = () =>
  within(purchasesTable())
    .getAllByRole("button", { name: ADD_BUTTON_NAME })
    .map((button) => button.textContent.replace("Add to cart the products of order ", ""));

/**
 * Returns the row of the purchase with the given number.
 *
 * @param {string} orderId - Order number, for example "ORD-1001".
 * @returns {HTMLElement} The table row.
 */
const rowOf = (orderId) =>
  within(purchasesTable()).getByRole("button", { name: `Add to cart the products of order ${orderId}` }).closest("tr");

/**
 * Returns the button that opens and closes the cart.
 *
 * @returns {HTMLElement} The cart's top-row button.
 */
const cartToggle = () => within(screen.getByRole("complementary", { name: "Cart" })).getByRole("button", { name: /^Cart,/ });

describe("PurchasesPage", () => {
  it("is the third Buy option and shows Filters and Sort by above the purchases table", async () => {
    await openPurchases();

    expect(within(buySidebar()).getByRole("link", { name: "Purchases" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Purchases");
    const filtersButton = screen.getByRole("button", { name: /Filters/ });
    const isTableAfterFilters = filtersButton.compareDocumentPosition(purchasesTable()) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(isTableAfterFilters).toBeTruthy();
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
  });

  it("lists every purchase, newest approval first, with the approval date, price and seller", async () => {
    await openPurchases();

    const columnHeaders = within(purchasesTable()).getAllByRole("columnheader");
    expect(columnHeaders.map((header) => header.textContent)).toEqual(["Date", "Price", "Seller", "Actions"]);
    expect(screen.getByText(`${PURCHASE_COUNT} purchases`)).toBeInTheDocument();
    expect(shownOrderIds()).toEqual(NEWEST_APPROVED_FIRST.map((purchase) => purchase.id));
    const firstRow = rowOf(NEWEST_PURCHASE.id);
    expect(within(firstRow).getByRole("rowheader")).toHaveTextContent(formatOrderDate(NEWEST_PURCHASE.approvedAt));
    expect(firstRow).toHaveTextContent(formatCurrency(NEWEST_PURCHASE.price));
    expect(firstRow).toHaveTextContent(NEWEST_PURCHASE.seller);
  });

  it("sorts by price from high to low", async () => {
    const { user } = await openPurchases();

    await user.selectOptions(screen.getByLabelText("Sort by"), "Price: High to Low");

    const expectedIds = sortOrders(SAMPLE_PURCHASES, "price-desc", PURCHASES_LIST).map((purchase) => purchase.id);
    expect(shownOrderIds()).toEqual(expectedIds);
  });

  it("filters by the day the seller approved the order", async () => {
    const { user } = await openPurchases();
    await user.click(screen.getByRole("button", { name: /Filters/ }));
    const panel = screen.getByRole("region", { name: "Filters" });
    expect(within(panel).getByRole("group", { name: "Date approved" })).toBeInTheDocument();

    await user.type(within(panel).getByLabelText("From"), "2026-08-01");

    const sinceAugust = filterOrders(SAMPLE_PURCHASES, { ...NO_ORDER_FILTERS, from: "2026-08-01" }, PURCHASES_LIST);
    expect(sinceAugust.length).toBeGreaterThan(0);
    expect(screen.getByText(`${sinceAugust.length} of ${PURCHASE_COUNT} purchases`)).toBeInTheDocument();
  });

  it("opens the purchase details, with the approval date and status, when a row is clicked", async () => {
    const { user } = await openPurchases();

    await user.click(within(rowOf(NEWEST_PURCHASE.id)).getByText(NEWEST_PURCHASE.seller));

    const details = screen.getByRole("dialog", { name: "Order details" });
    expect(within(details).getByText(NEWEST_PURCHASE.id)).toBeInTheDocument();
    expect(within(details).getByText("Date approved")).toBeInTheDocument();
    expect(within(details).getByText("Approved by the seller")).toBeInTheDocument();
    NEWEST_PURCHASE.items.forEach((item) => expect(within(details).getByText(item.title)).toBeInTheDocument());

    await user.click(within(details).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("adds a purchase's products to the cart without opening its details", async () => {
    const { user } = await openPurchases();
    const unitCount = IN_STOCK_PURCHASE.items.reduce((total, item) => total + item.quantity, 0);

    await user.click(within(rowOf(IN_STOCK_PURCHASE.id)).getByRole("button", { name: ADD_BUTTON_NAME }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const itemsNoun = unitCount === 1 ? "item" : "items";
    expect(screen.getByRole("status")).toHaveTextContent(
      `Added ${unitCount} ${itemsNoun} from order ${IN_STOCK_PURCHASE.id} to the cart.`,
    );
    expect(cartToggle()).toHaveAccessibleName(
      `Cart, ${unitCount} ${itemsNoun}, ${formatCurrency(IN_STOCK_PURCHASE.price)}`,
    );
  });

  it("names the products it could not add because they are unavailable now", async () => {
    const { user } = await openPurchases();
    const unavailableItem = PARTLY_UNAVAILABLE_PURCHASE.items.find((item) => !PRODUCTS_BY_ID.get(item.productId).inStock);

    await user.click(within(rowOf(PARTLY_UNAVAILABLE_PURCHASE.id)).getByRole("button", { name: ADD_BUTTON_NAME }));

    expect(screen.getByRole("status")).toHaveTextContent(`Currently unavailable: `);
    expect(screen.getByRole("status")).toHaveTextContent(unavailableItem.title);
  });
});
