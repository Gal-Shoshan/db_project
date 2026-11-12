/**
 * @file The sellers that sell the catalog's products and receive the user's orders.
 */

/**
 * Sellers, in display order. The names are made up.
 *
 * @type {ReadonlyArray<{id: string, name: string}>}
 */
export const SELLERS = Object.freeze([
  { id: "brightside", name: "Brightside Goods" },
  { id: "cedar-pine", name: "Cedar & Pine Supply" },
  { id: "copper-kettle", name: "Copper Kettle Deals" },
  { id: "harborview", name: "Harborview Traders" },
  { id: "maple-street", name: "Maple Street Market" },
  { id: "silver-birch", name: "Silver Birch Store" },
]);

const SELLERS_BY_ID = new Map(SELLERS.map((seller) => [seller.id, seller]));

/**
 * Returns the seller with the given id.
 *
 * @param {string} sellerId - Seller id, for example "brightside".
 * @returns {{id: string, name: string}} The seller.
 * @throws {Error} If no seller has this id.
 */
export function getSeller(sellerId) {
  const seller = SELLERS_BY_ID.get(sellerId);
  if (!seller) {
    throw new Error(`Unknown seller: ${sellerId}`);
  }
  return seller;
}
