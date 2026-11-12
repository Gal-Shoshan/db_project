/**
 * @file Table of orders, one row per order with its date, price and the person the list names, and an optional action button in each row.
 */

import { formatOrderDate } from "@/features/orders/orderDates.js";
import { formatCurrency } from "@/utils/formatters.js";
import styles from "./OrdersTable.module.css";

/**
 * The button shown in every row, for example Cancel on Pending Orders or Add to cart on Purchases.
 *
 * @typedef {object} OrderRowAction
 * @property {string} label - Visible button text, for example "Cancel".
 * @property {function(object): string} describe - Rest of the accessible name, read after the label, for example "order ORD-1037".
 * @property {"danger" | "primary"} tone - Color of the button: red for an action that removes something, blue otherwise.
 * @property {function(object): void} onSelect - Called with the row's order when the button is pressed.
 */

/**
 * Renders the row's action button, which runs its action without also opening the order's details.
 *
 * @param {object} props - Button props.
 * @param {object} props.order - The row's order.
 * @param {OrderRowAction} props.action - The action.
 * @returns {JSX.Element} The button.
 */
function RowActionButton({ order, action }) {
  /**
   * Runs the action and stops the click before it reaches the row.
   *
   * @param {import("react").MouseEvent<HTMLButtonElement>} event - The click on the button.
   */
  const selectAction = (event) => {
    event.stopPropagation();
    action.onSelect(order);
  };

  return (
    <button type="button" className={`${styles.actionButton} ${styles[action.tone]}`} onClick={selectAction}>
      {action.label} <span className="visually-hidden">{action.describe(order)}</span>
    </button>
  );
}

/**
 * Renders one order: its date, price and person, and the row's action button when the list has one.
 *
 * Clicking anywhere in the row except the action button opens the order's
 * details. The date is a button so that keyboard and screen reader users can
 * open them too; its click reaches the row's handler.
 *
 * @param {object} props - Row props.
 * @param {object} props.order - The order.
 * @param {import("@/features/orders/orderLists.js").OrderList} props.list - How the list shows its orders: its date and person.
 * @param {OrderRowAction | undefined} props.action - The row's action button, if the list has one.
 * @param {function(object): void} props.onOpenDetails - Called with the order when the row is clicked.
 * @returns {JSX.Element} The table row.
 */
function OrderRow({ order, list, action, onOpenDetails }) {
  return (
    <tr className={styles.row} onClick={() => onOpenDetails(order)}>
      <th scope="row" className={styles.dateCell}>
        <button type="button" className={styles.detailsButton}>
          {formatOrderDate(order[list.dateField])}
          <span className="visually-hidden">, view details of order {order.id}</span>
        </button>
      </th>
      <td className={styles.number}>{formatCurrency(order.price)}</td>
      <td>{order[list.party.nameField]}</td>
      {action && (
        <td className={styles.actionCell}>
          <RowActionButton order={order} action={action} />
        </td>
      )}
    </tr>
  );
}

/**
 * Renders the orders table with Date, Price and person columns, and an action column when the list has an action.
 *
 * @param {object} props - Table props.
 * @param {ReadonlyArray<object>} props.orders - Orders in display order.
 * @param {string} props.caption - Name of the table for screen readers.
 * @param {import("@/features/orders/orderLists.js").OrderList} props.list - How the list shows its orders: its date and person.
 * @param {OrderRowAction} [props.action] - The button shown in every row; without it the table has no action column.
 * @param {function(object): void} props.onOpenDetails - Called with an order when its row is clicked.
 * @returns {JSX.Element} The table.
 */
export default function OrdersTable({ orders, caption, list, action, onOpenDetails }) {
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col" className={styles.number}>
              Price
            </th>
            <th scope="col">{list.party.columnLabel}</th>
            {action && (
              <th scope="col" className={styles.actionCell}>
                <span className="visually-hidden">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} list={list} action={action} onOpenDetails={onOpenDetails} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
