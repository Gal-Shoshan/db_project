/**
 * @file Hook that reads the shopping cart from CartProvider.
 */

import { useContext } from "react";
import { CartContext } from "./CartContext.js";

/**
 * The shopping cart and the actions that change it.
 *
 * @typedef {object} Cart
 * @property {ReadonlyArray<import("./cartLines.js").CartLine>} lines - Products in the cart, in the order they were added.
 * @property {number} itemCount - Number of units in the cart.
 * @property {number} total - Total price of the cart in dollars.
 * @property {import("@/features/orders/orderSelectors.js").Order[] | null} placedOrders - Orders made by the last Order, until a product is added again.
 * @property {function(import("@/features/catalog/sampleProducts.js").Product): void} addProduct - Adds one unit of a product.
 * @property {function(ReadonlyArray<import("@/features/orders/orderItems.js").OrderItem>): import("./cartLines.js").ReorderResult} addOrderItems - Adds an earlier order's items, and says what was added.
 * @property {function(string): void} increaseQuantity - Adds one unit of the product with the given code.
 * @property {function(string): void} decreaseQuantity - Takes away one unit of the product with the given code, down to 1.
 * @property {function(string): void} removeProduct - Removes the product with the given code.
 * @property {function(): void} clearCart - Removes every product.
 * @property {function(): void} placeOrder - Turns the cart into pending orders and empties it.
 */

/**
 * Returns the shopping cart and its actions.
 *
 * @returns {Cart} The cart.
 * @throws {Error} If called outside CartProvider.
 */
export function useCart() {
  const cart = useContext(CartContext);
  if (cart === null) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return cart;
}
