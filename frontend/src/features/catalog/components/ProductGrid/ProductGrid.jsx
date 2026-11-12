/**
 * @file Responsive grid of product cards.
 */

import ProductCard from "@/features/catalog/components/ProductCard/ProductCard.jsx";
import styles from "./ProductGrid.module.css";

/**
 * Renders the products as a list laid out in as many columns as fit.
 *
 * @param {object} props - Grid props.
 * @param {ReadonlyArray<import("@/features/catalog/sampleProducts.js").Product>} props.products - Products to show, in order.
 * @param {function(import("@/features/catalog/sampleProducts.js").Product, string): import("react").ReactNode} props.renderCardAction
 *   Returns the controls at the bottom of each card, given the product and the element id of its title.
 * @returns {JSX.Element} The product grid.
 */
export default function ProductGrid({ products, renderCardAction }) {
  return (
    <ul className={styles.grid} aria-label="Products">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} renderAction={renderCardAction} />
        </li>
      ))}
    </ul>
  );
}
