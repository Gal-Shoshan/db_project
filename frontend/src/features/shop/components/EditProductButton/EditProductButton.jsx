/**
 * @file Bottom of a product card on the seller's Products page: the quantity in stock and the Edit button.
 */

import Button from "@/components/Button/Button.jsx";
import { formatCount } from "@/utils/formatters.js";
import styles from "./EditProductButton.module.css";

/**
 * Renders how many units are in stock and the button that opens the product's Edit window.
 *
 * @param {object} props - Button props.
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} props.product - The product.
 * @param {string} props.productTitleId - Element id of the product title, which describes the button.
 * @param {function(import("@/features/shop/sampleShopProducts.js").ShopProduct): void} props.onEdit - Called with the product when Edit is pressed.
 * @returns {JSX.Element} The stock line and the button.
 */
export default function EditProductButton({ product, productTitleId, onEdit }) {
  return (
    <div className={styles.editProduct}>
      <p className={product.stock > 0 ? styles.stock : styles.noStock}>In stock: {formatCount(product.stock)}</p>
      <Button variant="secondary" fullWidth aria-describedby={productTitleId} onClick={() => onEdit(product)}>
        Edit
      </Button>
    </div>
  );
}
