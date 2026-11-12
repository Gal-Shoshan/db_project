/**
 * @file Sample products of the signed-in user's shop, used until the shop's products come from a server.
 *
 * The shop sells copies of every CATALOG_STRIDE-th catalog product under its
 * own product codes, each with a seeded pseudo-random quantity in stock, so
 * the list is the same on every load and in every test. Some products start
 * with a quantity of 0, which makes them unavailable.
 */

import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";
import { CURRENT_USER } from "@/features/users/users.js";
import { createSeededRandom, randomInteger } from "@/utils/seededRandom.js";
import { formatShopProductId } from "./shopProducts.js";

/**
 * A product of the user's shop: a catalog product with the number of units in stock.
 *
 * Its inStock field is true exactly when stock is above 0.
 *
 * @typedef {import("@/features/catalog/sampleProducts.js").Product & {stock: number}} ShopProduct
 */

/** Number of products the user's shop sells. */
export const SAMPLE_SHOP_PRODUCT_COUNT = 24;

/** Most units of one product in stock in the sample shop. */
export const MAX_SAMPLE_STOCK = 40;

const CATALOG_STRIDE = 9;
const RANDOM_SEED = 20261112;
const OUT_OF_STOCK_SHARE = 0.15;

/**
 * Builds one shop product from a catalog product, with the shop's code and a random stock.
 *
 * @param {function(): number} random - Random number generator.
 * @param {number} index - Position of the product in the shop.
 * @returns {ShopProduct} The product.
 */
function createShopProduct(random, index) {
  const catalogProduct = SAMPLE_PRODUCTS[index * CATALOG_STRIDE];
  const stock = random() < OUT_OF_STOCK_SHARE ? 0 : randomInteger(random, 1, MAX_SAMPLE_STOCK);

  return Object.freeze({
    ...catalogProduct,
    id: formatShopProductId(index + 1),
    sellerId: CURRENT_USER.id,
    stock,
    inStock: stock > 0,
    featuredRank: index,
  });
}

/**
 * Builds the shop's products from the fixed seed.
 *
 * @returns {ReadonlyArray<ShopProduct>} The products, in featured order.
 */
function buildSampleShopProducts() {
  const random = createSeededRandom(RANDOM_SEED);
  const products = Array.from({ length: SAMPLE_SHOP_PRODUCT_COUNT }, (_, index) => createShopProduct(random, index));
  return Object.freeze(products);
}

/**
 * The products of the user's shop, with codes such as "S0001", in featured order.
 *
 * @type {ReadonlyArray<ShopProduct>}
 */
export const SAMPLE_SHOP_PRODUCTS = buildSampleShopProducts();
