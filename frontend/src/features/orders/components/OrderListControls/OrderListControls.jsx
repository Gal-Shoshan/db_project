/**
 * @file Top of an order list page: the Filters button and Sort by menu, and the filter panel the button opens.
 */

import { useId, useState } from "react";
import FilterSortBar from "@/components/FilterSortBar/FilterSortBar.jsx";
import OrderFilterPanel from "@/features/orders/components/OrderFilterPanel/OrderFilterPanel.jsx";
import { NO_ORDER_FILTERS, countActiveOrderFilters } from "@/features/orders/orderListQuery.js";
import { getOrderSortOptions } from "@/features/orders/orderLists.js";

/**
 * Renders the Filters and Sort by bar and, while it is open, the filter panel under it.
 *
 * @param {object} props - Controls props.
 * @param {import("@/features/orders/orderListQuery.js").OrderListQuery} props.query - Current filters and sort order.
 * @param {function(object): void} props.onChange - Called with changed filter or sort values.
 * @param {import("@/features/orders/orderLists.js").OrderList} props.list - How the list shows its orders: its person and date.
 * @returns {JSX.Element} The controls.
 */
export default function OrderListControls({ query, onChange, list }) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterPanelId = useId();

  return (
    <>
      <FilterSortBar
        activeFilterCount={countActiveOrderFilters(query)}
        isFilterPanelOpen={isFilterPanelOpen}
        filterPanelId={filterPanelId}
        onToggleFilters={() => setIsFilterPanelOpen((isOpen) => !isOpen)}
        sortOptions={getOrderSortOptions(list.party)}
        sort={query.sort}
        onSortChange={(sort) => onChange({ sort })}
      />
      {isFilterPanelOpen && (
        <OrderFilterPanel
          id={filterPanelId}
          filters={query}
          onChange={onChange}
          onClear={() => onChange(NO_ORDER_FILTERS)}
          list={list}
        />
      )}
    </>
  );
}
