/**
 * @file Tests for the cart rules: adding products or an earlier order's items, quantities, removing, totals and turning the cart into orders.
 */

import { describe, expect, it } from "vitest";
import {
  EMPTY_CART,
  MAX_QUANTITY_PER_PRODUCT,
  addOrderItemsToCart,
  addProductToCart,
  changeQuantity,
  createOrdersFromCart,
  getCartSummary,
  getQuantityInCart,
  removeFromCart,
} from "./cartLines.js";

/**
 * Builds a test product.
 *
 * @param {string} id - Product code.
 * @param {number} price - Price in dollars.
 * @param {string} sellerId - Seller id.
 * @param {boolean} [inStock=true] - Whether the product can be ordered.
 * @returns {import("@/features/catalog/sampleProducts.js").Product} The product.
 */
const testProduct = (id, price, sellerId, inStock = true) => ({
  id,
  title: `Product ${id}`,
  price,
  sellerId,
  inStock,
});

const LAMP = testProduct("P1", 19.99, "brightside");
const KETTLE = testProduct("P2", 34.5, "harborview");
const MUG = testProduct("P3", 7.25, "brightside");
const SOLD_OUT = testProduct("P4", 12, "brightside", false);
const BUYER = Object.freeze({ id: "me", name: "You" });

/**
 * Adds each product once, in order, to an empty cart.
 *
 * @param {...import("@/features/catalog/sampleProducts.js").Product} products - Products to add.
 * @returns {ReadonlyArray<import("./cartLines.js").CartLine>} The cart lines.
 */
const cartWith = (...products) => products.reduce(addProductToCart, EMPTY_CART);

describe("addProductToCart", () => {
  it("adds a new product as a line with one unit and the order details", () => {
    expect(cartWith(LAMP)).toEqual([
      { productId: "P1", title: "Product P1", unitPrice: 19.99, sellerId: "brightside", quantity: 1 },
    ]);
  });

  it("adds one more unit when the product is already in the cart", () => {
    const lines = cartWith(LAMP, KETTLE, LAMP);
    expect(lines.map((line) => [line.productId, line.quantity])).toEqual([
      ["P1", 2],
      ["P2", 1],
    ]);
  });

  it("does not add out-of-stock products or go past the per-product limit", () => {
    expect(cartWith(SOLD_OUT)).toEqual([]);
    const fullLines = cartWith(...Array.from({ length: MAX_QUANTITY_PER_PRODUCT + 2 }, () => LAMP));
    expect(getQuantityInCart(fullLines, "P1")).toBe(MAX_QUANTITY_PER_PRODUCT);
  });

  it("leaves the given cart unchanged", () => {
    const lines = cartWith(LAMP);
    addProductToCart(lines, LAMP);
    expect(getQuantityInCart(lines, "P1")).toBe(1);
  });
});

describe("changeQuantity and removeFromCart", () => {
  it("changes a quantity, never below 1 or above the limit", () => {
    const lines = cartWith(LAMP, KETTLE);
    expect(getQuantityInCart(changeQuantity(lines, "P1", 3), "P1")).toBe(4);
    expect(getQuantityInCart(changeQuantity(lines, "P1", -1), "P1")).toBe(1);
    expect(getQuantityInCart(changeQuantity(lines, "P1", 50), "P1")).toBe(MAX_QUANTITY_PER_PRODUCT);
    expect(getQuantityInCart(changeQuantity(lines, "P1", 3), "P2")).toBe(1);
  });

  it("removes only the given product", () => {
    expect(removeFromCart(cartWith(LAMP, KETTLE), "P1").map((line) => line.productId)).toEqual(["P2"]);
  });

  it("reports 0 units for a product that is not in the cart", () => {
    expect(getQuantityInCart(cartWith(LAMP), "P9")).toBe(0);
  });
});

