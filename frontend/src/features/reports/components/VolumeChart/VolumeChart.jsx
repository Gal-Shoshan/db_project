/**
 * @file Grouped column chart of monthly sales and purchases, with a tooltip on hover and on keyboard focus.
 */

import { useId, useRef, useState } from "react";
import { VOLUME_SERIES } from "@/features/reports/monthlyVolumes.js";
import { formatLongMonthYear, formatShortMonth, formatShortMonthYear, isJanuary, monthYear } from "@/features/reports/months.js";
import { peakMonth } from "@/features/reports/summarizeVolumes.js";
import { useElementWidth } from "@/hooks/useElementWidth.js";
import { formatCompactCurrency, formatSignedWholeCurrency, formatWholeCurrency } from "@/utils/formatters.js";
import { niceScale } from "@/utils/niceScale.js";
import styles from "./VolumeChart.module.css";

const FALLBACK_WIDTH = 720;
const PLOT_HEIGHT = 260;
const MARGIN = Object.freeze({ top: 28, right: 8, bottom: 46, left: 56 });
const MAX_BAR_WIDTH = 24;
const BAR_GAP = 2;
const GROUP_SHARE_OF_BAND = 0.7;
const CORNER_RADIUS = 4;
const TICK_LABEL_OFFSET = 10;
const MONTH_LABEL_OFFSET = 18;
const YEAR_LABEL_OFFSET = 34;
const PEAK_LABEL_OFFSET = 6;
const PEAK_LABEL_HALF_WIDTH = 22;
const TOOLTIP_GAP = 10;
const TOOLTIP_WIDTH = 192;
const MIN_BAND_WIDTH_FOR_EVERY_LABEL = 34;
const PIXEL_CENTER = 0.5;

/**
 * Returns the chart geometry for the given width: plot size, band and bar widths, value scale and positions.
 *
 * Each month gets an equal band; its columns are centered in the band and
 * never wider than MAX_BAR_WIDTH, so wide charts leave air instead of
 * drawing fat bars.
 *
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} months - Months to plot; some value must be above zero.
 * @param {number} width - Width of the chart in pixels.
 * @returns {object} The layout, with `yFor(value)`, `bandLeft(index)` and `barLeft(index, seriesIndex)` helpers.
 */
function computeLayout(months, width) {
  const seriesCount = VOLUME_SERIES.length;
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, months.length);
  const bandWidth = plotWidth / months.length;
  const groupWidth = Math.min(bandWidth * GROUP_SHARE_OF_BAND, seriesCount * MAX_BAR_WIDTH + (seriesCount - 1) * BAR_GAP);
  const barWidth = (groupWidth - (seriesCount - 1) * BAR_GAP) / seriesCount;
  const scale = niceScale(Math.max(...months.flatMap((month) => VOLUME_SERIES.map((series) => month[series.key]))));
  const baselineY = MARGIN.top + PLOT_HEIGHT;

  return {
    width,
    height: baselineY + MARGIN.bottom,
    plotWidth,
    bandWidth,
    barWidth,
    baselineY,
    scale,
    yFor: (value) => baselineY - (value / scale.max) * PLOT_HEIGHT,
    bandLeft: (index) => MARGIN.left + index * bandWidth,
    barLeft: (index, seriesIndex) =>
      MARGIN.left + index * bandWidth + (bandWidth - groupWidth) / 2 + seriesIndex * (barWidth + BAR_GAP),
  };
}

/**
 * Returns the SVG path of a column with rounded top corners and a square base on the baseline.
 *
 * @param {number} left - Left edge in pixels.
 * @param {number} top - Top edge in pixels.
 * @param {number} width - Column width in pixels.
 * @param {number} bottom - Baseline in pixels.
 * @returns {string} The path data.
 */
function columnPath(left, top, width, bottom) {
  const radius = Math.max(Math.min(CORNER_RADIUS, width / 2, bottom - top), 0);
  const right = left + width;
  return [
    `M${left},${bottom}`,
    `V${top + radius}`,
    `A${radius},${radius} 0 0 1 ${left + radius},${top}`,
    `H${right - radius}`,
    `A${radius},${radius} 0 0 1 ${right},${top + radius}`,
    `V${bottom}Z`,
  ].join("");
}

