/**
 * @file Tests for the Sell mode Products page: the catalog layout, search, editing, removing and adding products.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SAMPLE_SHOP_PRODUCTS } from "@/features/shop/sampleShopProducts.js";
import {
  MISSING_BRAND_MESSAGE,
  MISSING_CATEGORY_MESSAGE,
  MISSING_TITLE_MESSAGE,
  PRICE_FORMAT_MESSAGE,
  STOCK_MESSAGE,
} from "@/features/shop/validateProductForm.js";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";
import { formatCurrency } from "@/utils/formatters.js";

const PRODUCT_COUNT = SAMPLE_SHOP_PRODUCTS.length;
const FIRST_PRODUCT = SAMPLE_SHOP_PRODUCTS[0];
const OUT_OF_STOCK_INDEX = SAMPLE_SHOP_PRODUCTS.findIndex((product) => product.stock === 0);

/**
 * Returns the top bar of the personal area.
 *
 * @returns {HTMLElement} The navigation region of the personal area.
 */
const personalAreaBar = () => screen.getByRole("navigation", { name: "Personal area" });

/**
 * Signs in through the form, which opens the Sell mode, and opens its Products option.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openProducts() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  const sellOptions = screen.getByRole("navigation", { name: "Sell options" });
  await user.click(within(sellOptions).getByRole("link", { name: "Products" }));
  return { user };
}

/**
 * Returns the product card at a position of the current page.
 *
 * @param {number} index - Position on the page, from 0.
 * @returns {HTMLElement} The product's list item.
 */
const productCard = (index) => within(screen.getByRole("list", { name: "Products" })).getAllByRole("listitem")[index];

/**
 * Opens the Edit product window of the card at a position of the current page.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @param {number} index - Position of the card on the page.
 * @returns {Promise<HTMLElement>} The Edit product window.
 */
async function openEditWindow(user, index) {
  await user.click(within(productCard(index)).getByRole("button", { name: "Edit" }));
  return screen.getByRole("dialog", { name: "Edit product" });
}

/**
 * Replaces the text of a field in the Edit product window.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @param {HTMLElement} editWindow - The Edit product window.
 * @param {string} label - The field's label.
 * @param {string} text - The new text; empty leaves the field empty.
 * @returns {Promise<void>} Resolves once the text is typed.
 */
async function replaceField(user, editWindow, label, text) {
  const field = within(editWindow).getByLabelText(label);
  await user.clear(field);
  if (text) {
    await user.type(field, text);
  }
}

