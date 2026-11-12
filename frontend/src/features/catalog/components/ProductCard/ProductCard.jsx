/**
 * @file Catalog card of one product: picture, title, rating, price, delivery and the page's controls, such as Add to cart or Edit.
 */

import { useId } from "react";
import Price from "@/components/Price/Price.jsx";
import RatingStars from "@/components/RatingStars/RatingStars.jsx";
import ProductImage from "@/features/catalog/components/ProductImage/ProductImage.jsx";
import { formatCount, formatCurrency } from "@/utils/formatters.js";
import styles from "./ProductCard.module.css";

/**
 * Renders a product the way online-store search results do.
 *
 * @param {object} props - Card props.
 * @param {import("@/features/catalog/sampleProducts.js").Product} props.product - The product.
 * @param {function(import("@/features/catalog/sampleProducts.js").Product, string): import("react").ReactNode} props.renderAction
 *   Returns the controls at the bottom of the card, given the product and the element id of its title.
 * @returns {JSX.Element} The product card.
 */
export default function ProductCard({ product, renderAction }) {
  const titleId = useId();

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <ProductImage category={product.category} />
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {product.title}
        </h2>
        <div className={styles.rating}>
          <RatingStars rating={product.rating} />
          <span className={styles.reviewCount}>
            {formatCount(product.reviewCount)}
            <span className="visually-hidden"> ratings</span>
          </span>
        </div>
        <div className={styles.priceRow}>
          <Price amount={product.price} />
          {product.listPrice !== null && (
            <span className={styles.listPrice}>
              List: <s>{formatCurrency(product.listPrice)}</s>
            </span>
          )}
        </div>
        {product.inStock && product.freeDelivery && (
          <p className={styles.delivery}>
            <strong>FREE delivery</strong>
          </p>
        )}
        {!product.inStock && <p className={styles.unavailable}>Currently unavailable.</p>}
        <div className={styles.action}>{renderAction(product, titleId)}</div>
      </div>
    </article>
  );
}
