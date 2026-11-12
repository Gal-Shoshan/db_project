/**
 * @file React context that carries the shopping cart and the actions that change it.
 */

import { createContext } from "react";

/**
 * Context value: the cart and its actions, or null outside CartProvider.
 *
 * @type {import("react").Context<import("./useCart.js").Cart | null>}
 */
export const CartContext = createContext(null);
