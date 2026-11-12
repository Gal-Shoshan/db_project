/**
 * @file Routing tests: each page renders at its path, and the links move between the pages.
 */

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";

/**
 * Returns the main heading of the current page.
 *
 * @returns {HTMLElement} The level-one heading.
 */
const pageHeading = () => screen.getByRole("heading", { level: 1 });

describe("App routing", () => {
  it("shows the home page at the root path", () => {
    renderApp(ROUTES.home);
    expect(pageHeading()).toHaveTextContent("Welcome to DB Project");
    expect(document.title).toBe("DB Project");
  });

  it("shows the sign-in page at its path with its own tab title", () => {
    renderApp(ROUTES.signIn);
    expect(pageHeading()).toHaveTextContent("Sign in");
    expect(document.title).toBe("Sign in | DB Project");
  });

  it("moves from home to sign up, then to sign in, then back to sign up", async () => {
    const { user } = renderApp(ROUTES.home);

    await user.click(screen.getByRole("link", { name: "Create an account" }));
    expect(pageHeading()).toHaveTextContent("Create an account");

    await user.click(within(screen.getByText(/already have an account/i)).getByRole("link", { name: "Sign in" }));
    expect(pageHeading()).toHaveTextContent("Sign in");

    await user.click(within(screen.getByText(/have an account\?/i)).getByRole("link", { name: "Sign up" }));
    expect(pageHeading()).toHaveTextContent("Create an account");
  });

  it("opens each page from the navigation bar and marks the current one", async () => {
    const { user } = renderApp(ROUTES.home);
    const navigation = screen.getByRole("navigation", { name: "Main" });

    await user.click(within(navigation).getByRole("link", { name: "Sign in" }));
    expect(pageHeading()).toHaveTextContent("Sign in");
    expect(within(navigation).getByRole("link", { name: "Sign in" })).toHaveAttribute("aria-current", "page");

    await user.click(within(navigation).getByRole("link", { name: "DB Project" }));
    expect(pageHeading()).toHaveTextContent("Welcome to DB Project");
  });

  it("shows the not-found page for an unknown path and links back home", async () => {
    const { user } = renderApp("/no-such-page");
    expect(pageHeading()).toHaveTextContent("Page not found");

    await user.click(screen.getByRole("link", { name: "Go to the home page" }));
    expect(pageHeading()).toHaveTextContent("Welcome to DB Project");
  });
});
