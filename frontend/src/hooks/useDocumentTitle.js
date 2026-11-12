/**
 * @file Hook that sets the browser tab title for the current page.
 */

import { useEffect } from "react";
import { APP_NAME } from "@/constants/app.js";

/**
 * Sets the tab title to "<page title> | <app name>", or to the app name alone when no page title is given.
 *
 * @param {string} [pageTitle] - Title of the current page.
 */
export function useDocumentTitle(pageTitle) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
  }, [pageTitle]);
}
