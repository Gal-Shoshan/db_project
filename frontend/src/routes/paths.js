/**
 * @file URL paths of the pages, shared by the route table and every link.
 */

/**
 * Path of each page.
 *
 * @type {Readonly<Record<"home" | "signIn" | "signUp" | "personalArea" | "sell" | "sellOrders" | "sellProducts" | "buy" | "buyShopping" | "buyPendingOrders" | "buyPurchases" | "reports" | "profile", string>>}
 */
export const ROUTES = Object.freeze({
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  personalArea: "/personal-area",
  sell: "/personal-area/sell",
  sellOrders: "/personal-area/sell/orders",
  sellProducts: "/personal-area/sell/products",
  buy: "/personal-area/buy",
  buyShopping: "/personal-area/buy/shopping",
  buyPendingOrders: "/personal-area/buy/pending-orders",
  buyPurchases: "/personal-area/buy/purchases",
  reports: "/personal-area/reports",
  profile: "/personal-area/profile",
});
