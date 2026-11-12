/**
 * @file Tests for the Shopping page: layout order, paging, search, sorting and filters.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NO_FILTERS } from "@/features/catalog/catalogQuery.js";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { filterProducts, sortProducts } from "@/features/catalog/searchCatalog.js";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";

const BASE_QUERY = Object.freeze({ q: "", ...NO_FILTERS, sort: "featured", page: 1 });

/**
 * Signs in through the form and opens the Shopping page of the Buy mode.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openShopping() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  const personalAreaBar = screen.getByRole("navigation", { name: "Personal area" });
  await user.click(within(personalAreaBar).getByRole("radio", { name: "Buy" }));
  return { user };
}

/**
 * Returns the product list.
 *
 * @returns {HTMLElement} The list of product cards.
 */
const productList = () => screen.getByRole("list", { name: "Products" });

/**
 * Returns the titles of the products shown, in order.
 *
 * @returns {string[]} The product titles.
 */
const shownTitles = () => within(productList()).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);

/**
 * Returns the pager under the products.
 *
 * @returns {HTMLElement} The pager navigation region.
 */
const pager = () => screen.getByRole("navigation", { name: "Pages" });

/**
 * Returns how many sample products match the given search values.
 *
 * @param {Partial<import("@/features/catalog/catalogQuery.js").CatalogQuery>} changes - Search values.
 * @returns {number} The number of matching products.
 */
const countMatches = (changes) => filterProducts(SAMPLE_PRODUCTS, { ...BASE_QUERY, ...changes }).length;

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

describe("ShoppingPage", () => {
  it("shows the search box first, then Filters and Sort by, then the products, then the pages", async () => {
    await openShopping();

    expectInDocumentOrder(
      screen.getByRole("search"),
      screen.getByRole("button", { name: /Filters/ }),
      screen.getByLabelText("Sort by"),
      productList(),
      pager(),
    );
  });

  it("shows at most 50 products per page and one page per 50 products, plus one for the rest", async () => {
    await openShopping();

    expect(within(productList()).getAllByRole("listitem")).toHaveLength(50);
    expect(screen.getByText("1–50 of 237 results")).toBeInTheDocument();
    const pagerRegion = pager();
    expect(within(pagerRegion).getByLabelText("Page 1")).toHaveAttribute("aria-current", "page");
    expect(within(pagerRegion).getByRole("link", { name: "Page 5" })).toBeInTheDocument();
    expect(within(pagerRegion).queryByRole("link", { name: "Page 6" })).not.toBeInTheDocument();
    expect(within(pagerRegion).getByText("Previous").closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");
  });

  it("moves between pages with Next, a page number and Previous", async () => {
    const { user } = await openShopping();

    await user.click(within(pager()).getByRole("link", { name: /Next/ }));
    expect(screen.getByText("51–100 of 237 results")).toBeInTheDocument();

    await user.click(within(pager()).getByRole("link", { name: "Page 5" }));
    expect(screen.getByText("201–237 of 237 results")).toBeInTheDocument();
    expect(within(productList()).getAllByRole("listitem")).toHaveLength(37);
    expect(within(pager()).getByText("Next").closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");

    await user.click(within(pager()).getByRole("link", { name: /Previous/ }));
    expect(screen.getByText("151–200 of 237 results")).toBeInTheDocument();
  });

  it("searches the catalog and starts again from the first page", async () => {
    const { user } = await openShopping();
    await user.click(within(pager()).getByRole("link", { name: "Page 2" }));

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "speaker{Enter}");

    const expectedCount = countMatches({ q: "speaker" });
    expect(expectedCount).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`^1–${expectedCount} of ${expectedCount} results for`))).toBeInTheDocument();
    expect(screen.getByText("“speaker”")).toBeInTheDocument();
    shownTitles().forEach((title) => expect(title).toMatch(/speaker/i));
  });

  it("shows a message and no pages when nothing matches, and can clear the search", async () => {
    const { user } = await openShopping();

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "no such product{Enter}");

    expect(screen.getByText("No products match your search.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pages" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear search and filters" }));
    expect(screen.getByText("1–50 of 237 results")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search products" })).toHaveValue("");
  });

  it("sorts by price from low to high", async () => {
    const { user } = await openShopping();

    await user.selectOptions(screen.getByLabelText("Sort by"), "Price: Low to High");

    const cheapestTitles = sortProducts(SAMPLE_PRODUCTS, "price-asc")
      .slice(0, 3)
      .map((product) => product.title);
    expect(shownTitles().slice(0, 3)).toEqual(cheapestTitles);
  });

  it("opens the Filters panel, filters by category and clears the filters", async () => {
    const { user } = await openShopping();
    const filtersButton = screen.getByRole("button", { name: /Filters/ });

    await user.click(filtersButton);
    expect(filtersButton).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByRole("region", { name: "Filters" });

    await user.click(within(panel).getByRole("checkbox", { name: "Books" }));
    const bookCount = countMatches({ categories: ["books"] });
    expect(screen.getByText(`1–${Math.min(bookCount, 50)} of ${bookCount} results`)).toBeInTheDocument();
    expect(filtersButton).toHaveAccessibleName("Filters, 1 active");

    await user.click(within(panel).getByRole("button", { name: "Clear all filters" }));
    expect(screen.getByText("1–50 of 237 results")).toBeInTheDocument();
    expect(within(panel).getByRole("checkbox", { name: "Books" })).not.toBeChecked();
  });

  it("filters by customer rating", async () => {
    const { user } = await openShopping();

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    await user.click(screen.getByRole("radio", { name: "4 out of 5 stars & Up" }));

    const matchCount = countMatches({ minRating: 4 });
    expect(screen.getByText(`1–${Math.min(matchCount, 50)} of ${matchCount} results`)).toBeInTheDocument();
  });
});
