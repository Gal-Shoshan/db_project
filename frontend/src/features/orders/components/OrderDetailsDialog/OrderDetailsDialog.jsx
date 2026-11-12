/**
 * @file Window that shows the full details of one order, pending or approved, with optional buttons such as Approve.
 */

import Dialog from "@/components/Dialog/Dialog.jsx";
import { formatOrderDateTime } from "@/features/orders/orderDates.js";
import { getLineTotal } from "@/features/orders/orderItems.js";
import { APPROVED_STATUS_LABEL, PENDING_STATUS_LABEL } from "@/features/orders/ordersConfig.js";
import { formatCurrency } from "@/utils/formatters.js";
import styles from "./OrderDetailsDialog.module.css";

/**
 * Renders the order number, when it was placed and approved, the person the list names and the status as a list of facts.
 *
 * @param {object} props - Facts props.
 * @param {import("@/features/orders/orderSelectors.js").Order} props.order - The order; it is approved when it has an approval date.
 * @param {import("@/features/orders/orderLists.js").OrderParty} props.party - The person to show: the seller or the buyer.
 * @returns {JSX.Element} The order facts.
 */
function OrderFacts({ order, party }) {
  const isApproved = Boolean(order.approvedAt);

  return (
    <dl className={styles.facts}>
      <div className={styles.fact}>
        <dt>Order number</dt>
        <dd>{order.id}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Order date</dt>
        <dd>{formatOrderDateTime(order.placedAt)}</dd>
      </div>
      {isApproved && (
        <div className={styles.fact}>
          <dt>Date approved</dt>
          <dd>{formatOrderDateTime(order.approvedAt)}</dd>
        </div>
      )}
      <div className={styles.fact}>
        <dt>{party.columnLabel}</dt>
        <dd>{order[party.nameField]}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Status</dt>
        <dd>
          <span className={isApproved ? styles.approvedStatus : styles.status}>
            {isApproved ? APPROVED_STATUS_LABEL : PENDING_STATUS_LABEL}
          </span>
        </dd>
      </div>
    </dl>
  );
}

/**
 * Renders the ordered products with their quantities and prices, and the order total.
 *
 * @param {object} props - Items props.
 * @param {{items: import("@/features/orders/orderItems.js").OrderItem[], price: number}} props.order - The order.
 * @returns {JSX.Element} The items table.
 */
function OrderItems({ order }) {
  return (
    <table className={styles.items}>
      <caption className={styles.itemsCaption}>Items</caption>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col" className={styles.number}>
            Quantity
          </th>
          <th scope="col" className={styles.number}>
            Price
          </th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((item) => (
          <tr key={item.productId}>
            <th scope="row" className={styles.product}>
              {item.title}
              <span className={styles.unitPrice}>{formatCurrency(item.unitPrice)} each</span>
            </th>
            <td className={styles.number}>{item.quantity}</td>
            <td className={styles.number}>{formatCurrency(getLineTotal(item))}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            Order total
          </th>
          <td className={styles.number}>{formatCurrency(order.price)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

/**
 * Renders the order details window; it is open while an order is given.
 *
 * @param {object} props - Dialog props.
 * @param {import("@/features/orders/orderSelectors.js").Order | null} props.order - Order to show, or null when the window is closed.
 * @param {import("@/features/orders/orderLists.js").OrderParty} props.party - The person to show: the seller or the buyer.
 * @param {function(): void} props.onClose - Called after the window closes, by any means.
 * @param {import("react").ReactNode} [props.actions] - Buttons at the bottom of the window, for example Close and Approve.
 * @returns {JSX.Element} The order details window.
 */
export default function OrderDetailsDialog({ order, party, onClose, actions }) {
  return (
    <Dialog isOpen={order !== null} title="Order details" onClose={onClose} actions={actions}>
      {order && (
        <>
          <OrderFacts order={order} party={party} />
          <OrderItems order={order} />
        </>
      )}
    </Dialog>
  );
}
