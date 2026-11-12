/**
 * @file Tests for the cart as a user sees it: where it shows, adding products, the open cart, Clear and Order.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MAX_QUANTITY_PER_PRODUCT } from "@/features/cart/cartLines.js";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { FIRST_NEW_ORDER_NUMBER } from "@/features/orders/sampleOrders.js";
import { SAMPLE_PENDING_ORDERS } from "@/features/orders/samplePendingOrders.js";
import { getSeller } from "@/features/sellers/sellers.js";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";
import { formatCurrency } from "@/utils/formatters.js";

const FIRST_PAGE_PRODUCTS = SAMPLE_PRODUCTS.slice(0, 50);
const IN_STOCK_INDEXES = FIRST_PAGE_PRODUCTS.flatMap((product, index) => (product.inStock ? [index] : []));
const FIRST_INDEX = IN_STOCK_INDEXES[0];
const FIRST_PRODUCT = FIRST_PAGE_PRODUCTS[FIRST_INDEX];
const OTHER_SELLER_INDEX = IN_STOCK_INDEXES.find(
  (index) => FIRST_PAGE_PRODUCTS[index].sellerId !== FIRST_PRODUCT.sellerId,
);
const OTHER_SELLER_PRODUCT = FIRST_PAGE_PRODUCTS[OTHER_SELLER_INDEX];
const SOLD_OUT_INDEX = FIRST_PAGE_PRODUCTS.findIndex((product) => !product.inStock);
const NEXT_ORDER_NUMBER = FIRST_NEW_ORDER_NUMBER;

/**
 * Returns the top bar of the personal area.
 *
 * @returns {HTMLElement} The navigation region of the personal area.
 */
const personalAreaBar = () => screen.getByRole("navigation", { name: "Personal area" });

/**
 * Picks a mode in the top bar.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @param {string} modeLabel - Visible label of the mode, for example "Buy".
 * @returns {Promise<void>} Resolves once the mode is clicked.
 */
const chooseMode = (user, modeLabel) => user.click(within(personalAreaBar()).getByRole("radio", { name: modeLabel }));

/**
 * Signs in through the form and opens the Buy mode's Shopping page.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openShopping() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  await chooseMode(user, "Buy");
  return { user };
}

/**
 * Returns the cart window, or null when it is not shown.
 *
 * @returns {HTMLElement | null} The cart region.
 */
const queryCart = () => screen.queryByRole("complementary", { name: "Cart" });

/**
 * Returns the button that opens and closes the cart.
 *
 * @returns {HTMLElement} The cart's top-row button.
 */
const cartToggle = () => within(queryCart()).getByRole("button", { name: /^Cart,/ });

/**
 * Returns the open cart's panel.
 *
 * @returns {HTMLElement} The panel with the cart items.
 */
const cartPanel = () => screen.getByRole("region", { name: "Cart items" });

/**
 * Returns the product card at a position of the current catalog page.
 *
 * @param {number} index - Position on the page, from 0.
 * @returns {HTMLElement} The product's list item.
 */
const productCard = (index) => within(screen.getByRole("list", { name: "Products" })).getAllByRole("listitem")[index];

/**
 * Presses a product card's Add to cart button the given number of times.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @param {number} index - Position of the card on the page.
 * @param {number} [times=1] - How many times to press it.
 * @returns {Promise<void>} Resolves once every press is done.
 */
async function addToCart(user, index, times = 1) {
  const button = within(productCard(index)).getByRole("button", { name: "Add to cart" });
  for (let press = 0; press < times; press += 1) {
    await user.click(button);
  }
}

