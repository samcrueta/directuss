"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./charts.module.css";
import { FALLBACK_DATASETS, readStoredDataset } from "@/lib/datasetData";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

function formatFetchedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return `${date.toISOString().slice(11, 16)} UTC`;
}

function tooltipStyles() {
  return {
    contentStyle: {
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
    },
    labelStyle: { color: "var(--text-primary)" },
    itemStyle: { color: "var(--text-secondary)" },
  };
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    number,
  );
}

function joinList(items) {
  if (items.length <= 1) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function buildOverviewMetrics(rows) {
  const maxValue = Math.max(...rows.map((row) => row.value), 0);
  const captions = [
    "Lead signal",
    "Next strongest signal",
    "Supporting signal",
    "Emerging signal",
  ];

  return captions.map((hint, index) => {
    const row = rows[index];
    const value =
      row && maxValue > 0 ? Math.round((row.value / maxValue) * 100) : 0;

    return {
      label: `Data point ${index + 1}`,
      value: `${value}%`,
      hint,
    };
  });
}

function Metric({ label, value, hint }) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      <strong className={styles.metricValue}>{value}</strong>
      <span className={styles.metricHint}>{hint}</span>
    </div>
  );
}

function ChartCard({
  id,
  title,
  description,
  summary,
  empty,
  emptyMessage,
  headingLevel = "h3",
  children,
}) {
  const Heading = headingLevel;

  return (
    <section className={styles.chartCard} aria-labelledby={id}>
      <div className={styles.chartHead}>
        <div>
          <Heading id={id} className={styles.chartTitle}>
            {title}
          </Heading>
          <p className={styles.chartCopy}>{description}</p>
        </div>
      </div>

      {empty ? (
        <div className={styles.chartEmpty}>{emptyMessage}</div>
      ) : (
        <div className={styles.chartBox}>{children}</div>
      )}

      <p className={styles.chartSummary}>{summary}</p>
    </section>
  );
}

