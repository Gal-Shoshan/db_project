/**
 * @file Open part of the cart window: the products with their quantities, the total, and the Clear and Order buttons.
 */

import { useRef, useState } from "react";
import { Link } from "react-router";
import Button from "@/components/Button/Button.jsx";
import { MAX_QUANTITY_PER_PRODUCT, MIN_QUANTITY_PER_PRODUCT } from "@/features/cart/cartLines.js";
import { useCart } from "@/features/cart/useCart.js";
import { getLineTotal } from "@/features/orders/orderItems.js";
import { getSeller } from "@/features/sellers/sellers.js";
import { useFocusAfterRender } from "@/hooks/useFocusAfterRender.js";
import { ROUTES } from "@/routes/paths.js";
import { formatCurrency } from "@/utils/formatters.js";
import styles from "./CartPanel.module.css";

/**
 * Renders a small "+" or "−" drawing for the quantity buttons.
 *
 * @param {object} props - Icon props.
 * @param {boolean} props.isPlus - Whether to draw a plus; otherwise a minus.
 * @returns {JSX.Element} The icon.
 */
function StepIcon({ isPlus }) {
  return (
    <svg viewBox="0 0 16 16" className={styles.stepIcon} aria-hidden="true">
      <path d={isPlus ? "M3 8h10M8 3v10" : "M3 8h10"} />
    </svg>
  );
}

/**
 * Renders one product in the cart with its quantity buttons, line total and Remove button.
 *
 * The quantity buttons stay focusable at their limits and are marked
 * aria-disabled instead, so keyboard focus is not lost when a limit is hit.
 *
 * @param {object} props - Line props.
 * @param {import("@/features/cart/cartLines.js").CartLine} props.line - The cart line.
 * @param {function(import("@/features/cart/cartLines.js").CartLine): void} props.onIncrease - Called when "+" is pressed below the limit.
 * @param {function(import("@/features/cart/cartLines.js").CartLine): void} props.onDecrease - Called when "−" is pressed above 1.
 * @param {function(import("@/features/cart/cartLines.js").CartLine): void} props.onRemove - Called when Remove is pressed.
 * @returns {JSX.Element} The list item.
 */
function CartLineItem({ line, onIncrease, onDecrease, onRemove }) {
  const isAtMinimum = line.quantity <= MIN_QUANTITY_PER_PRODUCT;
  const isAtMaximum = line.quantity >= MAX_QUANTITY_PER_PRODUCT;

  return (
    <li className={styles.line}>
      <p className={styles.lineTitle}>{line.title}</p>
      <p className={styles.lineMeta}>
        {formatCurrency(line.unitPrice)} each · Sold by {getSeller(line.sellerId).name}
      </p>
      <div className={styles.lineControls}>
        <div className={styles.stepper} role="group" aria-label={`Quantity of ${line.title}`}>
          <button
            type="button"
            className={styles.stepButton}
            aria-label={`Decrease quantity of ${line.title}`}
            aria-disabled={isAtMinimum}
            onClick={() => !isAtMinimum && onDecrease(line)}
          >
            <StepIcon isPlus={false} />
          </button>
          <span className={styles.quantity}>{line.quantity}</span>
          <button
            type="button"
            className={styles.stepButton}
            aria-label={`Increase quantity of ${line.title}`}
            aria-disabled={isAtMaximum}
            onClick={() => !isAtMaximum && onIncrease(line)}
          >
            <StepIcon isPlus />
          </button>
        </div>
        <button type="button" className={styles.removeButton} onClick={() => onRemove(line)}>
          Remove <span className="visually-hidden">{line.title}</span>
        </button>
        <span className={styles.lineTotal}>{formatCurrency(getLineTotal(line))}</span>
      </div>
    </li>
  );
}

