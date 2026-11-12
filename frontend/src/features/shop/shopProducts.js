/**
 * @file Rules for the shop's products: the limits of each value, product codes, and building or editing a product.
 */

import { FREE_DELIVERY_MIN_PRICE } from "@/features/catalog/catalogConfig.js";
import { CURRENT_USER } from "@/features/users/users.js";

/** Most characters in a product name. */
export const MAX_TITLE_LENGTH = 120;

/** Most characters in a brand. */
export const MAX_BRAND_LENGTH = 60;

/** Highest price of a product, in dollars. */
export const MAX_PRICE = 100_000;

/** Most units of a product in stock. */
export const MAX_STOCK = 9_999;

const PRODUCT_CODE_PREFIX = "S";
const PRODUCT_CODE_DIGITS = 4;

/**
 * The values a seller can change on a product.
 *
 * @typedef {object} ProductChanges
 * @property {string} title - New product name, already trimmed.
 * @property {number} price - New price in dollars.
 * @property {number} stock - New number of units in stock; 0 makes the product unavailable.
 */

/**
 * The values a seller gives a new product.
 *
 * @typedef {object} NewProductValues
 * @property {string} title - Product name, already trimmed.
 * @property {string} brand - Brand, already trimmed.
 * @property {string} category - Category id from CATEGORIES.
 * @property {number} price - Price in dollars.
 * @property {number} stock - Number of units in stock; 0 makes the product unavailable.
 */

/**
 * Returns the shop's product code for a running number.
 *
 * @param {number} productNumber - Running number of the product, from 1.
 * @returns {string} The product code, for example "S0001".
 */
export function formatShopProductId(productNumber) {
  return `${PRODUCT_CODE_PREFIX}${String(productNumber).padStart(PRODUCT_CODE_DIGITS, "0")}`;
}

/**
 * Returns the running number after the highest product code in a list.
 *
 * @param {ReadonlyArray<{id: string}>} products - Products with codes such as "S0024".
 * @returns {number} The next free running number; 1 for an empty list.
 */
export function getNextShopProductNumber(products) {
  const productNumbers = products.map((product) => Number(product.id.slice(PRODUCT_CODE_PREFIX.length)));
  return Math.max(0, ...productNumbers) + 1;
}

/**
 * Returns the fields that follow from a price and a stock: availability and free delivery.
 *
 * @param {number} price - Price in dollars.
 * @param {number} stock - Number of units in stock.
 * @returns {{inStock: boolean, freeDelivery: boolean}} The derived fields.
 */
function deriveFromPriceAndStock(price, stock) {
  return { inStock: stock > 0, freeDelivery: price >= FREE_DELIVERY_MIN_PRICE };
}

/**
 * Returns the product with a new name, price and stock, and the fields that follow from them.
 *
 * A stock of 0 makes the product unavailable. Free delivery follows the new
 * price. A list price that is no longer above the new price is dropped,
 * because it would no longer show a discount.
 *
 * @param {import("./sampleShopProducts.js").ShopProduct} product - The product before the change.
 * @param {ProductChanges} changes - The new values.
 * @returns {import("./sampleShopProducts.js").ShopProduct} The changed product.
 */
export function applyProductEdit(product, { title, price, stock }) {
  const isStillDiscounted = product.listPrice !== null && product.listPrice > price;
  return {
    ...product,
    title,
    price,
    stock,
    ...deriveFromPriceAndStock(price, stock),
    listPrice: isStillDiscounted ? product.listPrice : null,
  };
}

/**
 * Builds a new product of the user's shop: no discount and no ratings yet, added today.
 *
 * @param {NewProductValues} values - The values the seller gave.
 * @param {{id: string, featuredRank: number}} placement - The product's code and its position in the featured order.
 * @returns {import("./sampleShopProducts.js").ShopProduct} The new product.
 */
export function createNewShopProduct({ title, brand, category, price, stock }, { id, featuredRank }) {
  return {
    id,
    title,
    brand,
    sellerId: CURRENT_USER.id,
    category,
    price,
    listPrice: null,
    rating: 0,
    reviewCount: 0,
    stock,
    ...deriveFromPriceAndStock(price, stock),
    daysSinceAdded: 0,
    featuredRank,
  };
}
