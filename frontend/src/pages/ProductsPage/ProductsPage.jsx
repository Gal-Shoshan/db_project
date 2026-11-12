/**
 * @file Products page of the Sell mode: the seller's own products in the Shopping catalog's layout, with editing, removing and adding products.
 */

import { useRef, useState } from "react";
import ProductCatalog from "@/features/catalog/components/ProductCatalog/ProductCatalog.jsx";
import AddProductButton from "@/features/shop/components/AddProductButton/AddProductButton.jsx";
import EditProductButton from "@/features/shop/components/EditProductButton/EditProductButton.jsx";
import EditProductDialog from "@/features/shop/components/EditProductDialog/EditProductDialog.jsx";
import NewProductDialog from "@/features/shop/components/NewProductDialog/NewProductDialog.jsx";
import RemoveProductDialog from "@/features/shop/components/RemoveProductDialog/RemoveProductDialog.jsx";
import { useShopProducts } from "@/features/shop/useShopProducts.js";
import { useFocusAfterRender } from "@/hooks/useFocusAfterRender.js";
import { formatCount, formatCurrency } from "@/utils/formatters.js";
import styles from "./ProductsPage.module.css";

const UNAVAILABLE_NOTE = "It is unavailable to buyers until you add stock.";

/**
 * Returns the status message shown after a product is updated.
 *
 * @param {import("@/features/shop/shopProducts.js").ProductChanges} changes - The saved values.
 * @returns {string} The message, for example "Saved “Lumen Smart Watch, Black”: $49.99, 12 in stock.".
 */
function describeUpdate({ title, price, stock }) {
  const summary = `Saved “${title}”: ${formatCurrency(price)}, ${formatCount(stock)} in stock.`;
  return stock === 0 ? `${summary} ${UNAVAILABLE_NOTE}` : summary;
}

/**
 * Returns the status message shown after a product is added.
 *
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} product - The added product.
 * @returns {string} The message, for example "Added “Desk Lamp” to your store as S0025.".
 */
function describeCreation(product) {
  const summary = `Added “${product.title}” to your store as ${product.id}.`;
  return product.stock === 0 ? `${summary} ${UNAVAILABLE_NOTE}` : summary;
}

/**
 * Renders the seller's products like the Shopping page, the floating "+" button, and the Edit, Remove and New product windows.
 *
 * Each card shows the quantity in stock and an Edit button. In the Edit
 * window, Update saves the new name, price and quantity, and the trash button
 * asks "Remove this product?" before removing it. The "+" button at the
 * bottom right opens the New product window, whose "Add to the store" button
 * adds the product first in the Featured order. A status line reports each
 * change; a quantity of 0 makes a product unavailable.
 *
 * @returns {JSX.Element} The Products page.
 */
export default function ProductsPage() {
  const { products, addProduct, updateProduct, removeProduct } = useShopProducts();
  const [editedProduct, setEditedProduct] = useState(null);
  const [productToRemove, setProductToRemove] = useState(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const statusRef = useRef(null);
  const focusAfterRender = useFocusAfterRender();

  /**
   * Saves the product's new values, closes the Edit window and reports the change.
   *
   * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} product - The edited product.
   * @param {import("@/features/shop/shopProducts.js").ProductChanges} changes - The new values.
   */
  const saveProduct = (product, changes) => {
    updateProduct(product.id, changes);
    setEditedProduct(null);
    setStatusMessage(describeUpdate(changes));
  };

  /**
   * Removes the confirmed product, closes both windows and moves focus to the report, since the card is gone.
   *
   * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} product - The product to remove.
   */
  const confirmRemove = (product) => {
    removeProduct(product.id);
    setProductToRemove(null);
    setEditedProduct(null);
    setStatusMessage(`Removed “${product.title}” from your store.`);
    focusAfterRender(statusRef);
  };

  /**
   * Adds the new product, closes the New product window and reports it.
   *
   * @param {import("@/features/shop/shopProducts.js").NewProductValues} values - The new product's values.
   */
  const createProduct = (values) => {
    const product = addProduct(values);
    setIsNewProductOpen(false);
    setStatusMessage(describeCreation(product));
  };

  /**
   * Renders a product card's stock line and Edit button.
   *
   * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} product - The product.
   * @param {string} titleId - Element id of the product's title.
   * @returns {JSX.Element} The stock line and the button.
   */
  const renderEditButton = (product, titleId) => (
    <EditProductButton product={product} productTitleId={titleId} onEdit={setEditedProduct} />
  );

  return (
    <div className={styles.page}>
      <ProductCatalog title="Products" products={products} renderCardAction={renderEditButton}>
        <p ref={statusRef} tabIndex={-1} role="status" className={statusMessage ? styles.notice : "visually-hidden"}>
          {statusMessage}
        </p>
      </ProductCatalog>
      <EditProductDialog
        product={editedProduct}
        onClose={() => setEditedProduct(null)}
        onSave={saveProduct}
        onRemove={setProductToRemove}
      />
      <RemoveProductDialog
        product={productToRemove}
        onKeep={() => setProductToRemove(null)}
        onConfirm={confirmRemove}
      />
      <NewProductDialog isOpen={isNewProductOpen} onClose={() => setIsNewProductOpen(false)} onCreate={createProduct} />
      <AddProductButton onClick={() => setIsNewProductOpen(true)} />
    </div>
  );
}