/**
 * Renders what the panel shows instead of products: the orders just placed, or a note that the cart is empty.
 *
 * @param {object} props - Message props.
 * @param {import("@/features/orders/orderSelectors.js").Order[] | null} props.placedOrders - Orders made by the last Order, or null.
 * @param {import("react").RefObject<HTMLParagraphElement>} props.confirmationRef - Ref of the confirmation, so focus can move to it.
 * @returns {JSX.Element} The message.
 */
function EmptyCartMessage({ placedOrders, confirmationRef }) {
  if (placedOrders === null) {
    return <p className={styles.empty}>Your cart is empty.</p>;
  }
  const orderList = placedOrders.map((order) => `${order.id} (${order.seller})`).join(", ");
  return (
    <div className={styles.confirmation}>
      <p ref={confirmationRef} tabIndex={-1} className={styles.confirmationText}>
        Your order was placed: {orderList}. It waits for the {placedOrders.length === 1 ? "seller" : "sellers"} to
        accept it.
      </p>
      <Link to={ROUTES.buyPendingOrders}>View pending orders</Link>
    </div>
  );
}

/**
 * Renders the open cart: the products, the total, Clear and Order, and a hidden status line for screen readers.
 *
 * @param {object} props - Panel props.
 * @param {string} props.id - Element id, referenced by the button that opens the panel.
 * @returns {JSX.Element} The cart panel.
 */
export default function CartPanel({ id }) {
  const { lines, total, placedOrders, increaseQuantity, decreaseQuantity, removeProduct, clearCart, placeOrder } =
    useCart();
  const [announcement, setAnnouncement] = useState("");
  const panelRef = useRef(null);
  const confirmationRef = useRef(null);
  const focusAfterRender = useFocusAfterRender();
  const isEmpty = lines.length === 0;

  /**
   * Adds one unit of the line's product and announces the new quantity.
   *
   * @param {import("@/features/cart/cartLines.js").CartLine} line - The cart line.
   */
  const increase = (line) => {
    increaseQuantity(line.productId);
    setAnnouncement(`${line.title}: quantity ${line.quantity + 1}.`);
  };

  /**
   * Takes away one unit of the line's product and announces the new quantity.
   *
   * @param {import("@/features/cart/cartLines.js").CartLine} line - The cart line.
   */
  const decrease = (line) => {
    decreaseQuantity(line.productId);
    setAnnouncement(`${line.title}: quantity ${line.quantity - 1}.`);
  };

  /**
   * Removes the line's product, announces it and moves focus to the panel, since the line's buttons are gone.
   *
   * @param {import("@/features/cart/cartLines.js").CartLine} line - The cart line.
   */
  const remove = (line) => {
    removeProduct(line.productId);
    setAnnouncement(`Removed ${line.title} from the cart.`);
    focusAfterRender(panelRef);
  };

  /**
   * Empties the cart, announces it and moves focus to the panel.
   */
  const clear = () => {
    clearCart();
    setAnnouncement("The cart is empty.");
    focusAfterRender(panelRef);
  };

  /**
   * Places the order and moves focus to its confirmation, which also reads it out.
   */
  const order = () => {
    placeOrder();
    setAnnouncement("");
    focusAfterRender(confirmationRef);
  };

  return (
    <section id={id} ref={panelRef} tabIndex={-1} className={styles.panel} aria-label="Cart items">
      {isEmpty ? (
        <EmptyCartMessage placedOrders={placedOrders} confirmationRef={confirmationRef} />
      ) : (
        <ul className={styles.lines}>
          {lines.map((line) => (
            <CartLineItem
              key={line.productId}
              line={line}
              onIncrease={increase}
              onDecrease={decrease}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        <p className={styles.totalRow}>
          <span>Total</span>
          <span className={styles.totalAmount}>{formatCurrency(total)}</span>
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={clear} disabled={isEmpty}>
            Clear
          </Button>
          <Button onClick={order} disabled={isEmpty}>
            Order
          </Button>
        </div>
      </div>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </section>
  );
}