describe("getCartSummary", () => {
  it("counts the units and adds up the line totals to the cent", () => {
    expect(getCartSummary(EMPTY_CART)).toEqual({ itemCount: 0, total: 0 });
    const lines = changeQuantity(cartWith(LAMP, KETTLE), "P1", 2);
    expect(getCartSummary(lines)).toEqual({ itemCount: 4, total: 94.47 });
  });
});

describe("createOrdersFromCart", () => {
  it("makes one waiting order per seller from the buyer, in the order the sellers first appear", () => {
    const lines = changeQuantity(cartWith(LAMP, KETTLE, MUG), "P3", 1);
    const orders = createOrdersFromCart(lines, "2026-11-12T10:00:00.000Z", BUYER);

    expect(orders).toEqual([
      {
        placedAt: "2026-11-12T10:00:00.000Z",
        approvedAt: null,
        buyerId: "me",
        buyer: "You",
        sellerId: "brightside",
        seller: "Brightside Goods",
        items: [
          { productId: "P1", title: "Product P1", quantity: 1, unitPrice: 19.99 },
          { productId: "P3", title: "Product P3", quantity: 2, unitPrice: 7.25 },
        ],
        price: 34.49,
      },
      {
        placedAt: "2026-11-12T10:00:00.000Z",
        approvedAt: null,
        buyerId: "me",
        buyer: "You",
        sellerId: "harborview",
        seller: "Harborview Traders",
        items: [{ productId: "P2", title: "Product P2", quantity: 1, unitPrice: 34.5 }],
        price: 34.5,
      },
    ]);
  });

  it("makes no orders from an empty cart", () => {
    expect(createOrdersFromCart(EMPTY_CART, "2026-11-12T10:00:00.000Z", BUYER)).toEqual([]);
  });
});

describe("addOrderItemsToCart", () => {
  const CATALOG = new Map([LAMP, KETTLE, MUG, SOLD_OUT].map((product) => [product.id, product]));

  /**
   * Returns the test catalog product with a code.
   *
   * @param {string} productId - Product code.
   * @returns {import("@/features/catalog/sampleProducts.js").Product | undefined} The product, or undefined when it is not sold.
   */
  const findProduct = (productId) => CATALOG.get(productId);

  /**
   * Builds an order item for a product code.
   *
   * @param {string} productId - Product code.
   * @param {number} quantity - Units ordered.
   * @returns {import("@/features/orders/orderItems.js").OrderItem} The order item.
   */
  const orderItem = (productId, quantity) => ({ productId, title: `Old ${productId}`, quantity, unitPrice: 1 });

  it("adds each item with its quantity, at today's catalog price", () => {
    const result = addOrderItemsToCart(cartWith(LAMP), [orderItem("P1", 2), orderItem("P2", 3)], findProduct);

    expect(result.lines.map((line) => [line.productId, line.quantity, line.unitPrice])).toEqual([
      ["P1", 3, 19.99],
      ["P2", 3, 34.5],
    ]);
    expect(result).toMatchObject({ addedUnits: 5, unitsOverLimit: 0, unavailableTitles: [] });
  });

  it("leaves out products that are out of stock or no longer sold, and names them", () => {
    const result = addOrderItemsToCart(EMPTY_CART, [orderItem("P4", 1), orderItem("P9", 2), orderItem("P3", 1)], findProduct);

    expect(result.lines.map((line) => line.productId)).toEqual(["P3"]);
    expect(result).toMatchObject({ addedUnits: 1, unavailableTitles: ["Old P4", "Old P9"] });
  });

  it("stops each product at the per-product limit and counts the units left out", () => {
    const nineLamps = changeQuantity(cartWith(LAMP), "P1", MAX_QUANTITY_PER_PRODUCT - 2);

    const result = addOrderItemsToCart(nineLamps, [orderItem("P1", 3)], findProduct);

    expect(getQuantityInCart(result.lines, "P1")).toBe(MAX_QUANTITY_PER_PRODUCT);
    expect(result).toMatchObject({ addedUnits: 1, unitsOverLimit: 2 });
  });
});
