/**
 * @file "Add to cart" button of a product card, with how many units are already in the cart.
 */

import Button from "@/components/Button/Button.jsx";
import CartIcon from "@/features/cart/components/CartIcon/CartIcon.jsx";
import { MAX_QUANTITY_PER_PRODUCT, getQuantityInCart } from "@/features/cart/cartLines.js";
import { useCart } from "@/features/cart/useCart.js";
import styles from "./AddToCartButton.module.css";

/**
 * Returns the note under the button, for example "2 in cart", or an empty string when the product is not in the cart.
 *
 * @param {number} quantityInCart - Units of the product in the cart.
 * @returns {string} The note.
 */
function describeQuantityInCart(quantityInCart) {
  if (quantityInCart === 0) {
    return "";
  }
  const limitNote = quantityInCart >= MAX_QUANTITY_PER_PRODUCT ? " (the most you can order)" : "";
  return `${quantityInCart} in cart${limitNote}`;
}

/**
 * Renders the button that adds one unit of the product to the cart, and the units already in it.
 *
 * Out-of-stock products get a disabled button. At the per-product limit the
 * button is marked aria-disabled instead, so it keeps keyboard focus.
 *
 * @param {object} props - Button props.
 * @param {import("@/features/catalog/sampleProducts.js").Product} props.product - The product.
 * @param {string} props.productTitleId - Element id of the product title, which describes the button.
 * @returns {JSX.Element} The button and its note.
 */
export default function AddToCartButton({ product, productTitleId }) {
  const { lines, addProduct } = useCart();
  const quantityInCart = getQuantityInCart(lines, product.id);
  const isAtLimit = quantityInCart >= MAX_QUANTITY_PER_PRODUCT;

  return (
    <div className={styles.addToCart}>
      <Button
        fullWidth
        disabled={!product.inStock}
        aria-disabled={isAtLimit}
        aria-describedby={productTitleId}
        onClick={() => !isAtLimit && addProduct(product)}
      >
        <CartIcon className={styles.icon} />
        Add to cart
      </Button>
      <p className={styles.inCart} aria-live="polite">
        {describeQuantityInCart(quantityInCart)}
      </p>
    </div>
  );
}