describe("ProductsPage (Sell mode)", () => {
  it("is a Sell option and shows the search box, Filters and Sort by, then the seller's products", async () => {
    await openProducts();

    const sellOptions = screen.getByRole("navigation", { name: "Sell options" });
    expect(within(sellOptions).getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Products");
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Filters/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
    expect(screen.getByText(`1–${PRODUCT_COUNT} of ${PRODUCT_COUNT} results`)).toBeInTheDocument();
    expect(within(productCard(0)).getByRole("heading", { level: 2 })).toHaveTextContent(FIRST_PRODUCT.title);
  });

  it("shows each product's quantity in stock and an Edit button, and marks a product with 0 in stock unavailable", async () => {
    await openProducts();

    expect(within(productCard(0)).getByText(`In stock: ${FIRST_PRODUCT.stock}`)).toBeInTheDocument();
    expect(within(productCard(0)).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    const outOfStockCard = productCard(OUT_OF_STOCK_INDEX);
    expect(within(outOfStockCard).getByText("In stock: 0")).toBeInTheDocument();
    expect(within(outOfStockCard).getByText("Currently unavailable.")).toBeInTheDocument();
  });

  it("searches the seller's products", async () => {
    const { user } = await openProducts();
    const searchWord = FIRST_PRODUCT.title.split(" ")[0];

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), `${searchWord}{Enter}`);

    const shownTitles = within(screen.getByRole("list", { name: "Products" }))
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(shownTitles).toContain(FIRST_PRODUCT.title);
    expect(shownTitles.length).toBeLessThan(PRODUCT_COUNT);
  });

  it("opens the Edit window with the product's details and current values", async () => {
    const { user } = await openProducts();

    const editWindow = await openEditWindow(user, 0);

    expect(within(editWindow).getByText(FIRST_PRODUCT.id)).toBeInTheDocument();
    expect(within(editWindow).getByText(FIRST_PRODUCT.brand)).toBeInTheDocument();
    expect(within(editWindow).getByLabelText("Name")).toHaveValue(FIRST_PRODUCT.title);
    expect(within(editWindow).getByLabelText("Price (USD)")).toHaveValue(FIRST_PRODUCT.price.toFixed(2));
    expect(within(editWindow).getByLabelText("Quantity in stock")).toHaveValue(String(FIRST_PRODUCT.stock));
    expect(within(editWindow).getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(within(editWindow).getByRole("button", { name: "Remove from store" })).toBeInTheDocument();
    expect(within(editWindow).queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
  });

  it("updates the name, price and quantity, and reports the change", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);

    await replaceField(user, editWindow, "Name", "Brass Desk Lamp");
    await replaceField(user, editWindow, "Price (USD)", "19.5");
    await replaceField(user, editWindow, "Quantity in stock", "7");
    await user.click(within(editWindow).getByRole("button", { name: "Update" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const editedCard = productCard(0);
    expect(within(editedCard).getByRole("heading", { level: 2 })).toHaveTextContent("Brass Desk Lamp");
    expect(within(editedCard).getByText(formatCurrency(19.5))).toBeInTheDocument();
    expect(within(editedCard).getByText("In stock: 7")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Saved “Brass Desk Lamp”: $19.50, 7 in stock.");
  });

  it("makes a product unavailable when its quantity is set to 0", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);

    await replaceField(user, editWindow, "Quantity in stock", "0");
    expect(within(editWindow).getByText("Unavailable")).toBeInTheDocument();
    await user.click(within(editWindow).getByRole("button", { name: "Update" }));

    expect(within(productCard(0)).getByText("Currently unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("It is unavailable to buyers until you add stock.");
  });

  it("keeps the window open with an error under each invalid field, and focuses the first one", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);

    await replaceField(user, editWindow, "Name", "");
    await replaceField(user, editWindow, "Price (USD)", "abc");
    await replaceField(user, editWindow, "Quantity in stock", "-1");
    await user.click(within(editWindow).getByRole("button", { name: "Update" }));

    expect(screen.getByRole("dialog", { name: "Edit product" })).toBeInTheDocument();
    expect(within(editWindow).getByLabelText("Name")).toHaveAccessibleDescription(MISSING_TITLE_MESSAGE);
    expect(within(editWindow).getByLabelText("Price (USD)")).toHaveAccessibleDescription(PRICE_FORMAT_MESSAGE);
    expect(within(editWindow).getByText(STOCK_MESSAGE)).toBeInTheDocument();
    expect(within(editWindow).getByLabelText("Name")).toHaveFocus();
  });

  it("closes without saving when the close button is pressed", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);

    await replaceField(user, editWindow, "Name", "Not saved");
    await user.click(within(editWindow).getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(productCard(0)).getByRole("heading", { level: 2 })).toHaveTextContent(FIRST_PRODUCT.title);
  });

  it("asks before removing a product, and keeps it when the seller changes their mind", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);

    await user.click(within(editWindow).getByRole("button", { name: "Remove from store" }));

    const confirmation = screen.getByRole("dialog", { name: "Remove this product?" });
    expect(confirmation).toHaveTextContent(`Are you sure you want to remove ${FIRST_PRODUCT.title}`);
    await user.click(within(confirmation).getByRole("button", { name: "Keep product" }));

    expect(screen.queryByRole("dialog", { name: "Remove this product?" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Edit product" })).toBeInTheDocument();
    expect(screen.getByText(`1–${PRODUCT_COUNT} of ${PRODUCT_COUNT} results`)).toBeInTheDocument();
  });

  it("removes a product from the store after the seller confirms", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);

    await user.click(within(editWindow).getByRole("button", { name: "Remove from store" }));
    await user.click(screen.getByRole("button", { name: "Remove product" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(`1–${PRODUCT_COUNT - 1} of ${PRODUCT_COUNT - 1} results`)).toBeInTheDocument();
    const firstTitle = within(productCard(0)).getByRole("heading", { level: 2 });
    expect(firstTitle).toHaveTextContent(SAMPLE_SHOP_PRODUCTS[1].title);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(`Removed “${FIRST_PRODUCT.title}” from your store.`);
    expect(status).toHaveFocus();
  });

  it("opens the New product window from the + button and adds the product first in the store", async () => {
    const { user } = await openProducts();

    await user.click(screen.getByRole("button", { name: "Add a new product" }));
    const newWindow = screen.getByRole("dialog", { name: "New product" });
    await user.type(within(newWindow).getByLabelText("Name"), "Walnut Desk Organizer");
    await user.type(within(newWindow).getByLabelText("Brand"), "Fernway");
    await user.selectOptions(within(newWindow).getByLabelText("Category"), "home-kitchen");
    await user.type(within(newWindow).getByLabelText("Price (USD)"), "42");
    await user.type(within(newWindow).getByLabelText("Quantity in stock"), "15");
    await user.click(within(newWindow).getByRole("button", { name: "Add to the store" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(`1–${PRODUCT_COUNT + 1} of ${PRODUCT_COUNT + 1} results`)).toBeInTheDocument();
    const newCard = productCard(0);
    expect(within(newCard).getByRole("heading", { level: 2 })).toHaveTextContent("Walnut Desk Organizer");
    expect(within(newCard).getByText(formatCurrency(42))).toBeInTheDocument();
    expect(within(newCard).getByText("In stock: 15")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Added “Walnut Desk Organizer” to your store as S0025.");
  });

  it("shows an error under each empty field of the New product window and focuses the first one", async () => {
    const { user } = await openProducts();
    await user.click(screen.getByRole("button", { name: "Add a new product" }));
    const newWindow = screen.getByRole("dialog", { name: "New product" });

    await user.click(within(newWindow).getByRole("button", { name: "Add to the store" }));

    expect(screen.getByRole("dialog", { name: "New product" })).toBeInTheDocument();
    const expectedErrors = [
      MISSING_TITLE_MESSAGE,
      MISSING_BRAND_MESSAGE,
      MISSING_CATEGORY_MESSAGE,
      PRICE_FORMAT_MESSAGE,
      STOCK_MESSAGE,
    ];
    expectedErrors.forEach((message) => expect(within(newWindow).getByText(message)).toBeInTheDocument());
    expect(within(newWindow).getByLabelText("Name")).toHaveFocus();
  });

  it("starts the New product window empty each time it opens", async () => {
    const { user } = await openProducts();
    await user.click(screen.getByRole("button", { name: "Add a new product" }));
    await user.type(within(screen.getByRole("dialog", { name: "New product" })).getByLabelText("Name"), "Draft");
    await user.click(screen.getByRole("button", { name: "Close" }));

    await user.click(screen.getByRole("button", { name: "Add a new product" }));

    expect(within(screen.getByRole("dialog", { name: "New product" })).getByLabelText("Name")).toHaveValue("");
  });

  it("keeps an update after the user moves to another mode and back", async () => {
    const { user } = await openProducts();
    const editWindow = await openEditWindow(user, 0);
    await replaceField(user, editWindow, "Quantity in stock", "33");
    await user.click(within(editWindow).getByRole("button", { name: "Update" }));

    await user.click(within(personalAreaBar()).getByRole("radio", { name: "Buy" }));
    await user.click(within(personalAreaBar()).getByRole("radio", { name: "Sell" }));
    const sellOptions = screen.getByRole("navigation", { name: "Sell options" });
    await user.click(within(sellOptions).getByRole("link", { name: "Products" }));

    expect(within(productCard(0)).getByText("In stock: 33")).toBeInTheDocument();
  });
});
