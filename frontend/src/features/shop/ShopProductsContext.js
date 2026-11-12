/**
 * @file React context that carries the products of the user's shop and the actions that add, edit and remove them.
 */

import { createContext } from "react";

/**
 * Context value: the shop's products and their actions, or null outside ShopProductsProvider.
 *
 * @type {import("react").Context<import("./useShopProducts.js").ShopProducts | null>}
 */
export const ShopProductsContext = createContext(null);
