/**
 * @file Window that shows a shop product's details and lets the seller change its name, price and quantity in stock, or remove it.
 */

import { useId, useState } from "react";
import Button from "@/components/Button/Button.jsx";
import Dialog from "@/components/Dialog/Dialog.jsx";
import { CATEGORIES } from "@/features/catalog/catalogConfig.js";
import { focusFirstInvalidField } from "@/features/shop/components/ProductFields/focusFirstInvalidField.js";
import { NameField, PriceField, StockField } from "@/features/shop/components/ProductFields/ProductFields.jsx";
import { validateProductEdit } from "@/features/shop/validateProductForm.js";
import { useFormFields } from "@/hooks/useFormFields.js";
import { formatCount } from "@/utils/formatters.js";
import styles from "./EditProductDialog.module.css";

const CATEGORY_LABELS = new Map(CATEGORIES.map((category) => [category.id, category.label]));
const WHOLE_NUMBER_PATTERN = /^\d+$/;
const FIELD_ORDER = Object.freeze(["title", "price", "stock"]);

/**
 * Returns whether the product would be available with the quantity typed so far.
 *
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} product - The product being edited.
 * @param {string} stockText - The quantity field's text.
 * @returns {boolean} False when the typed quantity is 0; the product's current state while the text is not a whole number.
 */
function isAvailableWithStock(product, stockText) {
  const trimmedStock = stockText.trim();
  return WHOLE_NUMBER_PATTERN.test(trimmedStock) ? Number(trimmedStock) > 0 : product.inStock;
}

/**
 * Returns the customer rating as text, for example "4.3 out of 5 (1,234 ratings)".
 *
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} product - The product.
 * @returns {string} The rating text, or "No ratings yet" for a product nobody rated.
 */
function describeRating(product) {
  if (product.reviewCount === 0) {
    return "No ratings yet";
  }
  return `${product.rating} out of 5 (${formatCount(product.reviewCount)} ratings)`;
}

/**
 * Renders the facts the seller cannot change here: product code, category, brand and rating, and the availability.
 *
 * @param {object} props - Facts props.
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} props.product - The product.
 * @param {boolean} props.isAvailable - Whether the product is available with the quantity typed so far.
 * @returns {JSX.Element} The facts.
 */
function ProductFacts({ product, isAvailable }) {
  return (
    <dl className={styles.facts}>
      <div className={styles.fact}>
        <dt>Product code</dt>
        <dd>{product.id}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Category</dt>
        <dd>{CATEGORY_LABELS.get(product.category)}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Brand</dt>
        <dd>{product.brand}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Customer rating</dt>
        <dd>{describeRating(product)}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Status</dt>
        <dd aria-live="polite">
          <span className={isAvailable ? styles.available : styles.unavailable}>
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </dd>
      </div>
    </dl>
  );
}

/**
 * Renders the product's facts and the form with its name, price and quantity in stock.
 *
 * The form is submitted by the window's Update button. Invalid values show
 * their errors under the fields, and focus moves to the first invalid field.
 *
 * @param {object} props - Form props.
 * @param {string} props.id - Element id of the form, which the Update button submits.
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct} props.product - The product being edited.
 * @param {function(import("@/features/shop/sampleShopProducts.js").ShopProduct, import("@/features/shop/shopProducts.js").ProductChanges): void} props.onSave
 *   Called with the product and its valid new values.
 * @returns {JSX.Element} The facts and the form.
 */
function EditProductForm({ id, product, onSave }) {
  const [values, handleChange] = useFormFields({
    title: product.title,
    price: product.price.toFixed(2),
    stock: String(product.stock),
  });
  const [errors, setErrors] = useState({});

  /**
   * Checks the values; saves them when valid, and otherwise shows the errors and focuses the first invalid field.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Submit event of the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateProductEdit(values);
    setErrors(result.errors);
    if (result.changes) {
      onSave(product, result.changes);
      return;
    }
    focusFirstInvalidField(event.currentTarget, result.errors, FIELD_ORDER);
  };

  return (
    <>
      <ProductFacts product={product} isAvailable={isAvailableWithStock(product, values.stock)} />
      <form id={id} noValidate className={styles.form} onSubmit={handleSubmit}>
        <NameField value={values.title} error={errors.title} onChange={handleChange} />
        <PriceField value={values.price} error={errors.price} onChange={handleChange} />
        <StockField value={values.stock} error={errors.stock} onChange={handleChange} />
      </form>
    </>
  );
}

/**
 * Renders the trash button that asks to remove the product from the store.
 *
 * @param {object} props - Button props.
 * @param {function(): void} props.onClick - Called when the button is pressed.
 * @returns {JSX.Element} The button.
 */
function RemoveButton({ onClick }) {
  return (
    <button
      type="button"
      className={styles.removeButton}
      aria-label="Remove from store"
      title="Remove from store"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className={styles.trashIcon} aria-hidden="true">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
      </svg>
    </button>
  );
}

/**
 * Renders the Edit product window; it is open while a product is given.
 *
 * Update saves the changes and closes the window. The trash button asks to
 * remove the product; the page confirms before removing it. Escape and the
 * close button close the window without saving.
 *
 * @param {object} props - Dialog props.
 * @param {import("@/features/shop/sampleShopProducts.js").ShopProduct | null} props.product - Product to edit, or null when the window is closed.
 * @param {function(): void} props.onClose - Called when the window closes without saving.
 * @param {function(import("@/features/shop/sampleShopProducts.js").ShopProduct, import("@/features/shop/shopProducts.js").ProductChanges): void} props.onSave
 *   Called with the product and its valid new values when Update is pressed.
 * @param {function(import("@/features/shop/sampleShopProducts.js").ShopProduct): void} props.onRemove - Called with the product when the trash button is pressed.
 * @returns {JSX.Element} The Edit product window.
 */
export default function EditProductDialog({ product, onClose, onSave, onRemove }) {
  const formId = useId();
  const actions = (
    <>
      <Button type="submit" form={formId}>
        Update
      </Button>
      <RemoveButton onClick={() => onRemove(product)} />
    </>
  );

  return (
    <Dialog isOpen={product !== null} title="Edit product" onClose={onClose} actions={actions}>
      {product && <EditProductForm key={product.id} id={formId} product={product} onSave={onSave} />}
    </Dialog>
  );
}
