/**
 * @file The people in the marketplace: the signed-in user, and the made-up buyers who order from the user's shop.
 *
 * Every user can both buy and sell. Until users come from a server, the
 * signed-in user has a fixed id, and the buyers are sample data.
 */

/**
 * The signed-in user: the buyer of their own orders and the seller of their own shop.
 *
 * @type {Readonly<{id: string, name: string, shopName: string}>}
 */
export const CURRENT_USER = Object.freeze({ id: "me", name: "You", shopName: "Your shop" });

/**
 * Made-up buyers who order from the signed-in user's shop, in display order.
 *
 * @type {ReadonlyArray<{id: string, name: string}>}
 */
export const SAMPLE_BUYERS = Object.freeze([
  { id: "dana-levi", name: "Dana Levi" },
  { id: "kwame-mensah", name: "Kwame Mensah" },
  { id: "lucas-moreau", name: "Lucas Moreau" },
  { id: "mei-chen", name: "Mei Chen" },
  { id: "omar-haddad", name: "Omar Haddad" },
  { id: "priya-nair", name: "Priya Nair" },
  { id: "sofia-rossi", name: "Sofia Rossi" },
]);