/**
 * Returns the month a key press moves to, or null for keys that do not move.
 *
 * @param {string} key - The pressed key.
 * @param {number} index - Index of the focused month.
 * @param {number} monthCount - Number of months.
 * @returns {number | null} Index of the month to focus.
 */
function keyTargetIndex(key, index, monthCount) {
  const targets = {
    ArrowLeft: Math.max(index - 1, 0),
    ArrowRight: Math.min(index + 1, monthCount - 1),
    Home: 0,
    End: monthCount - 1,
  };
  return key in targets ? targets[key] : null;
}

/**
 * Returns the spoken description of one month's figures.
 *
 * @param {import("@/features/reports/monthlyVolumes.js").MonthlyVolume} month - The month.
 * @returns {string} For example "October 2026: sales $52,400, purchases $49,600".
 */
function describeMonth(month) {
  const figures = VOLUME_SERIES.map((series) => `${series.label.toLowerCase()} ${formatWholeCurrency(month[series.key])}`);
  return `${formatLongMonthYear(month.month)}: ${figures.join(", ")}`;
}

/**
 * Returns the chart's text alternative: what it shows and where each series peaks.
 *
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} months - The plotted months.
 * @returns {string} The description.
 */
function describeChart(months) {
  const peaks = VOLUME_SERIES.map((series) => {
    const peak = peakMonth(months, series.key);
    return `${series.label} peak at ${formatWholeCurrency(peak[series.key])} in ${formatLongMonthYear(peak.month)}`;
  });
  const period = `${formatShortMonthYear(months[0].month)} to ${formatShortMonthYear(months[months.length - 1].month)}`;
  return `Column chart of monthly sales and purchases, ${period}. ${peaks.join("; ")}. Exact figures are in the monthly breakdown table.`;
}

/**
 * Renders the horizontal gridlines and the dollar labels of the value axis.
 *
 * @param {object} props - Axis props.
 * @param {ReturnType<typeof computeLayout>} props.layout - Chart layout.
 * @returns {JSX.Element} The value axis.
 */