describe("Cart", () => {
  it("shows only in the Buy mode, on both of its pages", async () => {
    const { user } = renderApp(ROUTES.signIn);
    await signInThroughForm(user);
    expect(queryCart()).not.toBeInTheDocument();

    await chooseMode(user, "Buy");
    expect(queryCart()).toBeInTheDocument();
    const buyOptions = screen.getByRole("navigation", { name: "Buy options" });
    await user.click(within(buyOptions).getByRole("link", { name: "Pending Orders" }));
    expect(queryCart()).toBeInTheDocument();

    await chooseMode(user, "Reports");
    expect(queryCart()).not.toBeInTheDocument();
  });

  it("starts closed and empty, showing the total", async () => {
    await openShopping();

    expect(cartToggle()).toHaveAccessibleName("Cart, 0 items, $0.00");
    expect(cartToggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region", { name: "Cart items" })).not.toBeInTheDocument();
  });

  it("adds products from their cards and updates the total", async () => {
    const { user } = await openShopping();

    await addToCart(user, FIRST_INDEX, 2);

    expect(within(productCard(FIRST_INDEX)).getByText("2 in cart")).toBeInTheDocument();
    expect(cartToggle()).toHaveAccessibleName(`Cart, 2 items, ${formatCurrency(FIRST_PRODUCT.price * 2)}`);
  });

  it("disables Add to cart for unavailable products, and at the per-product limit", async () => {
    const { user } = await openShopping();

    expect(within(productCard(SOLD_OUT_INDEX)).getByRole("button", { name: "Add to cart" })).toBeDisabled();

    await addToCart(user, FIRST_INDEX, MAX_QUANTITY_PER_PRODUCT + 1);
    const addButton = within(productCard(FIRST_INDEX)).getByRole("button", { name: "Add to cart" });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    expect(within(productCard(FIRST_INDEX)).getByText(/^10 in cart/)).toBeInTheDocument();
  });

  it("opens to list the products, changes quantities with + and −, and removes a product", async () => {
    const { user } = await openShopping();
    await addToCart(user, FIRST_INDEX);
    await addToCart(user, OTHER_SELLER_INDEX);

    await user.click(cartToggle());
    expect(cartToggle()).toHaveAttribute("aria-expanded", "true");
    expect(within(cartPanel()).getAllByRole("listitem")).toHaveLength(2);

    const quantity = within(cartPanel()).getByRole("group", { name: `Quantity of ${FIRST_PRODUCT.title}` });
    await user.click(within(quantity).getByRole("button", { name: `Increase quantity of ${FIRST_PRODUCT.title}` }));
    expect(quantity).toHaveTextContent("2");
    const decrease = within(quantity).getByRole("button", { name: `Decrease quantity of ${FIRST_PRODUCT.title}` });
    await user.click(decrease);
    await user.click(decrease);
    expect(quantity).toHaveTextContent("1");
    expect(decrease).toHaveAttribute("aria-disabled", "true");

    await user.click(within(cartPanel()).getByRole("button", { name: `Remove ${FIRST_PRODUCT.title}` }));
    expect(within(cartPanel()).getAllByRole("listitem")).toHaveLength(1);
    expect(cartToggle()).toHaveAccessibleName(`Cart, 1 item, ${formatCurrency(OTHER_SELLER_PRODUCT.price)}`);
  });

  it("clears every product", async () => {
    const { user } = await openShopping();
    await addToCart(user, FIRST_INDEX, 3);
    await user.click(cartToggle());

    await user.click(within(cartPanel()).getByRole("button", { name: "Clear" }));

    expect(within(cartPanel()).getByText("Your cart is empty.")).toBeInTheDocument();
    expect(cartToggle()).toHaveAccessibleName("Cart, 0 items, $0.00");
    expect(within(cartPanel()).getByRole("button", { name: "Order" })).toBeDisabled();
  });

  it("closes with Escape and returns focus to its top row", async () => {
    const { user } = await openShopping();
    await user.click(cartToggle());

    await user.keyboard("{Escape}");

    expect(cartToggle()).toHaveAttribute("aria-expanded", "false");
    expect(cartToggle()).toHaveFocus();
  });

  it("places one pending order per seller, empties the cart and links to Pending Orders", async () => {
    const { user } = await openShopping();
    await addToCart(user, FIRST_INDEX, 2);
    await addToCart(user, OTHER_SELLER_INDEX);
    await user.click(cartToggle());

    await user.click(within(cartPanel()).getByRole("button", { name: "Order" }));

    const firstOrderId = `ORD-${NEXT_ORDER_NUMBER}`;
    const secondOrderId = `ORD-${NEXT_ORDER_NUMBER + 1}`;
    const confirmation = within(cartPanel()).getByText(/^Your order was placed/);
    expect(confirmation).toHaveTextContent(`${firstOrderId} (${getSeller(FIRST_PRODUCT.sellerId).name})`);
    expect(confirmation).toHaveTextContent(`${secondOrderId} (${getSeller(OTHER_SELLER_PRODUCT.sellerId).name})`);
    expect(confirmation).toHaveFocus();
    expect(cartToggle()).toHaveAccessibleName("Cart, 0 items, $0.00");

    await user.click(within(cartPanel()).getByRole("link", { name: "View pending orders" }));

    expect(screen.getByText(`${SAMPLE_PENDING_ORDERS.length + 2} pending orders`)).toBeInTheDocument();
    const firstOrderRow = screen.getByRole("button", { name: `Cancel order ${firstOrderId}` }).closest("tr");
    expect(firstOrderRow).toHaveTextContent(formatCurrency(FIRST_PRODUCT.price * 2));
    expect(firstOrderRow).toHaveTextContent(getSeller(FIRST_PRODUCT.sellerId).name);
  });

  it("keeps its products when the user moves to another mode and back", async () => {
    const { user } = await openShopping();
    await addToCart(user, FIRST_INDEX);

    await chooseMode(user, "Sell");
    await chooseMode(user, "Buy");

    expect(cartToggle()).toHaveAccessibleName(`Cart, 1 item, ${formatCurrency(FIRST_PRODUCT.price)}`);
  });
});
