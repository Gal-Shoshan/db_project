/**
 * @file Layout of the Buy mode: the mode's sidebar and pages, with the cart window at the bottom right.
 */

import CartWidget from "@/features/cart/components/CartWidget/CartWidget.jsx";
import ModeLayout from "@/layouts/ModeLayout/ModeLayout.jsx";
import styles from "./BuyModeLayout.module.css";

/**
 * Renders the Buy mode's layout and the cart window, which no other mode shows.
 *
 * The pages get extra space at the bottom, so their last row can scroll
 * above the closed cart window instead of staying hidden behind it.
 *
 * @returns {JSX.Element} The Buy mode layout.
 */
export default function BuyModeLayout() {
  return (
    <div className={styles.buyMode}>
      <ModeLayout modeValue="buy" contentClassName={styles.contentAboveCart} />
      <CartWidget />
    </div>
  );
}