function ValueAxis({ layout }) {
  return (
    <g>
      {layout.scale.ticks.map((tick) => {
        const y = Math.round(layout.yFor(tick)) + PIXEL_CENTER;
        return (
          <g key={tick}>
            {tick > 0 && <line x1={MARGIN.left} x2={layout.width - MARGIN.right} y1={y} y2={y} className={styles.gridline} />}
            <text x={MARGIN.left - TICK_LABEL_OFFSET} y={y} textAnchor="end" dominantBaseline="middle" className={styles.tickLabel}>
              {formatCompactCurrency(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/**
 * Renders the month names under the columns, with the year under the first month and under each January.
 *
 * When the bands are too narrow for every name, every other month is named.
 *
 * @param {object} props - Axis props.
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} props.months - The plotted months.
 * @param {ReturnType<typeof computeLayout>} props.layout - Chart layout.
 * @returns {JSX.Element} The month axis.
 */
function MonthAxis({ months, layout }) {
  const labelInterval = layout.bandWidth < MIN_BAND_WIDTH_FOR_EVERY_LABEL ? 2 : 1;

  return (
    <g>
      {months.map((month, index) => {
        const centerX = layout.bandLeft(index) + layout.bandWidth / 2;
        const showsYear = index === 0 || isJanuary(month.month);
        return (
          <g key={month.month}>
            {index % labelInterval === 0 && (
              <text x={centerX} y={layout.baselineY + MONTH_LABEL_OFFSET} textAnchor="middle" className={styles.monthLabel}>
                {formatShortMonth(month.month)}
              </text>
            )}
            {showsYear && (
              <text x={centerX} y={layout.baselineY + YEAR_LABEL_OFFSET} textAnchor="middle" className={styles.yearLabel}>
                {monthYear(month.month)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Renders one column per series for every month, in the series colors.
 *
 * @param {object} props - Column props.
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} props.months - The plotted months.
 * @param {ReturnType<typeof computeLayout>} props.layout - Chart layout.
 * @returns {JSX.Element} The columns.
 */
function Columns({ months, layout }) {
  return (
    <g>
      {months.map((month, index) =>
        VOLUME_SERIES.map((series, seriesIndex) => (
          <path
            key={`${month.month}-${series.key}`}
            d={columnPath(layout.barLeft(index, seriesIndex), layout.yFor(month[series.key]), layout.barWidth, layout.baselineY)}
            style={{ fill: series.color }}
          />
        )),
      )}
    </g>
  );
}

/**
 * Labels the highest column of each series with its value; a second peak in the same month is left to the tooltip.
 *
 * A label sits above the taller column of its month, so it never overlaps
 * the neighbouring column, and it is kept inside the chart's width.
 *
 * @param {object} props - Label props.
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} props.months - The plotted months.
 * @param {ReturnType<typeof computeLayout>} props.layout - Chart layout.
 * @returns {JSX.Element} The peak labels.
 */
function PeakLabels({ months, layout }) {
  const labeledMonths = new Set();
  const labels = VOLUME_SERIES.flatMap((series, seriesIndex) => {
    const index = months.indexOf(peakMonth(months, series.key));
    if (labeledMonths.has(index)) {
      return [];
    }
    labeledMonths.add(index);
    const tallestInMonth = Math.max(...VOLUME_SERIES.map((other) => months[index][other.key]));
    const barCenter = layout.barLeft(index, seriesIndex) + layout.barWidth / 2;
    return [
      {
        key: series.key,
        x: Math.min(Math.max(barCenter, PEAK_LABEL_HALF_WIDTH), layout.width - PEAK_LABEL_HALF_WIDTH),
        y: layout.yFor(tallestInMonth) - PEAK_LABEL_OFFSET,
        value: months[index][series.key],
      },
    ];
  });

  return (
    <g>
      {labels.map((label) => (
        <text key={label.key} x={label.x} y={label.y} textAnchor="middle" className={styles.peakLabel}>
          {formatCompactCurrency(label.value)}
        </text>
      ))}
    </g>
  );
}

/**
 * Returns the left edge of a month's tooltip: beside the month's band on the side with more room, kept inside the chart.
 *
 * @param {number} index - Position of the month in the chart.
 * @param {ReturnType<typeof computeLayout>} layout - Chart layout.
 * @returns {number} The tooltip's left edge in pixels.
 */
function tooltipLeft(index, layout) {
  const bandLeft = layout.bandLeft(index);
  const isInRightHalf = bandLeft + layout.bandWidth / 2 > layout.width / 2;
  const preferredLeft = isInRightHalf
    ? bandLeft - TOOLTIP_GAP - TOOLTIP_WIDTH
    : bandLeft + layout.bandWidth + TOOLTIP_GAP;
  return Math.min(Math.max(preferredLeft, 0), Math.max(layout.width - TOOLTIP_WIDTH, 0));
}

/**
 * Renders the tooltip of one month beside its columns, listing every series and the net.
 *
 * @param {object} props - Tooltip props.
 * @param {string} props.id - Element id, referenced by the focused month.
 * @param {import("@/features/reports/monthlyVolumes.js").MonthlyVolume} props.month - The month.
 * @param {number} props.index - Position of the month in the chart.
 * @param {ReturnType<typeof computeLayout>} props.layout - Chart layout.
 * @returns {JSX.Element} The tooltip.
 */
function ChartTooltip({ id, month, index, layout }) {
  return (
    <div
      id={id}
      role="tooltip"
      className={styles.tooltip}
      style={{ left: tooltipLeft(index, layout), top: MARGIN.top, width: TOOLTIP_WIDTH }}
    >
      <p className={styles.tooltipTitle}>{formatLongMonthYear(month.month)}</p>
      <ul className={styles.tooltipRows}>
        {VOLUME_SERIES.map((series) => (
          <li key={series.key} className={styles.tooltipRow}>
            <span className={styles.lineKey} style={{ background: series.color }} aria-hidden="true" />
            <span className={styles.tooltipValue}>{formatWholeCurrency(month[series.key])}</span>
            <span className={styles.tooltipName}>{series.label}</span>
          </li>
        ))}
      </ul>
      <p className={styles.tooltipNet}>
        <span className={styles.tooltipName}>Net</span>
        <span className={styles.tooltipValue}>{formatSignedWholeCurrency(month.sales - month.purchases)}</span>
      </p>
    </div>
  );
}

/**
 * Renders the chart, sized to the width of its container.
 *
 * Each month's whole band is its hover and focus target. Tab moves into the
 * chart once (on the latest month), and the arrow keys, Home and End move
 * between months. The tooltip only adds detail; every figure is also in the
 * monthly breakdown table.
 *
 * @param {object} props - Chart props.
 * @param {ReadonlyArray<import("@/features/reports/monthlyVolumes.js").MonthlyVolume>} props.months - Months to plot, oldest first; some value must be above zero.
 * @returns {JSX.Element} The chart.
 */
export default function VolumeChart({ months }) {
  const [plotAreaRef, width] = useElementWidth(FALLBACK_WIDTH);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [tabStopIndex, setTabStopIndex] = useState(months.length - 1);
  const targetRefs = useRef([]);
  const tooltipId = useId();
  const layout = computeLayout(months, width);
  const shownIndex = hoveredIndex ?? focusedIndex;

  /**
   * Moves keyboard focus between months with the arrow keys, Home and End.
   *
   * The keyboard takes over from the pointer, so the tooltip follows the
   * focused month even while the pointer rests on the chart.
   *
   * @param {import("react").KeyboardEvent<HTMLButtonElement>} event - Key event from a month.
   * @param {number} index - Index of the month that has focus.
   */
  const handleKeyDown = (event, index) => {
    const targetIndex = keyTargetIndex(event.key, index, months.length);
    if (targetIndex === null) {
      return;
    }
    event.preventDefault();
    setHoveredIndex(null);
    setTabStopIndex(targetIndex);
    targetRefs.current[targetIndex]?.focus();
  };

  return (
    <div ref={plotAreaRef} className={styles.plotArea}>
      <svg width={layout.width} height={layout.height} className={styles.svg} role="img" aria-label={describeChart(months)}>
        {shownIndex !== null && (
          <rect x={layout.bandLeft(shownIndex)} y={MARGIN.top} width={layout.bandWidth} height={PLOT_HEIGHT} className={styles.hoverBand} />
        )}
        <ValueAxis layout={layout} />
        <Columns months={months} layout={layout} />
        <line
          x1={MARGIN.left}
          x2={layout.width - MARGIN.right}
          y1={layout.baselineY + PIXEL_CENTER}
          y2={layout.baselineY + PIXEL_CENTER}
          className={styles.baseline}
        />
        <PeakLabels months={months} layout={layout} />
        <MonthAxis months={months} layout={layout} />
      </svg>
      <div
        role="group"
        aria-label="Months. Use the arrow keys to move between months."
        className={styles.hitLayer}
        style={{ left: MARGIN.left, top: MARGIN.top, width: layout.plotWidth, height: PLOT_HEIGHT + MARGIN.bottom }}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        {months.map((month, index) => (
          <button
            key={month.month}
            ref={(element) => {
              targetRefs.current[index] = element;
            }}
            type="button"
            className={styles.hitTarget}
            tabIndex={index === tabStopIndex ? 0 : -1}
            aria-label={describeMonth(month)}
            aria-describedby={shownIndex === index ? tooltipId : undefined}
            onPointerEnter={() => setHoveredIndex(index)}
            onFocus={() => {
              setFocusedIndex(index);
              setTabStopIndex(index);
            }}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        ))}
      </div>
      {shownIndex !== null && <ChartTooltip id={tooltipId} month={months[shownIndex]} index={shownIndex} layout={layout} />}
    </div>
  );
}
