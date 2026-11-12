/**
 * @file Provider that holds the signed-in user's shopping cart for the personal area.
 *
 * The cart lives in memory, so it keeps its products while the user moves
 * between pages and modes, and it starts empty at the next sign-in. Ordering
 * turns the cart into the user's pending orders, one per seller, through
 * OrdersProvider, which must wrap this provider.
 */

import { useCallback, useMemo, useState } from "react";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { useOrders } from "@/features/orders/useOrders.js";
import { CURRENT_USER } from "@/features/users/users.js";
import { CartContext } from "./CartContext.js";
import {
  EMPTY_CART,
  addOrderItemsToCart,
  addProductToCart,
  changeQuantity,
  createOrdersFromCart,
  getCartSummary,
  removeFromCart,
} from "./cartLines.js";

const PRODUCTS_BY_ID = new Map(SAMPLE_PRODUCTS.map((product) => [product.id, product]));

/**
 * Returns the catalog product with the given code.
 *
 * @param {string} productId - Product code.
 * @returns {import("@/features/catalog/sampleProducts.js").Product | undefined} The product, or undefined when it is no longer sold.
 */
const findCatalogProduct = (productId) => PRODUCTS_BY_ID.get(productId);

/**
 * Provides the cart and its actions to everything inside it.
 *
 * @param {object} props - Provider props.
 * @param {import("react").ReactNode} props.children - The part of the app that can use the cart.
 * @returns {JSX.Element} The provider.
 */
export default function CartProvider({ children }) {
  const [lines, setLines] = useState(EMPTY_CART);
  const [placedOrders, setPlacedOrders] = useState(null);
  const { placeOrders } = useOrders();

  /**
   * Adds one unit of a product and forgets the last order's confirmation.
   *
   * @param {import("@/features/catalog/sampleProducts.js").Product} product - The product to add.
   */
  const addProduct = useCallback((product) => {
    setLines((currentLines) => addProductToCart(currentLines, product));
    setPlacedOrders(null);
  }, []);

  /**
   * Adds the items of an earlier order with their quantities, and forgets the last order's confirmation.
   *
   * @param {ReadonlyArray<import("@/features/orders/orderItems.js").OrderItem>} items - The order's items.
   * @returns {import("./cartLines.js").ReorderResult} What was added, and what was not.
   */
  const addOrderItems = useCallback(
    (items) => {
      const result = addOrderItemsToCart(lines, items, findCatalogProduct);
      setLines(result.lines);
      setPlacedOrders(null);
      return result;
    },
    [lines],
  );

  /**
   * Adds one unit of a product that is in the cart.
   *
   * @param {string} productId - Product code.
   */
  const increaseQuantity = useCallback((productId) => {
    setLines((currentLines) => changeQuantity(currentLines, productId, 1));
  }, []);

  /**
   * Takes away one unit of a product that is in the cart, down to one unit.
   *
   * @param {string} productId - Product code.
   */
  const decreaseQuantity = useCallback((productId) => {
    setLines((currentLines) => changeQuantity(currentLines, productId, -1));
  }, []);

  /**
   * Removes a product from the cart.
   *
   * @param {string} productId - Product code.
   */
  const removeProduct = useCallback((productId) => {
    setLines((currentLines) => removeFromCart(currentLines, productId));
  }, []);

  /**
   * Removes every product from the cart.
   */
  const clearCart = useCallback(() => {
    setLines(EMPTY_CART);
  }, []);

  /**
   * Places one pending order per seller for the products in the cart, then empties the cart; does nothing when it is empty.
   */
  const placeOrder = useCallback(() => {
    if (lines.length === 0) {
      return;
    }
    setPlacedOrders(placeOrders(createOrdersFromCart(lines, new Date().toISOString(), CURRENT_USER)));
    setLines(EMPTY_CART);
  }, [lines, placeOrders]);

  const cart = useMemo(
    () => ({
      lines,
      ...getCartSummary(lines),
      placedOrders,
      addProduct,
      addOrderItems,
      increaseQuantity,
      decreaseQuantity,
      removeProduct,
      clearCart,
      placeOrder,
    }),
    [
      lines,
      placedOrders,
      addProduct,
      addOrderItems,
      increaseQuantity,
      decreaseQuantity,
      removeProduct,
      clearCart,
      placeOrder,
    ],
  );

  return <CartContext value={cart}>{children}</CartContext>;
}
