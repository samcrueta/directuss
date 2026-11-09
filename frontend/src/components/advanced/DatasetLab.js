"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Database,
  RotateCcw,
  Save
} from "lucide-react";
import BuilderFields from "./BuilderFields";
import {
  DATASET_DEFAULTS,
  DATASET_FIELDS,
  TOKEN_DEFAULTS,
  TOKEN_FIELDS
} from "@/lib/builderCatalog";
import { readStoredDataset, writeStoredDataset } from "@/lib/datasetData";
import builderStyles from "./builderLab.module.css";
import styles from "./datasetLab.module.css";

const PROVIDERS = {
  directus: { label: "Directus" },
  payload: { label: "Payload" },
  keystone: { label: "Keystone" }
};

const clone = (value) => JSON.parse(JSON.stringify(value ?? {}));

function formatRelative(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(number);
}

function safeRows(content) {
  const rows = Array.isArray(content?.rows) ? content.rows : [];
  return rows.slice(0, 12).map((row, index) => ({
    label: String(row?.label || `Row ${index + 1}`),
    value: Number.isFinite(Number(row?.value)) ? Number(row.value) : 0
  }));
}

function shadowValue(shadow) {
  if (shadow === "none") return "none";
  if (shadow === "strong") return "0 24px 60px rgba(15, 23, 42, 0.28)";
  return "0 18px 44px rgba(15, 23, 42, 0.14)";
}

