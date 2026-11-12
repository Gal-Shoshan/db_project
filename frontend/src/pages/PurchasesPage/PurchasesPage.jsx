/**
 * @file Purchases page of the Buy mode: the user's orders that sellers approved, with filters, sorting, details and adding a purchase to the cart again.
 */

import { useState } from "react";
import PageTitle from "@/components/PageTitle/PageTitle.jsx";
import { MAX_QUANTITY_PER_PRODUCT } from "@/features/cart/cartLines.js";
import { useCart } from "@/features/cart/useCart.js";
import NoOrdersMessage from "@/features/orders/components/NoOrdersMessage/NoOrdersMessage.jsx";
import OrderCountSummary from "@/features/orders/components/OrderCountSummary/OrderCountSummary.jsx";
import OrderDetailsDialog from "@/features/orders/components/OrderDetailsDialog/OrderDetailsDialog.jsx";
import OrderListControls from "@/features/orders/components/OrderListControls/OrderListControls.jsx";
import OrdersTable from "@/features/orders/components/OrdersTable/OrdersTable.jsx";
import { NO_ORDER_FILTERS } from "@/features/orders/orderListQuery.js";
import { PURCHASES_LIST } from "@/features/orders/orderLists.js";
import { selectPurchasesOf } from "@/features/orders/orderSelectors.js";
import { searchOrders } from "@/features/orders/searchOrders.js";
import { useOrderListQuery } from "@/features/orders/useOrderListQuery.js";
import { useOrders } from "@/features/orders/useOrders.js";
import { CURRENT_USER } from "@/features/users/users.js";
import { formatCount } from "@/utils/formatters.js";
import styles from "./PurchasesPage.module.css";

/**
 * Returns the message that reports what adding a purchase to the cart did.
 *
 * @param {import("@/features/orders/orderSelectors.js").Order} purchase - The purchase added to the cart.
 * @param {import("@/features/cart/cartLines.js").ReorderResult} result - What was added, and what was not.
 * @returns {string} The message, for example "Added 3 items from order ORD-1012 to the cart.".
 */
function describeReorder(purchase, result) {
  const itemsNoun = result.addedUnits === 1 ? "item" : "items";
  const sentences = [
    result.addedUnits > 0
      ? `Added ${formatCount(result.addedUnits)} ${itemsNoun} from order ${purchase.id} to the cart.`
      : `Nothing from order ${purchase.id} was added to the cart.`,
  ];
  if (result.unavailableTitles.length > 0) {
    sentences.push(`Currently unavailable: ${result.unavailableTitles.join(", ")}.`);
  }
  if (result.unitsOverLimit > 0) {
    sentences.push(`Some products were already at the limit of ${MAX_QUANTITY_PER_PRODUCT} in the cart.`);
  }
  return sentences.join(" ");
}

/**
 * Renders the Filters and Sort by bar, then the table of purchases, with a window for a purchase's details.
 *
 * The filters and sort order live in the URL, so Back and Forward step
 * through them. The Date column and the date filter use the day each seller
 * approved the order. Clicking a row opens the purchase's details; its Add to
 * cart button puts the purchase's products back in the cart at today's
 * prices, leaving out products that are unavailable now, and a status line
 * reports what was added. An order a seller approves moves here from Pending
 * Orders.
 *
 * @returns {JSX.Element} The Purchases page.
 */
export default function PurchasesPage() {
  const { query, updateQuery } = useOrderListQuery(PURCHASES_LIST.party);
  const [detailsPurchase, setDetailsPurchase] = useState(null);
  const [reorderMessage, setReorderMessage] = useState("");
  const { addOrderItems } = useCart();
  const { orders } = useOrders();
  const purchases = selectPurchasesOf(orders, CURRENT_USER.id);
  const shownPurchases = searchOrders(purchases, query, PURCHASES_LIST);

  const addToCartAction = {
    label: "Add to cart",
    describe: (purchase) => `the products of order ${purchase.id}`,
    tone: "primary",
    onSelect: (purchase) => setReorderMessage(describeReorder(purchase, addOrderItems(purchase.items))),
  };

  return (
    <div className={styles.page}>
      <PageTitle title="Purchases" visuallyHidden />
      <OrderListControls query={query} onChange={updateQuery} list={PURCHASES_LIST} />
      <OrderCountSummary
        shownCount={shownPurchases.length}
        totalCount={purchases.length}
        singular="purchase"
        plural="purchases"
      />
      <p role="status" className={reorderMessage ? styles.notice : "visually-hidden"}>
        {reorderMessage}
      </p>
      {shownPurchases.length > 0 ? (
        <OrdersTable
          orders={shownPurchases}
          caption="Orders the sellers accepted"
          list={PURCHASES_LIST}
          action={addToCartAction}
          onOpenDetails={setDetailsPurchase}
        />
      ) : (
        <NoOrdersMessage
          title="No purchases match your filters."
          text="Try other filters, or clear them to see every purchase."
          onClearFilters={() => updateQuery(NO_ORDER_FILTERS)}
        />
      )}
      <OrderDetailsDialog
        order={detailsPurchase}
        party={PURCHASES_LIST.party}
        onClose={() => setDetailsPurchase(null)}
      />
    </div>
  );
}
