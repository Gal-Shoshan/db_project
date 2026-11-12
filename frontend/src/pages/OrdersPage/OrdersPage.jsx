/**
 * @file Orders page of the Sell mode: orders placed with the user's shop that wait for the user's approval, with filters, sorting, approving and unapproving.
 */

import { useState } from "react";
import Button from "@/components/Button/Button.jsx";
import PageTitle from "@/components/PageTitle/PageTitle.jsx";
import NoOrdersMessage from "@/features/orders/components/NoOrdersMessage/NoOrdersMessage.jsx";
import OrderCountSummary from "@/features/orders/components/OrderCountSummary/OrderCountSummary.jsx";
import OrderDetailsDialog from "@/features/orders/components/OrderDetailsDialog/OrderDetailsDialog.jsx";
import OrderListControls from "@/features/orders/components/OrderListControls/OrderListControls.jsx";
import OrderNotice from "@/features/orders/components/OrderNotice/OrderNotice.jsx";
import OrdersTable from "@/features/orders/components/OrdersTable/OrdersTable.jsx";
import { NO_ORDER_FILTERS } from "@/features/orders/orderListQuery.js";
import { SHOP_ORDERS_LIST } from "@/features/orders/orderLists.js";
import { selectOrdersAwaitingApprovalBy } from "@/features/orders/orderSelectors.js";
import { searchOrders } from "@/features/orders/searchOrders.js";
import { useOrderListQuery } from "@/features/orders/useOrderListQuery.js";
import { useOrders } from "@/features/orders/useOrders.js";
import { CURRENT_USER } from "@/features/users/users.js";
import styles from "./OrdersPage.module.css";

/**
 * Renders the Filters and Sort by bar, then the table of orders waiting for the user's approval, with a details window to decide on each.
 *
 * The filters and sort order live in the URL, so Back and Forward step
 * through them. Clicking a row opens the order's details with three buttons:
 * Close; Approve, which marks the order approved, so it leaves this list and
 * moves to the buyer's Purchases; and Unapprove, which deletes the order, so
 * it leaves this list and the buyer's Pending Orders. A notice then reports
 * what was done.
 *
 * @returns {JSX.Element} The Orders page.
 */
export default function OrdersPage() {
  const { query, updateQuery } = useOrderListQuery(SHOP_ORDERS_LIST.party);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [notice, setNotice] = useState(null);
  const { orders, approveOrder, removeOrder } = useOrders();
  const waitingOrders = selectOrdersAwaitingApprovalBy(orders, CURRENT_USER.id);
  const shownOrders = searchOrders(waitingOrders, query, SHOP_ORDERS_LIST);

  /**
   * Approves the order, closes its details and reports it.
   *
   * @param {import("@/features/orders/orderSelectors.js").Order} order - The order to approve.
   */
  const approve = (order) => {
    approveOrder(order.id);
    setDetailsOrder(null);
    setNotice(`Order ${order.id} from ${order.buyer} was approved. It is now in the buyer's purchases.`);
  };

  /**
   * Deletes the order for the user and the buyer, closes its details and reports it.
   *
   * @param {import("@/features/orders/orderSelectors.js").Order} order - The order to unapprove.
   */
  const unapprove = (order) => {
    removeOrder(order.id);
    setDetailsOrder(null);
    setNotice(`Order ${order.id} from ${order.buyer} was unapproved and deleted from your orders and the buyer's.`);
  };

  const detailsActions = detailsOrder && (
    <>
      <Button variant="secondary" onClick={() => setDetailsOrder(null)}>
        Close
      </Button>
      <Button onClick={() => approve(detailsOrder)}>Approve</Button>
      <Button variant="danger" onClick={() => unapprove(detailsOrder)}>
        Unapprove
      </Button>
    </>
  );

  return (
    <div className={styles.page}>
      <PageTitle title="Orders" visuallyHidden />
      <OrderListControls query={query} onChange={updateQuery} list={SHOP_ORDERS_LIST} />
      <OrderCountSummary
        shownCount={shownOrders.length}
        totalCount={waitingOrders.length}
        singular="order waiting for approval"
        plural="orders waiting for approval"
      />
      <OrderNotice message={notice} />
      {shownOrders.length > 0 && (
        <OrdersTable
          orders={shownOrders}
          caption="Orders waiting for your approval"
          list={SHOP_ORDERS_LIST}
          onOpenDetails={setDetailsOrder}
        />
      )}
      {shownOrders.length === 0 && waitingOrders.length === 0 && (
        <NoOrdersMessage
          title="No orders are waiting for your approval."
          text="New orders from buyers appear here until you approve or unapprove them."
        />
      )}
      {shownOrders.length === 0 && waitingOrders.length > 0 && (
        <NoOrdersMessage
          title="No orders match your filters."
          text="Try other filters, or clear them to see every order waiting for approval."
          onClearFilters={() => updateQuery(NO_ORDER_FILTERS)}
        />
      )}
      <OrderDetailsDialog
        order={detailsOrder}
        party={SHOP_ORDERS_LIST.party}
        onClose={() => setDetailsOrder(null)}
        actions={detailsActions}
      />
    </div>
  );
}
