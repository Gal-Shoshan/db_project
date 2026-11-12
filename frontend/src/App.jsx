/**
 * @file Route table of the application.
 */

import { Navigate, Route, Routes } from "react-router";
import AuthProvider from "@/auth/AuthProvider.jsx";
import RequireAuth from "@/auth/RequireAuth.jsx";
import CartProvider from "@/features/cart/CartProvider.jsx";
import OrdersProvider from "@/features/orders/OrdersProvider.jsx";
import ShopProductsProvider from "@/features/shop/ShopProductsProvider.jsx";
import BuyModeLayout from "@/layouts/BuyModeLayout/BuyModeLayout.jsx";
import ModeLayout from "@/layouts/ModeLayout/ModeLayout.jsx";
import { DEFAULT_MODE } from "@/layouts/PersonalAreaLayout/modes.js";
import PersonalAreaLayout from "@/layouts/PersonalAreaLayout/PersonalAreaLayout.jsx";
import PublicLayout from "@/layouts/PublicLayout/PublicLayout.jsx";
import HomePage from "@/pages/HomePage/HomePage.jsx";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage.jsx";
import OrdersPage from "@/pages/OrdersPage/OrdersPage.jsx";
import PendingOrdersPage from "@/pages/PendingOrdersPage/PendingOrdersPage.jsx";
import ProductsPage from "@/pages/ProductsPage/ProductsPage.jsx";
import PurchasesPage from "@/pages/PurchasesPage/PurchasesPage.jsx";
import ProfilePage from "@/pages/ProfilePage/ProfilePage.jsx";
import ReportsPage from "@/pages/ReportsPage/ReportsPage.jsx";
import ShoppingPage from "@/pages/ShoppingPage/ShoppingPage.jsx";
import SignInPage from "@/pages/SignInPage/SignInPage.jsx";
import SignUpPage from "@/pages/SignUpPage/SignUpPage.jsx";
import { ROUTES } from "@/routes/paths.js";

/**
 * Renders the page that matches the current URL inside its layouts.
 *
 * Public pages use the public layout. The personal area sits under
 * RequireAuth, so only a user who signed in through the sign-in form can open
 * it, and it keeps the shared order list, the user's shop products and cart while it is open. Inside
 * it, each mode has its own layout, and the Sell and Buy modes show their
 * options in a sidebar; the Buy mode also shows the cart window. The router
 * itself is provided by the caller: BrowserRouter in the browser, MemoryRouter
 * in tests.
 *
 * @returns {JSX.Element} The routed application.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.signIn} element={<SignInPage />} />
          <Route path={ROUTES.signUp} element={<SignUpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route
            path={ROUTES.personalArea}
            element={
              <OrdersProvider>
                <ShopProductsProvider>
                  <CartProvider>
                    <PersonalAreaLayout />
                  </CartProvider>
                </ShopProductsProvider>
              </OrdersProvider>
            }
          >
            <Route index element={<Navigate to={DEFAULT_MODE.path} replace />} />
            <Route path={ROUTES.sell} element={<ModeLayout modeValue="sell" />}>
              <Route path={ROUTES.sellOrders} element={<OrdersPage />} />
              <Route path={ROUTES.sellProducts} element={<ProductsPage />} />
            </Route>
            <Route path={ROUTES.buy} element={<BuyModeLayout />}>
              <Route path={ROUTES.buyShopping} element={<ShoppingPage />} />
              <Route path={ROUTES.buyPendingOrders} element={<PendingOrdersPage />} />
              <Route path={ROUTES.buyPurchases} element={<PurchasesPage />} />
            </Route>
            <Route path={ROUTES.reports} element={<ModeLayout modeValue="reports" />}>
              <Route index element={<ReportsPage />} />
            </Route>
            <Route path={ROUTES.profile} element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
