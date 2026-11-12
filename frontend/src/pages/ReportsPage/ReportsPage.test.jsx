/**
 * @file Tests for the Reports page: key figures, the chart with its legend and tooltip, and the breakdown table.
 */

import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/routes/paths.js";
import { renderApp } from "@/test/renderApp.jsx";
import { signInThroughForm } from "@/test/signInThroughForm.js";

/**
 * Signs in through the form and opens the Reports mode.
 *
 * @returns {Promise<{user: import("@testing-library/user-event").UserEvent}>} The user-event session.
 */
async function openReports() {
  const { user } = renderApp(ROUTES.signIn);
  await signInThroughForm(user);
  const personalAreaBar = screen.getByRole("navigation", { name: "Personal area" });
  await user.click(within(personalAreaBar).getByRole("radio", { name: "Reports" }));
  return { user };
}

/**
 * Returns the chart's focus and hover target for a month.
 *
 * @param {string} monthName - Full month and year, for example "October 2026".
 * @returns {HTMLElement} The month's target.
 */
const monthTarget = (monthName) => screen.getByRole("button", { name: new RegExp(`^${monthName}:`) });

/**
 * Returns the figures in the table row whose heading has the given accessible name.
 *
 * @param {string} heading - Row heading, for example "October 2026" or "Total".
 * @returns {string[]} The texts of the figure cells, after the heading.
 */
function rowFigures(heading) {
  const row = screen.getByRole("rowheader", { name: heading }).closest("tr");
  return within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);
}

describe("ReportsPage", () => {
  it("names the page and the period, and marks the figures as sample data", async () => {
    await openReports();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Reports");
    expect(screen.getByText("Sales and purchases by month, Nov 2025 – Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("Sample data")).toBeInTheDocument();
  });

  it("shows the key figures for the period", async () => {
    await openReports();
    const keyFigures = screen.getByRole("region", { name: "Key figures" });

    expect(within(keyFigures).getByText("$513.5K")).toBeInTheDocument();
    expect(within(keyFigures).getByText("$396.3K")).toBeInTheDocument();
    expect(within(keyFigures).getByText("+$117.2K")).toBeInTheDocument();
    expect(within(keyFigures).getByText("October 2026 sales")).toBeInTheDocument();
    expect(within(keyFigures).getByText("+14.2% vs September")).toBeInTheDocument();
  });

  it("shows the chart with a legend and a text description", async () => {
    await openReports();
    const chartPanel = screen.getByRole("region", { name: "Monthly volume" });

    const legend = within(chartPanel).getByRole("list", { name: "Legend" });
    expect(within(legend).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Sales", "Purchases"]);
    const chart = within(chartPanel).getByRole("img");
    expect(chart).toHaveAccessibleName(/^Column chart of monthly sales and purchases, Nov 2025 to Oct 2026\./);
    expect(chart).toHaveAccessibleName(/Sales peak at \$61,750 in December 2025; Purchases peak at \$49,600 in October 2026/);
  });

  it("lists every month with its net, and the totals, in the table", async () => {
    await openReports();
    const table = within(screen.getByRole("region", { name: "Monthly breakdown" })).getByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(14);
    expect(rowFigures("October 2026")).toEqual(["$52,400", "$49,600", "+$2,800"]);
    expect(rowFigures("September 2026")).toEqual(["$45,900", "$47,250", "-$1,350"]);
    expect(rowFigures("Total")).toEqual(["$513,500", "$396,300", "+$117,200"]);
  });

  it("shows a month's figures in a tooltip while the pointer is over it", async () => {
    const { user } = await openReports();

    await user.hover(monthTarget("December 2025"));

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("December 2025");
    expect(tooltip).toHaveTextContent("$61,750Sales");
    expect(tooltip).toHaveTextContent("$27,900Purchases");
    expect(tooltip).toHaveTextContent("Net+$33,850");

    await user.unhover(monthTarget("December 2025"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("moves between months with the arrow keys, Home and End, from a single tab stop", async () => {
    const { user } = await openReports();
    const monthTargets = within(screen.getByRole("group", { name: /Months/ })).getAllByRole("button");
    expect(monthTargets.filter((target) => target.tabIndex === 0)).toEqual([monthTarget("October 2026")]);

    act(() => monthTarget("October 2026").focus());
    expect(screen.getByRole("tooltip")).toHaveTextContent("October 2026");

    await user.keyboard("{ArrowLeft}");
    expect(monthTarget("September 2026")).toHaveFocus();
    expect(screen.getByRole("tooltip")).toHaveTextContent("September 2026");

    await user.keyboard("{Home}");
    expect(monthTarget("November 2025")).toHaveFocus();

    await user.keyboard("{End}");
    expect(monthTarget("October 2026")).toHaveFocus();
  });
});
