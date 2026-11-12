/**
 * @file Hook that reads the products of the user's shop from ShopProductsProvider.
 */

import { useContext } from "react";
import { ShopProductsContext } from "./ShopProductsContext.js";

/**
 * The products of the user's shop and the actions that add, edit and remove them.
 *
 * @typedef {object} ShopProducts
 * @property {ReadonlyArray<import("./sampleShopProducts.js").ShopProduct>} products - The shop's products.
 * @property {function(import("./shopProducts.js").NewProductValues): import("./sampleShopProducts.js").ShopProduct} addProduct - Adds a new product and returns it.
 * @property {function(string, import("./shopProducts.js").ProductChanges): void} updateProduct - Gives the product with the given code a new name, price and stock.
 * @property {function(string): void} removeProduct - Removes the product with the given code from the shop.
 */

/**
 * Returns the shop's products and the addProduct, updateProduct and removeProduct actions.
 *
 * @returns {ShopProducts} The shop's products.
 * @throws {Error} If called outside ShopProductsProvider.
 */
export function useShopProducts() {
  const shopProducts = useContext(ShopProductsContext);
  if (shopProducts === null) {
    throw new Error("useShopProducts must be used inside ShopProductsProvider.");
  }
  return shopProducts;
}