export default function ChartShowcase({ data, copy, mode = "full" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const provider = data.provider || "directus";
  const [storedDataset, setStoredDataset] = useState(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStoredDataset(readStoredDataset(provider));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [provider]);

  const dataset =
    storedDataset || FALLBACK_DATASETS[provider] || FALLBACK_DATASETS.directus;
  const localChartRows = storedDataset?.rows.map((row) => ({
    name: row.label,
    label: row.label,
    value: row.value,
    short: row.label,
    day: row.label,
  }));
  const overviewMetrics = buildOverviewMetrics(dataset.rows);
  const hydratedData = {
    ...data,
    charts: {
      ...data.charts,
      ...(localChartRows
        ? {
            lessonsByTrack: localChartRows,
            recordsByStatus: localChartRows,
          }
        : {}),
      table: {
        ...data.charts.table,
        title: dataset.title,
        caption: dataset.caption,
        unit: dataset.unit,
        rows: dataset.rows.map((row) => ({
          name: row.label,
          value: row.value,
        })),
        total: dataset.rows.reduce((sum, row) => sum + row.value, 0),
        count: dataset.rows.length,
        source: storedDataset ? "local" : "sample",
        savedAt: null,
      },
    },
  };
  const { charts, source, fetchedAt } = hydratedData;
  const preview = mode === "preview";
  const headingLevel = preview ? "h3" : "h2";

  const isLive = source !== "fallback";
  const trackTotal = charts.lessonsByTrack.reduce(
    (total, item) => total + item.value,
    0,
  );
  const statusTotal = charts.recordsByStatus.reduce(
    (total, item) => total + item.value,
    0,
  );
  const statuses = charts.recordsByStatus
    .map((item) => `${item.value} ${item.name.toLowerCase()}`)
    .join(", ");
  const recordPlural = copy.recordPlural || "records";
  const recordSeries =
    recordPlural.charAt(0).toUpperCase() + recordPlural.slice(1);

  const chartCopy = copy.charts;
  const tableCopy = chartCopy.table || {
    title: "Saved form data",
    description: "The newest numeric table saved from the Level 7 data lab.",
    empty: "Save a table in the Level 7 data lab to populate this chart.",
  };
  const tableTrendCopy = chartCopy.tableTrend || {
    title: "Responsive trend from your table",
    description:
      "The same editable rows rendered as a trend so you can compare chart grammars.",
    empty: "Save a table in the Level 7 data lab to populate this chart.",
  };
  const tableRows = charts.table?.rows || [];
  const tableTotal = charts.table?.total || 0;
  const tableIsLive = charts.table?.source !== "sample";
  const contentTitle = storedDataset?.title || "Data overview";
  return (
    <div className={styles.showcase}>
      <div className={styles.sourceBar}>
        <div className={styles.sourceStatus}>
          <span
            className={`${styles.sourceBadge} ${
              isLive ? styles.sourceLive : styles.sourceSample
            }`}
          >
            <span className={styles.sourceDot} aria-hidden="true" />
            {isLive ? copy.sourceLive : copy.sourceSample}
          </span>
          <span className={styles.sourceTime}>
            Fetched {formatFetchedAt(fetchedAt)}
          </span>
        </div>

        {!preview ? (
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
          >
            <RefreshCw
              size={13}
              className={isPending ? styles.spin : undefined}
            />
            {isPending ? "Refreshing…" : "Refresh data"}
          </button>
        ) : null}
      </div>

      <div className={styles.metricGrid}>
        {overviewMetrics.map((metric) => (
          <Metric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
          />
        ))}
      </div>

      <div className={preview ? styles.chartGridPreview : styles.chartGrid}>
        <ChartCard
          id="chart-lessons-by-track"
          headingLevel={headingLevel}
          title={`${contentTitle} — See how your data are structured`}
          description={chartCopy.tracks.description}
          summary={
            trackTotal
              ? joinList(
                  charts.lessonsByTrack.map(
                    (item) => `${item.value} ${item.name}`,
                  ),
                ) + "."
              : chartCopy.tracks.empty
          }
          empty={!trackTotal}
          emptyMessage={chartCopy.tracks.empty}
        >
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.lessonsByTrack}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {charts.lessonsByTrack.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyles()} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry) => (
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.74rem",
                      }}
                    >
                      {entry?.payload?.short || value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter} aria-hidden="true">
              <strong>{trackTotal}</strong>
              <span>lessons</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          id="chart-records-by-status"
          headingLevel={headingLevel}
          title={`${contentTitle} — Track every record at a glance`}
          description={chartCopy.status.description}
          summary={
            statusTotal
              ? `${statusTotal} ${recordPlural}: ${statuses}.`
              : chartCopy.status.empty
          }
          empty={!statusTotal}
          emptyMessage={chartCopy.status.empty}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.recordsByStatus}
              layout="vertical"
              margin={{ top: 4, right: 18, bottom: 4, left: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={82}
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                {...tooltipStyles()}
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              />
              <Bar
                dataKey="value"
                name={recordSeries}
                maxBarSize={30}
                radius={[0, 6, 6, 0]}
                isAnimationActive={false}
              >
                {charts.recordsByStatus.map((item, index) => (
                  <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="chart-saved-table"
          headingLevel={headingLevel}
          title={`${contentTitle} — Turn your data into a clear visual`}
          description={charts.table?.caption || tableCopy.description}
          summary={
            tableRows.length
              ? `${charts.table.title}: ${tableRows.length} rows, ${formatNumber(
                  tableTotal,
                )} ${charts.table.unit || "total"}${
                  tableIsLive
                    ? ` · saved ${formatFetchedAt(charts.table.savedAt)}`
                    : " · sample rows until a table is saved"
                }.`
              : tableCopy.empty
          }
          empty={!tableRows.length}
          emptyMessage={tableCopy.empty}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tableRows}
              margin={{ top: 10, right: 12, bottom: 0, left: -18 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                {...tooltipStyles()}
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              />
              <Bar
                dataKey="value"
                name={charts.table?.unit || "Value"}
                fill="var(--accent)"
                maxBarSize={44}
                radius={[5, 5, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          id="chart-saved-table-trend"
          headingLevel={headingLevel}
          title={`${contentTitle} — Spot the trends behind your numbers`}
          description={tableTrendCopy.description}
          summary={
            tableRows.length
              ? `The same ${tableRows.length} editable rows are shown as a responsive trend.`
              : tableTrendCopy.empty
          }
          empty={!tableRows.length}
          emptyMessage={tableTrendCopy.empty}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={tableRows}
              margin={{ top: 10, right: 12, bottom: 0, left: -18 }}
            >
              <defs>
                <linearGradient
                  id="savedTableTrendFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--accent)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip {...tooltipStyles()} />
              <Area
                type="monotone"
                dataKey="value"
                name={charts.table?.unit || "Value"}
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#savedTableTrendFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}
