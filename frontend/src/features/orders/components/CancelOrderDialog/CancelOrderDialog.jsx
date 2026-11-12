/**
 * @file Window that asks the user to confirm cancelling a pending order.
 */

import Button from "@/components/Button/Button.jsx";
import Dialog from "@/components/Dialog/Dialog.jsx";
import { formatOrderDate } from "@/features/orders/orderDates.js";
import { formatCurrency } from "@/utils/formatters.js";

/**
 * Renders the confirmation window; it is open while an order is given.
 *
 * Closing the window in any other way, such as with Escape, keeps the order.
 *
 * @param {object} props - Dialog props.
 * @param {import("@/features/orders/orderSelectors.js").Order | null} props.order - Order to cancel, or null when the window is closed.
 * @param {function(): void} props.onKeep - Called when the user keeps the order.
 * @param {function(object): void} props.onConfirm - Called with the order when the user confirms the cancellation.
 * @returns {JSX.Element} The confirmation window.
 */
export default function CancelOrderDialog({ order, onKeep, onConfirm }) {
  const actions = (
    <>
      <Button variant="secondary" onClick={onKeep}>
        Keep order
      </Button>
      <Button variant="danger" onClick={() => onConfirm(order)}>
        Cancel order
      </Button>
    </>
  );

  return (
    <Dialog isOpen={order !== null} title="Cancel this order?" onClose={onKeep} actions={actions}>
      {order && (
        <p>
          Your order {order.id} from <strong>{order.seller}</strong>, placed on {formatOrderDate(order.placedAt)} for{" "}
          {formatCurrency(order.price)}, will be cancelled. This can&apos;t be undone.
        </p>
      )}
    </Dialog>
  );
}
