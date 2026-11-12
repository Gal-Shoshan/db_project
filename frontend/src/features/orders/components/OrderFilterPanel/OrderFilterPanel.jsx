/**
 * @file Panel of order list filters: the person the list names (seller or buyer), price and the list's date.
 */

import { useId } from "react";
import FilterChoice from "@/components/FilterPanel/FilterChoice.jsx";
import FilterGroup from "@/components/FilterPanel/FilterGroup.jsx";
import FilterPanel from "@/components/FilterPanel/FilterPanel.jsx";
import { countActiveOrderFilters } from "@/features/orders/orderListQuery.js";
import { ORDER_PRICE_RANGES } from "@/features/orders/ordersConfig.js";
import styles from "./OrderFilterPanel.module.css";

/**
 * Renders a checkbox for each person the list can name, such as each seller or each buyer.
 *
 * @param {object} props - Group props.
 * @param {import("@/features/orders/orderLists.js").OrderParty} props.party - The person the list names, with the choices.
 * @param {string[]} props.selected - Selected person ids.
 * @param {function(object): void} props.onChange - Called with the new `people` value.
 * @returns {JSX.Element} The person group.
 */
function PeopleFilter({ party, selected, onChange }) {
  /**
   * Adds the person to the selection, or removes them when they are already selected.
   *
   * @param {string} personId - The person to toggle.
   */
  const togglePerson = (personId) => {
    const people = selected.includes(personId) ? selected.filter((id) => id !== personId) : [...selected, personId];
    onChange({ people });
  };

  return (
    <FilterGroup legend={party.filterLegend}>
      {party.people.map((person) => (
        <FilterChoice
          key={person.id}
          type="checkbox"
          checked={selected.includes(person.id)}
          onChange={() => togglePerson(person.id)}
        >
          {person.name}
        </FilterChoice>
      ))}
    </FilterGroup>
  );
}

/**
 * Renders the order price radio buttons, including "Any price".
 *
 * @param {object} props - Group props.
 * @param {string} props.name - Name shared by the radio buttons.
 * @param {string | null} props.selected - Selected price range id, or null for any price.
 * @param {function(object): void} props.onChange - Called with the new `price` value.
 * @returns {JSX.Element} The price group.
 */
function OrderPriceFilter({ name, selected, onChange }) {
  return (
    <FilterGroup legend="Price">
      <FilterChoice type="radio" name={name} checked={selected === null} onChange={() => onChange({ price: null })}>
        Any price
      </FilterChoice>
      {ORDER_PRICE_RANGES.map((range) => (
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
 * Renders a labeled date input; clearing the input removes that limit.
 *
 * @param {object} props - Field props.
 * @param {string} props.label - Visible label, for example "From".
 * @param {string | null} props.value - Selected day as "YYYY-MM-DD", or null for no limit.
 * @param {string | null} props.min - Earliest day the input offers, or null for no limit.
 * @param {string | null} props.max - Latest day the input offers, or null for no limit.
 * @param {function(string | null): void} props.onChange - Called with the new day, or null when cleared.
 * @returns {JSX.Element} The date field.
 */
function DateField({ label, value, min, max, onChange }) {
  return (
    <label className={styles.dateField}>
      <span className={styles.dateLabel}>{label}</span>
      <input
        type="date"
        className={styles.dateInput}
        value={value ?? ""}
        min={min ?? undefined}
        max={max ?? undefined}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </label>
  );
}

/**
 * Renders the From and To days of the date filter; both days are included.
 *
 * @param {object} props - Group props.
 * @param {string} props.legend - Name of the date, for example "Order date".
 * @param {string | null} props.from - Earliest day, or null for no limit.
 * @param {string | null} props.to - Latest day, or null for no limit.
 * @param {function(object): void} props.onChange - Called with the changed `from` or `to` value.
 * @returns {JSX.Element} The date group.
 */
function DateRangeFilter({ legend, from, to, onChange }) {
  return (
    <FilterGroup legend={legend}>
      <DateField label="From" value={from} min={null} max={to} onChange={(day) => onChange({ from: day })} />
      <DateField label="To" value={to} min={from} max={null} onChange={(day) => onChange({ to: day })} />
    </FilterGroup>
  );
}

/**
 * Renders every order filter group and a button that clears them; each change applies at once.
 *
 * @param {object} props - Panel props.
 * @param {string} props.id - Element id, referenced by the Filters button.
 * @param {import("@/features/orders/orderListQuery.js").OrderListQuery} props.filters - Current filter values.
 * @param {function(object): void} props.onChange - Called with the changed filter values.
 * @param {function(): void} props.onClear - Called when "Clear all filters" is pressed.
 * @param {import("@/features/orders/orderLists.js").OrderList} props.list - How the list shows its orders: its person and date.
 * @returns {JSX.Element} The filter panel.
 */
export default function OrderFilterPanel({ id, filters, onChange, onClear, list }) {
  const radioNamePrefix = useId();

  return (
    <FilterPanel id={id} activeFilterCount={countActiveOrderFilters(filters)} onClear={onClear}>
      <PeopleFilter party={list.party} selected={filters.people} onChange={onChange} />
      <OrderPriceFilter name={`${radioNamePrefix}-price`} selected={filters.price} onChange={onChange} />
      <DateRangeFilter legend={list.dateLegend} from={filters.from} to={filters.to} onChange={onChange} />
    </FilterPanel>
  );
}
