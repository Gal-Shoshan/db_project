/**
 * @file Fields of the Edit product and New product forms, so both forms label and explain each value the same way.
 */

import FormField from "@/components/FormField/FormField.jsx";
import SelectField from "@/components/SelectField/SelectField.jsx";
import { CATEGORIES } from "@/features/catalog/catalogConfig.js";

/**
 * Props every product field takes.
 *
 * @typedef {object} ProductFieldProps
 * @property {string} value - The field's text.
 * @property {string} [error] - Error message shown under the field.
 * @property {function(import("react").ChangeEvent<HTMLInputElement | HTMLSelectElement>): void} onChange - Called when the text changes.
 */

/**
 * Renders the product name field.
 *
 * @param {ProductFieldProps} props - Field props.
 * @returns {JSX.Element} The field.
 */
export function NameField({ value, error, onChange }) {
  return <FormField label="Name" name="title" value={value} error={error} onChange={onChange} autoComplete="off" />;
}

/**
 * Renders the brand field.
 *
 * @param {ProductFieldProps} props - Field props.
 * @returns {JSX.Element} The field.
 */
export function BrandField({ value, error, onChange }) {
  return <FormField label="Brand" name="brand" value={value} error={error} onChange={onChange} autoComplete="off" />;
}

/**
 * Renders the category drop-down list.
 *
 * @param {ProductFieldProps} props - Field props; the value is a category id, or empty when none is chosen.
 * @returns {JSX.Element} The field.
 */
export function CategoryField({ value, error, onChange }) {
  return (
    <SelectField
      label="Category"
      name="category"
      placeholder="Choose a category"
      options={CATEGORIES}
      value={value}
      error={error}
      onChange={onChange}
    />
  );
}

/**
 * Renders the price field, which opens a decimal keypad on phones.
 *
 * @param {ProductFieldProps} props - Field props.
 * @returns {JSX.Element} The field.
 */
export function PriceField({ value, error, onChange }) {
  return (
    <FormField
      label="Price (USD)"
      name="price"
      inputMode="decimal"
      value={value}
      error={error}
      onChange={onChange}
      autoComplete="off"
    />
  );
}

/**
 * Renders the quantity-in-stock field, with a hint that 0 makes the product unavailable.
 *
 * @param {ProductFieldProps} props - Field props.
 * @returns {JSX.Element} The field.
 */
export function StockField({ value, error, onChange }) {
  return (
    <FormField
      label="Quantity in stock"
      name="stock"
      inputMode="numeric"
      value={value}
      error={error}
      onChange={onChange}
      hint="A quantity of 0 makes the product unavailable to buyers."
      autoComplete="off"
    />
  );
}
