/**
 * @file Pending Orders page of the Buy mode: the user's orders that sellers have not approved yet, with filters, sorting and cancelling.
 */

import { useState } from "react";
import PageTitle from "@/components/PageTitle/PageTitle.jsx";
import CancelOrderDialog from "@/features/orders/components/CancelOrderDialog/CancelOrderDialog.jsx";
import NoOrdersMessage from "@/features/orders/components/NoOrdersMessage/NoOrdersMessage.jsx";
import OrderCountSummary from "@/features/orders/components/OrderCountSummary/OrderCountSummary.jsx";
import OrderDetailsDialog from "@/features/orders/components/OrderDetailsDialog/OrderDetailsDialog.jsx";
import OrderListControls from "@/features/orders/components/OrderListControls/OrderListControls.jsx";
import OrderNotice from "@/features/orders/components/OrderNotice/OrderNotice.jsx";
import OrdersTable from "@/features/orders/components/OrdersTable/OrdersTable.jsx";
import { formatOrderDate } from "@/features/orders/orderDates.js";
import { NO_ORDER_FILTERS } from "@/features/orders/orderListQuery.js";
import { PENDING_ORDERS_LIST } from "@/features/orders/orderLists.js";
import { selectPendingOrdersOf } from "@/features/orders/orderSelectors.js";
import { searchOrders } from "@/features/orders/searchOrders.js";
import { useOrderListQuery } from "@/features/orders/useOrderListQuery.js";
import { useOrders } from "@/features/orders/useOrders.js";
import { CURRENT_USER } from "@/features/users/users.js";
import styles from "./PendingOrdersPage.module.css";

/**
 * Returns the notice shown after an order is cancelled.
 *
 * @param {import("@/features/orders/orderSelectors.js").Order} order - The cancelled order.
 * @returns {string} The notice text.
 */
const describeCancellation = (order) =>
  `Your order ${order.id} from ${order.seller}, placed on ${formatOrderDate(order.placedAt)}, was cancelled.`;

/**
 * Renders the Filters and Sort by bar, then the table of the user's pending orders, with windows for an order's details and for cancelling.
 *
 * The filters and sort order live in the URL, so Back and Forward step
 * through them. The Date column and the date filter use the day each order
 * was placed. Clicking a row opens the order's details; its Cancel button
 * asks for confirmation and then deletes the order, which also takes it off
 * the seller's list.
 *
 * @returns {JSX.Element} The Pending Orders page.
 */
export default function PendingOrdersPage() {
  const { query, updateQuery } = useOrderListQuery(PENDING_ORDERS_LIST.party);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [notice, setNotice] = useState(null);
  const { orders, removeOrder } = useOrders();
  const pendingOrders = selectPendingOrdersOf(orders, CURRENT_USER.id);
  const shownOrders = searchOrders(pendingOrders, query, PENDING_ORDERS_LIST);

  /**
   * Cancels the order the user confirmed, closes the confirmation and reports the cancellation.
   *
   * @param {import("@/features/orders/orderSelectors.js").Order} order - The order to cancel.
   */
  const confirmCancel = (order) => {
    removeOrder(order.id);
    setOrderToCancel(null);
    setNotice(describeCancellation(order));
  };

  const cancelAction = {
    label: "Cancel",
    describe: (order) => `order ${order.id}`,
    tone: "danger",
    onSelect: setOrderToCancel,
  };

  return (
    <div className={styles.page}>
      <PageTitle title="Pending Orders" visuallyHidden />
      <OrderListControls query={query} onChange={updateQuery} list={PENDING_ORDERS_LIST} />
      <OrderCountSummary
        shownCount={shownOrders.length}
        totalCount={pendingOrders.length}
        singular="pending order"
        plural="pending orders"
      />
      <OrderNotice message={notice} />
      {shownOrders.length > 0 && (
        <OrdersTable
          orders={shownOrders}
          caption="Orders waiting for the seller to accept them"
          list={PENDING_ORDERS_LIST}
          action={cancelAction}
          onOpenDetails={setDetailsOrder}
        />
      )}
      {shownOrders.length === 0 && pendingOrders.length === 0 && (
        <NoOrdersMessage
          title="You have no pending orders."
          text="Orders you place stay here until the seller accepts them."
        />
      )}
      {shownOrders.length === 0 && pendingOrders.length > 0 && (
        <NoOrdersMessage
          title="No pending orders match your filters."
          text="Try other filters, or clear them to see every pending order."
          onClearFilters={() => updateQuery(NO_ORDER_FILTERS)}
        />
      )}
      <OrderDetailsDialog
        order={detailsOrder}
        party={PENDING_ORDERS_LIST.party}
        onClose={() => setDetailsOrder(null)}
      />
      <CancelOrderDialog order={orderToCancel} onKeep={() => setOrderToCancel(null)} onConfirm={confirmCancel} />
    </div>
  );
}
