/**
 * @file Window in the center of the screen with the form that adds a new product to the seller's store.
 */

import { useId, useState } from "react";
import Button from "@/components/Button/Button.jsx";
import Dialog from "@/components/Dialog/Dialog.jsx";
import { focusFirstInvalidField } from "@/features/shop/components/ProductFields/focusFirstInvalidField.js";
import {
  BrandField,
  CategoryField,
  NameField,
  PriceField,
  StockField,
} from "@/features/shop/components/ProductFields/ProductFields.jsx";
import { validateNewProduct } from "@/features/shop/validateProductForm.js";
import { useFormFields } from "@/hooks/useFormFields.js";
import styles from "./NewProductDialog.module.css";

const EMPTY_VALUES = Object.freeze({ title: "", brand: "", category: "", price: "", stock: "" });
const FIELD_ORDER = Object.freeze(["title", "brand", "category", "price", "stock"]);

/**
 * Renders the empty New product form: name, brand, category, price and quantity in stock.
 *
 * The form is submitted by the window's "Add to the store" button. Invalid
 * values show their errors under the fields, and focus moves to the first
 * invalid field.
 *
 * @param {object} props - Form props.
 * @param {string} props.id - Element id of the form, which the window's button submits.
 * @param {function(import("@/features/shop/shopProducts.js").NewProductValues): void} props.onCreate - Called with the new product's valid values.
 * @returns {JSX.Element} The form.
 */
function NewProductForm({ id, onCreate }) {
  const [values, handleChange] = useFormFields(EMPTY_VALUES);
  const [errors, setErrors] = useState({});

  /**
   * Checks the values; creates the product when valid, and otherwise shows the errors and focuses the first invalid field.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Submit event of the form.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateNewProduct(values);
    setErrors(result.errors);
    if (result.product) {
      onCreate(result.product);
      return;
    }
    focusFirstInvalidField(event.currentTarget, result.errors, FIELD_ORDER);
  };

  return (
    <form id={id} noValidate className={styles.form} onSubmit={handleSubmit}>
      <NameField value={values.title} error={errors.title} onChange={handleChange} />
      <BrandField value={values.brand} error={errors.brand} onChange={handleChange} />
      <CategoryField value={values.category} error={errors.category} onChange={handleChange} />
      <PriceField value={values.price} error={errors.price} onChange={handleChange} />
      <StockField value={values.stock} error={errors.stock} onChange={handleChange} />
    </form>
  );
}

/**
 * Renders the New product window; its form starts empty each time the window opens.
 *
 * "Add to the store" creates the product and closes the window. Escape and
 * the close button close it without creating anything.
 *
 * @param {object} props - Dialog props.
 * @param {boolean} props.isOpen - Whether the window is shown.
 * @param {function(): void} props.onClose - Called when the window closes without creating a product.
 * @param {function(import("@/features/shop/shopProducts.js").NewProductValues): void} props.onCreate - Called with the new product's valid values.
 * @returns {JSX.Element} The New product window.
 */
export default function NewProductDialog({ isOpen, onClose, onCreate }) {
  const formId = useId();
  const actions = (
    <Button type="submit" form={formId}>
      Add to the store
    </Button>
  );

  return (
    <Dialog isOpen={isOpen} title="New product" onClose={onClose} actions={actions}>
      {isOpen && <NewProductForm id={formId} onCreate={onCreate} />}
    </Dialog>
  );
}
