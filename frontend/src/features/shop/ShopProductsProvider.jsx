/**
 * @file Provider that holds the products of the signed-in user's shop for the personal area.
 *
 * The products start as the sample list and live in memory, so added,
 * edited and removed products stay that way while the user moves between
 * pages and modes, and the list starts over at the next sign-in. Changes are
 * local for now; no server is told.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { SAMPLE_SHOP_PRODUCTS } from "./sampleShopProducts.js";
import { ShopProductsContext } from "./ShopProductsContext.js";
import {
  applyProductEdit,
  createNewShopProduct,
  formatShopProductId,
  getNextShopProductNumber,
} from "./shopProducts.js";

/**
 * Provides the shop's products and the addProduct, updateProduct and removeProduct actions to everything inside it.
 *
 * @param {object} props - Provider props.
 * @param {import("react").ReactNode} props.children - The part of the app that can use the shop's products.
 * @returns {JSX.Element} The provider.
 */
export default function ShopProductsProvider({ children }) {
  const [products, setProducts] = useState(SAMPLE_SHOP_PRODUCTS);
  const nextProductNumberRef = useRef(getNextShopProductNumber(SAMPLE_SHOP_PRODUCTS));

  /**
   * Adds a new product with the next product code, first in the featured order.
   *
   * Note: codes of removed products are not given out again.
   *
   * @param {import("./shopProducts.js").NewProductValues} values - The new product's values.
   * @returns {import("./sampleShopProducts.js").ShopProduct} The added product.
   */
  const addProduct = useCallback(
    (values) => {
      const id = formatShopProductId(nextProductNumberRef.current);
      nextProductNumberRef.current += 1;
      const firstFeaturedRank = Math.min(0, ...products.map((product) => product.featuredRank));
      const product = createNewShopProduct(values, { id, featuredRank: firstFeaturedRank - 1 });
      setProducts((currentProducts) => [product, ...currentProducts]);
      return product;
    },
    [products],
  );

  /**
   * Gives a product a new name, price and stock; does nothing for an unknown product code.
   *
   * @param {string} productId - Product code, for example "S0001".
   * @param {import("./shopProducts.js").ProductChanges} changes - The new values.
   */
  const updateProduct = useCallback((productId, changes) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === productId ? applyProductEdit(product, changes) : product)),
    );
  }, []);

  /**
   * Removes a product from the shop; does nothing for an unknown product code.
   *
   * @param {string} productId - Product code, for example "S0001".
   */
  const removeProduct = useCallback((productId) => {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  }, []);

  const shopProducts = useMemo(
    () => ({ products, addProduct, updateProduct, removeProduct }),
    [products, addProduct, updateProduct, removeProduct],
  );

  return <ShopProductsContext value={shopProducts}>{children}</ShopProductsContext>;
}
