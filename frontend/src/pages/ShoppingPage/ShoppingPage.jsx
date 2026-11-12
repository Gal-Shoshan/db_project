/**
 * @file Shopping page of the Buy mode: an online-store catalog with search, filters, sorting, pages of products and Add to cart.
 */

import AddToCartButton from "@/features/cart/components/AddToCartButton/AddToCartButton.jsx";
import ProductCatalog from "@/features/catalog/components/ProductCatalog/ProductCatalog.jsx";
import { SAMPLE_PRODUCTS } from "@/features/catalog/sampleProducts.js";

/**
 * Renders a product card's Add to cart button.
 *
 * @param {import("@/features/catalog/sampleProducts.js").Product} product - The product.
 * @param {string} titleId - Element id of the product's title.
 * @returns {JSX.Element} The button.
 */
const renderAddToCart = (product, titleId) => <AddToCartButton product={product} productTitleId={titleId} />;

/**
 * Renders the catalog of every seller's products, each with an Add to cart button.
 *
 * The products are sample data until the catalog is served by an API.
 *
 * @returns {JSX.Element} The Shopping page.
 */
export default function ShoppingPage() {
  return <ProductCatalog title="Shopping" products={SAMPLE_PRODUCTS} renderCardAction={renderAddToCart} />;
}
