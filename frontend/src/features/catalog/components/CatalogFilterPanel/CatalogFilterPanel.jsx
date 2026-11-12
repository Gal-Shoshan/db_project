/**
 * @file Panel of catalog filters: category, price, customer reviews, availability and delivery.
 */

import { useId } from "react";
import FilterChoice from "@/components/FilterPanel/FilterChoice.jsx";
import FilterGroup from "@/components/FilterPanel/FilterGroup.jsx";
import FilterPanel from "@/components/FilterPanel/FilterPanel.jsx";
import RatingStars from "@/components/RatingStars/RatingStars.jsx";
import { CATEGORIES, PRICE_RANGES, RATING_THRESHOLDS } from "@/features/catalog/catalogConfig.js";
import { countActiveFilters } from "@/features/catalog/catalogQuery.js";

/**
 * Renders the category checkboxes.
 *
 * @param {object} props - Group props.
 * @param {string[]} props.selected - Selected category ids.
 * @param {function(object): void} props.onChange - Called with the new `categories` value.
 * @returns {JSX.Element} The category group.
 */
function CategoryFilter({ selected, onChange }) {
  /**
   * Adds the category to the selection, or removes it when it is already selected.
   *
   * @param {string} categoryId - The category to toggle.
   */
  const toggleCategory = (categoryId) => {
    const categories = selected.includes(categoryId)
      ? selected.filter((id) => id !== categoryId)
      : [...selected, categoryId];
    onChange({ categories });
  };

  return (
    <FilterGroup legend="Category">
      {CATEGORIES.map((category) => (
        <FilterChoice
          key={category.id}
          type="checkbox"
          checked={selected.includes(category.id)}
          onChange={() => toggleCategory(category.id)}
        >
          {category.label}
        </FilterChoice>
      ))}
    </FilterGroup>
  );
}

/**
 * Renders the price-range radio buttons, including "Any price".
 *
 * @param {object} props - Group props.
 * @param {string} props.name - Name shared by the radio buttons.
 * @param {string | null} props.selected - Selected price range id, or null for any price.
 * @param {function(object): void} props.onChange - Called with the new `price` value.
 * @returns {JSX.Element} The price group.
 */
function PriceFilter({ name, selected, onChange }) {
  return (
    <FilterGroup legend="Price">
      <FilterChoice type="radio" name={name} checked={selected === null} onChange={() => onChange({ price: null })}>
        Any price
      </FilterChoice>
      {PRICE_RANGES.map((range) => (
        <FilterChoice
          key={range.id}
          type="radio"
          name={name}
          checked={selected === range.id}
          onChange={() => onChange({ price: range.id })}
        >
          {range.label}
        </FilterChoice>
      ))}
    </FilterGroup>
  );
}

/**
 * Renders the customer-review radio buttons, including "Any rating".
 *
 * @param {object} props - Group props.
 * @param {string} props.name - Name shared by the radio buttons.
 * @param {number | null} props.selected - Selected lowest rating, or null for any rating.
 * @param {function(object): void} props.onChange - Called with the new `minRating` value.
 * @returns {JSX.Element} The customer-review group.
 */
function RatingFilter({ name, selected, onChange }) {
  return (
    <FilterGroup legend="Customer reviews">
      <FilterChoice type="radio" name={name} checked={selected === null} onChange={() => onChange({ minRating: null })}>
        Any rating
      </FilterChoice>
      {RATING_THRESHOLDS.map((threshold) => (
        <FilterChoice
          key={threshold}
          type="radio"
          name={name}
          checked={selected === threshold}
          onChange={() => onChange({ minRating: threshold })}
        >
          <RatingStars rating={threshold} /> &amp; Up
        </FilterChoice>
      ))}
    </FilterGroup>
  );
}

/**
 * Renders the availability and delivery checkboxes.
 *
 * @param {object} props - Group props.
 * @param {boolean} props.inStock - Whether only in-stock products are shown.
 * @param {boolean} props.freeDelivery - Whether only free-delivery products are shown.
 * @param {function(object): void} props.onChange - Called with the changed `inStock` or `freeDelivery` value.
 * @returns {JSX.Element} The availability group.
 */
function AvailabilityFilter({ inStock, freeDelivery, onChange }) {
  return (
    <FilterGroup legend="Availability">
      <FilterChoice type="checkbox" checked={inStock} onChange={() => onChange({ inStock: !inStock })}>
        In stock only
      </FilterChoice>
      <FilterChoice type="checkbox" checked={freeDelivery} onChange={() => onChange({ freeDelivery: !freeDelivery })}>
        FREE delivery
      </FilterChoice>
    </FilterGroup>
  );
}

/**
 * Renders every catalog filter group and a button that clears them; each change applies at once.
 *
 * @param {object} props - Panel props.
 * @param {string} props.id - Element id, referenced by the Filters button.
 * @param {import("@/features/catalog/catalogQuery.js").CatalogQuery} props.filters - Current filter values.
 * @param {function(object): void} props.onChange - Called with the changed filter values.
 * @param {function(): void} props.onClear - Called when "Clear all filters" is pressed.
 * @returns {JSX.Element} The filter panel.
 */
export default function CatalogFilterPanel({ id, filters, onChange, onClear }) {
  const radioNamePrefix = useId();

  return (
    <FilterPanel id={id} activeFilterCount={countActiveFilters(filters)} onClear={onClear}>
      <CategoryFilter selected={filters.categories} onChange={onChange} />
      <PriceFilter name={`${radioNamePrefix}-price`} selected={filters.price} onChange={onChange} />
      <RatingFilter name={`${radioNamePrefix}-rating`} selected={filters.minRating} onChange={onChange} />
      <AvailabilityFilter inStock={filters.inStock} freeDelivery={filters.freeDelivery} onChange={onChange} />
    </FilterPanel>
  );
}
