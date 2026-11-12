/**
 * @file Test helper that renders the whole application at a given URL.
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "@/App.jsx";

/**
 * Renders the application inside an in-memory router that starts at the given path.
 *
 * @param {string} path - URL path to start on.
 * @returns {{user: import("@testing-library/user-event").UserEvent}} A user-event session for interacting with the page.
 */
export function renderApp(path) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return { user };
}
