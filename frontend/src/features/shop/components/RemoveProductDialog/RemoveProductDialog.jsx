/**
 * @file Window that asks the seller to confirm removing a product from the store.
 */

import Button from "@/components/Button/Button.jsx";
import Dialog from "@/components/Dialog/Dialog.jsx";

/**
 * Renders the confirmation window; it is open while a product is given, on top of the Edit product window.
 *
 * Closing the window in any other way, such as with Escape, keeps the product.
 *
 * @param {object} props - Dialog props.
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct | null} props.product - Product to remove, or null when the window is closed.
 * @param {function(): void} props.onKeep - Called when the seller keeps the product.
 * @param {function(import("@/features/shop/sampleShopProducts.js").ShopProduct): void} props.onConfirm - Called with the product when the seller confirms the removal.
 * @returns {JSX.Element} The confirmation window.
 */
export default function RemoveProductDialog({ product, onKeep, onConfirm }) {
  const actions = (
    <>
      <Button variant="secondary" onClick={onKeep}>
        Keep product
      </Button>
      <Button variant="danger" onClick={() => onConfirm(product)}>
        Remove product
      </Button>
    </>
  );

  return (
    <Dialog isOpen={product !== null} title="Remove this product?" onClose={onKeep} actions={actions}>
      {product && (
        <p>
          Are you sure you want to remove <strong>{product.title}</strong> ({product.id}) from your store? Buyers will
          no longer see it, and this can&apos;t be undone.
        </p>
      )}
    </Dialog>
  );
}
