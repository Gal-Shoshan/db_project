/**
 * @file Tests for the sign-up form: password confirmation, the not-connected notice, and no network requests.
 */

import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";

/**
 * Fills every sign-up field, using the given value for the password confirmation.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @param {string} confirmPassword - Value typed into the "Confirm password" field.
 * @returns {Promise<void>} Resolves when every field is filled.
 */
async function fillSignUpForm(user, confirmPassword) {
  await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Password"), "correct-horse");
  await user.type(screen.getByLabelText("Confirm password"), confirmPassword);
}

describe("SignUpPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("describes the password rule under the password field", () => {
    renderApp(ROUTES.signUp);
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("At least 8 characters.");
  });

  it("flags the confirmation field when the passwords differ", async () => {
    const { user } = renderApp(ROUTES.signUp);

    await fillSignUpForm(user, "different-horse");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    const confirmField = screen.getByLabelText("Confirm password");
    expect(confirmField).toHaveAttribute("aria-invalid", "true");
    expect(confirmField).toHaveAccessibleDescription("Passwords do not match.");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("shows the not-connected notice for a valid form and makes no network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { user } = renderApp(ROUTES.signUp);

    await fillSignUpForm(user, "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(screen.getByRole("status")).toHaveTextContent(/not connected to a server/i);
    expect(screen.getByLabelText("Confirm password")).not.toHaveAttribute("aria-invalid");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
