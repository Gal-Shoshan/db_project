/**
 * @file Tests for the sign-in form: both fields are required, and a filled-in form opens the personal area.
 */

import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";

/**
 * Returns the main heading of the current page.
 *
 * @returns {HTMLElement} The level-one heading.
 */
const pageHeading = () => screen.getByRole("heading", { level: 1 });

describe("SignInPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows labeled email and password fields", () => {
    renderApp(ROUTES.signIn);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("stays on the page and flags both fields when they are empty", async () => {
    const { user } = renderApp(ROUTES.signIn);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(pageHeading()).toHaveTextContent("Sign in");
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Enter your email.");
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("Enter your password.");
  });

  it("stays on the page when only the email is filled in", async () => {
    const { user } = renderApp(ROUTES.signIn);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(pageHeading()).toHaveTextContent("Sign in");
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("treats fields that hold only spaces as empty", async () => {
    const { user } = renderApp(ROUTES.signIn);

    await user.type(screen.getByLabelText("Email"), "   ");
    await user.type(screen.getByLabelText("Password"), "   ");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(pageHeading()).toHaveTextContent("Sign in");
  });

  it("opens the personal area when both fields are filled in, without any network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { user } = renderApp(ROUTES.signIn);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "anything");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByRole("navigation", { name: "Personal area" })).toBeInTheDocument();
    expect(pageHeading()).toHaveTextContent("Orders");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("stores nothing in browser storage", async () => {
    const { user } = renderApp(ROUTES.signIn);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "secret-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(window.sessionStorage).toHaveLength(0);
    expect(window.localStorage).toHaveLength(0);
  });
});
