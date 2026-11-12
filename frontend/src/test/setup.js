/**
 * @file Vitest setup: adds the jest-dom matchers, stands in for the dialog methods jsdom lacks, and unmounts rendered components after each test.
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Opens the dialog; stands in for the browser's showModal, which jsdom does not implement.
 *
 * @this {HTMLDialogElement}
 */
function showModal() {
  this.open = true;
}

/**
 * Closes the dialog and fires its close event, as the browser's close does.
 *
 * @this {HTMLDialogElement}
 */
function close() {
  if (!this.open) {
    return;
  }
  this.open = false;
  this.dispatchEvent(new Event("close"));
}

HTMLDialogElement.prototype.showModal ??= showModal;
HTMLDialogElement.prototype.close ??= close;

afterEach(() => {
  cleanup();
});
