"use client";

import { useMemo, useState } from "react";
import styles from "./advanced.module.css";

function sanitize(config) {
  const min = Number.isInteger(config?.min) ? config.min : 1;
  const max = Number.isInteger(config?.max) ? config.max : 5;
  return {
    label: typeof config?.label === "string" ? config.label : "Rating",
    min: Math.min(min, max),
    max: Math.max(min, max),
    value: Math.min(Math.max(Number(config?.value) || min, Math.min(min, max)), Math.max(min, max))
  };
}

export default function InterfacePreview({ preview }) {
  const initial = useMemo(() => sanitize(preview?.config), [preview]);
  const [config, setConfig] = useState(initial);
  const [text, setText] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState("");

  const updateText = (value) => {
    setText(value);
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed?.label !== "string") throw new Error("label must be a string");
      if (!Number.isInteger(parsed?.min) || !Number.isInteger(parsed?.max)) {
        throw new Error("min and max must be integers");
      }
      if (parsed.min >= parsed.max) throw new Error("min must be less than max");
      if (parsed.max - parsed.min > 10) throw new Error("use a range of 10 or fewer steps");
      setConfig(sanitize(parsed));
      setError("");
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  const setValue = (value) => {
    const next = { ...config, value };
    setConfig(next);
    setText(JSON.stringify(next, null, 2));
  };

  const steps = [];
  for (let value = config.min; value <= config.max; value += 1) steps.push(value);

  return (
    <div className={styles.interfacePreview}>
      <div className={styles.interfaceHead}>
        <span className={styles.interfaceTitle}>{preview?.title || "Custom interface"}</span>
        <span className={styles.pill}>defineInterface</span>
      </div>
      <p className={styles.interfaceDescription}>{preview?.description}</p>
      <div className={styles.interfaceGrid}>
        <div>
          <textarea
            aria-label="Interface configuration JSON"
            className={styles.interfaceConfig}
            value={text}
            spellCheck={false}
            onChange={(event) => updateText(event.target.value)}
          />
          {error ? <div className={styles.interfaceError}>JSON: {error}</div> : null}
        </div>
        <div className={styles.ratingPanel}>
          <span className={styles.ratingLabel}>{config.label}</span>
          <div className={styles.ratingButtons} role="radiogroup" aria-label={config.label}>
            {steps.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={value === config.value}
                className={`${styles.ratingButton} ${value <= config.value ? styles.ratingButtonActive : ""}`}
                onClick={() => setValue(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <span className={styles.ratingValue}>value: {config.value}</span>
        </div>
      </div>
    </div>
  );
}
