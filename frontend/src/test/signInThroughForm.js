/**
 * @file Test helper that signs in through the sign-in form, the only way into the personal area.
 */

import { screen } from "@testing-library/react";

/** Email address the helper signs in with. */
export const TEST_EMAIL = "ada@example.com";

/**
 * Fills in and submits the sign-in form that is on screen.
 *
 * @param {import("@testing-library/user-event").UserEvent} user - User-event session.
 * @returns {Promise<void>} Resolves once the form is submitted.
 */
export async function signInThroughForm(user) {
  await user.type(screen.getByLabelText("Email"), TEST_EMAIL);
  await user.type(screen.getByLabelText("Password"), "any-password");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}