function DatasetPreview({ content, tokens }) {
  const dark = tokens.theme === "dark";
  const rows = safeRows(content);
  const accent = tokens.accent || TOKEN_DEFAULTS.accent;
  const tableMax = Math.max(...rows.map((row) => Math.abs(row.value)), 1);

  return (
    <div
      className={styles.preview}
      data-theme={dark ? "dark" : "light"}
      style={{
        background: tokens.background || TOKEN_DEFAULTS.background,
        color: tokens.foreground || TOKEN_DEFAULTS.foreground,
        "--accent": accent,
        padding: `${Math.max(12, Number(tokens.spacing) || 24)}px`
      }}
    >
      <div
        className={styles.card}
        style={{
          background: dark ? "rgba(15, 23, 42, 0.82)" : "#ffffff",
          borderColor: dark ? "rgba(148, 163, 184, 0.28)" : "rgba(15, 23, 42, 0.1)",
          borderRadius: `${Number(tokens.radius) || 14}px`,
          boxShadow: shadowValue(tokens.shadow)
        }}
      >
        <div className={styles.cardHead}>
          <div>
            <p className={styles.eyebrow}>
              <Database size={12} /> Saved data table
            </p>
            <h5 className={styles.cardTitle} style={{ fontSize: `${1.05 * (Number(tokens.fontScale) || 1)}rem` }}>
              {content?.title || "Untitled table"}
            </h5>
            {content?.caption ? <p className={styles.caption}>{content.caption}</p> : null}
          </div>
          {content?.unit ? <span className={styles.unit}>{content.unit}</span> : null}
        </div>

        <div className={styles.bars} aria-hidden="true">
          {rows.map((row, index) => (
            <div key={`${row.label}-${index}`} className={styles.barRow}>
              <span>{row.label}</span>
              <div className={styles.barTrack}>
                <span
                  className={styles.barFill}
                  style={{
                    width: `${Math.max(4, (Math.abs(row.value) / tableMax) * 100)}%`,
                    background: accent
                  }}
                />
              </div>
              <strong>{formatNumber(row.value)}</strong>
            </div>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Label</th>
                <th scope="col">{content?.unit || "Value"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.label}-${index}`}>
                  <td>{row.label}</td>
                  <td>{formatNumber(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartPreview({ content, tokens, chartType = "bar" }) {
  const rows = safeRows(content);
  const accent = tokens.accent || TOKEN_DEFAULTS.accent;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const total = Math.max(rows.reduce((sum, row) => sum + Math.max(0, row.value), 0), 1);
  const points = rows
    .map((row, index) => {
      const x = rows.length > 1 ? (index / (rows.length - 1)) * 100 : 50;
      const y = 92 - (Math.max(0, row.value) / max) * 76;
      return `${x},${y}`;
    })
    .join(" ");
  const chartColors = rows.map((_, index) =>
    `hsl(${(index * 47 + 230) % 360} 75% 55%)`
  );
  const polarPoint = (angle, radius = 38) => ({
    x: 50 + Math.cos(angle - Math.PI / 2) * radius,
    y: 50 + Math.sin(angle - Math.PI / 2) * radius
  });
  const pieSegments = rows.reduce((segments, row, index) => {
    const start = segments.length ? segments[segments.length - 1].end : 0;
    const end = start + (Math.max(0, row.value) / total) * Math.PI * 2;
    segments.push({ row, index, start, end });
    return segments;
  }, []);
  const radarPoints = rows
    .map((row, index) => {
      const angle = (index / Math.max(rows.length, 3)) * Math.PI * 2;
      const point = polarPoint(angle, 38 * (Math.max(0, row.value) / max));
      return `${point.x},${point.y}`;
    })
    .join(" ");
  const radarGrid = [0.35, 0.7, 1].map((scale) =>
    rows
      .map((_, index) => {
        const point = polarPoint((index / Math.max(rows.length, 3)) * Math.PI * 2, 38 * scale);
        return `${point.x},${point.y}`;
      })
      .join(" ")
  );
  const typeLabel = {
    bar: "Bar chart",
    line: "Line chart",
    area: "Area chart",
    pie: "Pie chart",
    doughnut: "Doughnut chart",
    radar: "Radar chart"
  }[chartType] || "Chart";

  return (
    <div
      className={styles.chartPreview}
      data-theme={tokens.theme === "dark" ? "dark" : "light"}
      style={{
        background: tokens.background || TOKEN_DEFAULTS.background,
        color: tokens.foreground || TOKEN_DEFAULTS.foreground,
        "--accent": accent,
        padding: `${Math.max(12, Number(tokens.spacing) || 24)}px`
      }}
    >
      <div className={styles.chartGrid}>
        {chartType === "bar" ? (
        <section className={styles.chartCard} aria-label="Responsive bar chart preview">
          <div className={styles.chartCardHead}>
            <div>
              <p className={styles.eyebrow}>Bar chart</p>
              <h5 className={styles.cardTitle}>{content?.title || "Untitled chart"}</h5>
            </div>
            <span className={styles.unit}>{content?.unit || "value"}</span>
          </div>
          <div className={styles.chartBars}>
            {rows.map((row, index) => (
              <div className={styles.chartBarItem} key={`${row.label}-${index}`}>
                <span className={styles.chartBarValue}>{formatNumber(row.value)}</span>
                <span
                  className={styles.chartBar}
                  style={{ height: `${Math.max(8, (Math.max(0, row.value) / max) * 100)}%` }}
                />
                <span className={styles.chartLabel}>{row.label}</span>
              </div>
            ))}
          </div>
        </section>
        ) : chartType === "pie" || chartType === "doughnut" ? (
        <section className={styles.chartCard} aria-label={`Responsive ${typeLabel.toLowerCase()} preview`}>
          <div className={styles.chartCardHead}>
            <div>
              <p className={styles.eyebrow}>{typeLabel}</p>
              <h5 className={styles.cardTitle}>{content?.title || "Untitled chart"}</h5>
            </div>
            <span className={styles.unit}>{content?.unit || "value"}</span>
          </div>
          <div className={styles.circularChart}>
            <svg viewBox="0 0 100 100" role="img" aria-label={`Editable ${typeLabel.toLowerCase()}`}>
              {pieSegments.map(({ row, index, start, end }) => {
                const from = polarPoint(start);
                const to = polarPoint(end);
                const largeArc = end - start > Math.PI ? 1 : 0;
                const path = `M 50 50 L ${from.x} ${from.y} A 38 38 0 ${largeArc} 1 ${to.x} ${to.y} Z`;
                return (
                  <path
                    key={`${row.label}-${index}`}
                    d={path}
                    fill={chartColors[index]}
                    className={styles.pieSlice}
                  />
                );
              })}
              {chartType === "doughnut" ? <circle cx="50" cy="50" r="20" className={styles.doughnutHole} /> : null}
            </svg>
          </div>
          <div className={styles.legend}>
            {rows.map((row, index) => (
              <span className={styles.legendItem} key={`${row.label}-${index}`}>
                <i style={{ background: chartColors[index] }} /> {row.label} <strong>{formatNumber(row.value)}</strong>
              </span>
            ))}
          </div>
        </section>
        ) : chartType === "radar" ? (
        <section className={styles.chartCard} aria-label="Responsive radar chart preview">
          <div className={styles.chartCardHead}>
            <div>
              <p className={styles.eyebrow}>Radar chart</p>
              <h5 className={styles.cardTitle}>{content?.title || "Untitled chart"}</h5>
            </div>
            <span className={styles.unit}>{content?.unit || "value"}</span>
          </div>
          <div className={styles.radarChart}>
            <svg viewBox="0 0 100 100" role="img" aria-label="Editable radar chart">
              {radarGrid.map((grid, index) => <polygon key={index} points={grid} className={styles.radarGrid} />)}
              <polygon points={radarPoints} className={styles.radarShape} />
              {rows.map((row, index) => {
                const point = polarPoint((index / Math.max(rows.length, 3)) * Math.PI * 2, 43);
                return <text key={`${row.label}-${index}`} x={point.x} y={point.y} className={styles.radarLabel}>{row.label}</text>;
              })}
            </svg>
          </div>
        </section>
        ) : (
        <section className={styles.chartCard} aria-label="Responsive trend chart preview">
          <div className={styles.chartCardHead}>
            <div>
              <p className={styles.eyebrow}>{typeLabel}</p>
              <h5 className={styles.cardTitle}>{content?.title || "Change over time"}</h5>
            </div>
            <span className={styles.unit}>{rows.length} points</span>
          </div>
          <div className={styles.lineChart}>
            <svg viewBox="0 0 100 100" role="img" aria-label="Editable data trend">
              <line x1="0" y1="92" x2="100" y2="92" className={styles.chartAxis} />
              {chartType === "area" ? <polygon points={`0,92 ${points} 100,92`} className={styles.chartArea} /> : null}
              <polyline points={points} fill="none" className={styles.chartLine} />
              {rows.map((row, index) => {
                const x = rows.length > 1 ? (index / (rows.length - 1)) * 100 : 50;
                const y = 92 - (Math.max(0, row.value) / max) * 76;
                return <circle key={`${row.label}-${index}`} cx={x} cy={y} r="1.8" className={styles.chartPoint} />;
              })}
            </svg>
          </div>
          <div className={styles.chartFooter}>
            <span>{rows[0]?.label || "Start"}</span>
            <strong>{formatNumber(rows[rows.length - 1]?.value || 0)} {content?.unit || ""}</strong>
            <span>{rows[rows.length - 1]?.label || "End"}</span>
          </div>
        </section>
        )}
      </div>
    </div>
  );
}

export default function DatasetLab({ lesson, provider = "directus" }) {
  const config = PROVIDERS[provider] || PROVIDERS.directus;
  const lab = lesson.lab || {};
  const starter = useMemo(
    () => ({
      content: clone(lab.starter?.content || DATASET_DEFAULTS),
      tokens: { ...TOKEN_DEFAULTS, ...(lab.starter?.tokens || {}) }
    }),
    [lab.starter]
  );
  const [content, setContent] = useState(starter.content);
  const [tokens, setTokens] = useState(starter.tokens);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [checks, setChecks] = useState(() => (lab.checklist || []).map(() => false));
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStoredDataset(provider);
      if (stored) setContent(stored);
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [provider]);

  const markDirty = () => {
    setDirty(true);
    setSuccess("");
  };

  const handleReset = () => {
    setContent(clone(starter.content));
    setTokens({ ...starter.tokens });
    setSavedAt(null);
    setDirty(false);
    setSuccess("");
  };

  const save = () => {
    setSaving(true);
    setSuccess("");
    writeStoredDataset(provider, content, {
      lessonSlug: lesson.slug,
      tokens
    });
    setSavedAt(new Date().toISOString());
    setDirty(false);
    setSuccess("Saved locally. Level 8 will use this table.");
    setSaving(false);
  };

  const toggleCheck = (index) => {
    setChecks((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? !value : value))
    );
  };

  const statusText = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : savedAt
        ? `Saved ${formatRelative(savedAt)}`
        : "Not saved yet";

  useEffect(() => {
    if (!storageReady) return;
    writeStoredDataset(provider, content, {
      lessonSlug: lesson.slug,
      tokens
    });
  }, [content, lesson.slug, provider, storageReady, tokens]);

  return (
    <div className={builderStyles.lab}>
      <div className={builderStyles.labHead}>
        <div>
          <div className={builderStyles.kicker}>{config.label} {lab.kind === "chart" ? "chart lab" : "data lab"}</div>
          <h3 className={builderStyles.title}>{lab.title}</h3>
        </div>
        <div className={builderStyles.headMeta}>
          <span className={builderStyles.kindPill}>{lab.kind === "chart" ? "Two charts" : "Data table"}</span>
          <span className={builderStyles.health}>Saved in this browser</span>
        </div>
      </div>

      <p className={builderStyles.brief}>{lab.brief}</p>

      {lab.checklist?.length ? (
        <div className={builderStyles.checklist} aria-label="Lab checklist">
          {lab.checklist.map((item, index) => (
            <label key={item} className={builderStyles.checkItem}>
              <input
                type="checkbox"
                checked={checks[index] || false}
                onChange={() => toggleCheck(index)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      ) : null}

      <div className={builderStyles.workspace}>
        <section className={builderStyles.panel} aria-label={`${config.label} data table form`}>
          <div className={builderStyles.panelHead}>
            <div>
              <div className={builderStyles.panelKicker}>Form</div>
              <h4 className={builderStyles.panelTitle}>Numbers and labels</h4>
            </div>
            <span
              className={`${builderStyles.statusChip} ${
                dirty
                  ? builderStyles.statusDirty
                  : savedAt
                    ? builderStyles.statusPublished
                    : builderStyles.statusDraft
              }`}
            >
              {statusText}
            </span>
          </div>

          <div className={builderStyles.controls}>
            <details className={builderStyles.controlGroup} open>
              <summary>Table content</summary>
              <BuilderFields
                fields={DATASET_FIELDS}
                value={content}
                onChange={(next) => {
                  setContent(next);
                  markDirty();
                }}
                idPrefix="dataset"
              />
            </details>

            <details className={builderStyles.controlGroup}>
              <summary>Design tokens</summary>
              <BuilderFields
                fields={TOKEN_FIELDS}
                value={tokens}
                onChange={(next) => {
                  setTokens(next);
                  markDirty();
                }}
                idPrefix="dataset-tokens"
              />
            </details>
          </div>

          <div className={builderStyles.actionBar}>
            <button
              type="button"
              className={builderStyles.primaryButton}
              onClick={save}
              disabled={saving}
            >
              <Save size={14} />
              {saving ? "Saving…" : "Save locally"}
            </button>
            <button type="button" className={builderStyles.ghostButton} onClick={handleReset}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          {success ? (
            <div className={builderStyles.successMessage}>
              <CheckCircle2 size={14} />
              <span>{success}</span>
            </div>
          ) : null}
        </section>

        <div className={styles.side}>
          <section className={builderStyles.panel} aria-label="Live table preview">
            <div className={builderStyles.panelHead}>
              <div>
                <div className={builderStyles.panelKicker}>Preview</div>
                <h4 className={builderStyles.panelTitle}>
                  {lab.kind === "chart" ? "The responsive charts" : "The saved table"}
                </h4>
              </div>
            </div>
            {lab.kind === "chart" ? (
              <ChartPreview
                content={content}
                tokens={tokens}
                chartType={lab.chartType}
              />
            ) : (
              <DatasetPreview content={content} tokens={tokens} />
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
