/**
 * @file Checks of the Edit product and New product forms, which turn their text values into a product's values.
 */

import { CATEGORIES } from "@/features/catalog/catalogConfig.js";
import { formatCount, formatWholeCurrency } from "@/utils/formatters.js";
import { MAX_BRAND_LENGTH, MAX_PRICE, MAX_STOCK, MAX_TITLE_LENGTH } from "./shopProducts.js";

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;
const CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id));

/** Error shown when the name is empty. */
export const MISSING_TITLE_MESSAGE = "Enter a product name.";

/** Error shown when the name is too long. */
export const LONG_TITLE_MESSAGE = `Use at most ${MAX_TITLE_LENGTH} characters.`;

/** Error shown when the brand is empty. */
export const MISSING_BRAND_MESSAGE = "Enter a brand.";

/** Error shown when the brand is too long. */
export const LONG_BRAND_MESSAGE = `Use at most ${MAX_BRAND_LENGTH} characters.`;

/** Error shown when no category is chosen. */
export const MISSING_CATEGORY_MESSAGE = "Choose a category.";

/** Error shown when the price is not an amount of dollars with at most two decimals. */
export const PRICE_FORMAT_MESSAGE = "Enter a price in dollars, such as 24.99.";

/** Error shown when the price is 0 or above MAX_PRICE. */
export const PRICE_RANGE_MESSAGE = `Enter a price above $0 and up to ${formatWholeCurrency(MAX_PRICE)}.`;

/** Error shown when the quantity is not a whole number from 0 to MAX_STOCK. */
export const STOCK_MESSAGE = `Enter a whole number of units from 0 to ${formatCount(MAX_STOCK)}.`;

/**
 * Returns the error of a trimmed text that must not be empty or too long, or null when it is valid.
 *
 * @param {string} text - The trimmed text.
 * @param {{maxLength: number, missingMessage: string, longMessage: string}} rule - The length limit and its messages.
 * @returns {string | null} The error message.
 */
function checkRequiredText(text, { maxLength, missingMessage, longMessage }) {
  if (text === "") {
    return missingMessage;
  }
  return text.length > maxLength ? longMessage : null;
}

/**
 * Returns the error of a trimmed price text, or null when it is valid.
 *
 * @param {string} price - The trimmed price text, for example "24.99".
 * @returns {string | null} The error message.
 */
function checkPrice(price) {
  if (!PRICE_PATTERN.test(price)) {
    return PRICE_FORMAT_MESSAGE;
  }
  const amount = Number(price);
  return amount > 0 && amount <= MAX_PRICE ? null : PRICE_RANGE_MESSAGE;
}

/**
 * Returns the error of a trimmed quantity text, or null when it is valid.
 *
 * @param {string} stock - The trimmed quantity text, for example "12".
 * @returns {string | null} The error message.
 */
function checkStock(stock) {
  return WHOLE_NUMBER_PATTERN.test(stock) && Number(stock) <= MAX_STOCK ? null : STOCK_MESSAGE;
}

/**
 * Returns the errors of the fields that have one, keyed by field name.
 *
 * @param {Record<string, string | null>} fieldErrors - Each field's error, or null when it is valid.
 * @returns {Record<string, string>} The error of each invalid field.
 */
function keepErrors(fieldErrors) {
  return Object.fromEntries(Object.entries(fieldErrors).filter(([, message]) => message !== null));
}

/**
 * Returns the errors of the fields that both forms have: name, price and quantity in stock.
 *
 * @param {{title: string, price: string, stock: string}} trimmed - The trimmed field texts.
 * @returns {Record<string, string | null>} Each field's error, or null when it is valid.
 */
function checkSharedFields({ title, price, stock }) {
  return {
    title: checkRequiredText(title, {
      maxLength: MAX_TITLE_LENGTH,
      missingMessage: MISSING_TITLE_MESSAGE,
      longMessage: LONG_TITLE_MESSAGE,
    }),
    price: checkPrice(price),
    stock: checkStock(stock),
  };
}

/**
 * Returns the Edit product form's errors and, when there are none, the product's new values.
 *
 * @param {{title: string, price: string, stock: string}} values - Text of each field, as typed.
 * @returns {{errors: Record<string, string>, changes: import("./shopProducts.js").ProductChanges | null}}
 *   The error message of each invalid field, and the new values, or null while any field is invalid.
 */
export function validateProductEdit(values) {
  const title = values.title.trim();
  const price = values.price.trim();
  const stock = values.stock.trim();
  const errors = keepErrors(checkSharedFields({ title, price, stock }));

  if (Object.keys(errors).length > 0) {
    return { errors, changes: null };
  }
  return { errors, changes: { title, price: Number(price), stock: Number(stock) } };
}

/**
 * Returns the New product form's errors and, when there are none, the new product's values.
 *
 * @param {{title: string, brand: string, category: string, price: string, stock: string}} values - Text of each field, as typed; category is a category id, or empty when none is chosen.
 * @returns {{errors: Record<string, string>, product: import("./shopProducts.js").NewProductValues | null}}
 *   The error message of each invalid field, and the product's values, or null while any field is invalid.
 */
export function validateNewProduct(values) {
  const title = values.title.trim();
  const brand = values.brand.trim();
  const price = values.price.trim();
  const stock = values.stock.trim();
  const errors = keepErrors({
    ...checkSharedFields({ title, price, stock }),
    brand: checkRequiredText(brand, {
      maxLength: MAX_BRAND_LENGTH,
      missingMessage: MISSING_BRAND_MESSAGE,
      longMessage: LONG_BRAND_MESSAGE,
    }),
    category: CATEGORY_IDS.has(values.category) ? null : MISSING_CATEGORY_MESSAGE,
  });

  if (Object.keys(errors).length > 0) {
    return { errors, product: null };
  }
  return { errors, product: { title, brand, category: values.category, price: Number(price), stock: Number(stock) } };
}
