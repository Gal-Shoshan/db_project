/**
 * @file Tests for the personal area: entry only through sign-in, the top bar, the modes and their sidebars, the profile and logging out.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router";
import { describe, expect, it } from "vitest";
import App from "@/App.jsx";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { TEST_EMAIL, signInThroughForm } from "@/test/signInThroughForm.js";

/**
 * Returns the main heading of the current page.
 *
 * @returns {HTMLElement} The level-one heading.
 */
const pageHeading = () => screen.getByRole("heading", { level: 1 });

/**
 * Returns the personal-area top bar.
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
 * Renders the app on the sign-in page and signs in through the form.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function renderSignedIn() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  return { user };
}

/**
 * Renders buttons that step the router history back and forward, standing in for the browser's buttons.
 *
 * @returns {JSX.Element} The history buttons.
 */
function HistoryButtons() {
  const navigate = useNavigate();
  return (
    <div>
      <button type="button" onClick={() => navigate(-1)}>
        History back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        History forward
      </button>
    </div>
  );
}

describe("Personal area", () => {
  it("opens on the Sell mode's Orders option after signing in", async () => {
    await renderSignedIn();
    expect(pageHeading()).toHaveTextContent("Orders");
    expect(within(personalAreaBar()).getByRole("radio", { name: "Sell" })).toBeChecked();
  });

  it("shows the Sell options in a sidebar, with Orders selected", async () => {
    await renderSignedIn();
    const sidebar = screen.getByRole("navigation", { name: "Sell options" });
    expect(within(sidebar).getAllByRole("link").map((link) => link.textContent)).toEqual(["Orders", "Products"]);
    expect(within(sidebar).getByRole("link", { name: "Orders" })).toHaveAttribute("aria-current", "page");
  });

  it("shows the Buy options in a sidebar, with Shopping selected", async () => {
    const { user } = await renderSignedIn();

    await chooseMode(user, "Buy");

    expect(pageHeading()).toHaveTextContent("Shopping");
    const sidebar = screen.getByRole("navigation", { name: "Buy options" });
    expect(within(sidebar).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Shopping",
      "Pending Orders",
      "Purchases",
    ]);
    expect(within(sidebar).getByRole("link", { name: "Shopping" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("navigation", { name: "Sell options" })).not.toBeInTheDocument();
  });

  it("shows the Reports mode without a sidebar", async () => {
    const { user } = await renderSignedIn();

    await chooseMode(user, "Reports");

    expect(pageHeading()).toHaveTextContent("Reports");
    expect(screen.queryByRole("navigation", { name: /options/ })).not.toBeInTheDocument();
  });

  it("cannot be opened by URL without signing in", () => {
    renderApp(ROUTES.sellOrders);
    expect(pageHeading()).toHaveTextContent("Sign in");
  });

  it("does not let the profile be opened by URL without signing in", () => {
    renderApp(ROUTES.profile);
    expect(pageHeading()).toHaveTextContent("Sign in");
  });

  it("puts the mode, the profile link and the log-out button in the top bar, and nothing that leads home", async () => {
    await renderSignedIn();
    const bar = personalAreaBar();

    expect(within(bar).getByRole("radiogroup", { name: "Mode" })).toBeInTheDocument();
    expect(within(bar).getAllByRole("link").map((link) => link.textContent)).toEqual(["View profile"]);
    expect(within(bar).getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
    const linkTargets = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(linkTargets).not.toContain(ROUTES.home);
    expect(linkTargets).not.toContain(ROUTES.personalArea);
  });

  it("shows the profile with no mode selected, and returns to a mode from the top bar", async () => {
    const { user } = await renderSignedIn();
    const bar = personalAreaBar();

    await user.click(within(bar).getByRole("link", { name: "View profile" }));
    expect(pageHeading()).toHaveTextContent("Profile");
    expect(screen.getByText(TEST_EMAIL)).toBeInTheDocument();
    expect(within(bar).getByRole("link", { name: "View profile" })).toHaveAttribute("aria-current", "page");
    within(bar)
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).not.toBeChecked());

    await chooseMode(user, "Buy");
    expect(pageHeading()).toHaveTextContent("Shopping");
  });

  it("logs out to the sign-in page", async () => {
    const { user } = await renderSignedIn();

    await user.click(within(personalAreaBar()).getByRole("button", { name: "Log out" }));

    expect(pageHeading()).toHaveTextContent("Sign in");
    expect(screen.queryByRole("navigation", { name: "Personal area" })).not.toBeInTheDocument();
  });

  it("ends the session when the browser goes back to a public page", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[ROUTES.home, ROUTES.signIn]} initialIndex={1}>
        <App />
        <HistoryButtons />
      </MemoryRouter>,
    );
    await signInThroughForm(user);
    expect(pageHeading()).toHaveTextContent("Orders");

    await user.click(screen.getByRole("button", { name: "History back" }));
    expect(pageHeading()).toHaveTextContent("Welcome to DB Project");

    await user.click(screen.getByRole("button", { name: "History forward" }));
    expect(pageHeading()).toHaveTextContent("Sign in");
  });
});
