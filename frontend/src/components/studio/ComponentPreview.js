"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import styles from "./studio.module.css";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone }
];

let messageId = 0;

export default function ComponentPreview({
  mode,
  savedUrl,
  savedSrcDoc,
  savedLabel = "Saved",
  savedPreviewTitle = "Saved component preview",
  savedBadge = "Saved version",
  srcDoc,
  device,
  nonce,
  health,
  onModeChange,
  onDeviceChange,
  onRefresh
}) {
  const iframeRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "lumina-component") return;

      setMessages((current) => [
        ...current.slice(-23),
        {
          id: ++messageId,
          type: data.type === "error" ? "error" : "console",
          level: data.level || "log",
          text: String(data.text ?? "")
        }
      ]);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const hasSaved = Boolean(savedUrl || savedSrcDoc);
  const usingSaved = mode === "saved" && hasSaved;
  const serverSaved = Boolean(savedUrl);
  const savedDisabled = !hasSaved || (serverSaved && health === "offline");
  const iframeKey = `${usingSaved ? "saved" : "draft"}-${nonce}`;
  const errorCount = messages.filter(
    (message) => message.type === "error" || message.level === "error"
  ).length;

  return (
    <section className={styles.panel} aria-label="Component preview">
      <div className={styles.previewToolbar}>
        <div className={styles.segmented} role="group" aria-label="Preview renderer">
          <button
            type="button"
            className={`${styles.segment} ${!usingSaved ? styles.segmentActive : ""}`}
            aria-pressed={!usingSaved}
            onClick={() => {
              setMessages([]);
              onModeChange("draft");
            }}
          >
            Live draft
          </button>
          <button
            type="button"
            className={`${styles.segment} ${usingSaved ? styles.segmentActive : ""}`}
            aria-pressed={usingSaved}
            disabled={savedDisabled}
            title={
              savedDisabled
                ? `Save the component first${serverSaved && health === "offline" ? " and start the server" : ""}`
                : `Render the saved version from ${savedLabel}`
            }
            onClick={() => {
              setMessages([]);
              onModeChange("saved");
            }}
          >
            {savedLabel}
          </button>
        </div>

        <div className={styles.previewActions}>
          <div className={styles.segmented} role="group" aria-label="Preview width">
            {DEVICES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.iconButton} ${device === item.id ? styles.iconButtonActive : ""}`}
                  aria-label={item.label}
                  title={item.label}
                  aria-pressed={device === item.id}
                  onClick={() => onDeviceChange(item.id)}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Refresh preview"
            title="Refresh preview"
            onClick={() => {
              setMessages([]);
              onRefresh();
            }}
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      <div className={styles.previewStage}>
        <div className={`${styles.deviceFrame} ${styles[device]}`}>
          {usingSaved ? (
            serverSaved ? (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                title={savedPreviewTitle}
                className={styles.iframe}
                src={`${savedUrl}?v=${nonce}`}
                sandbox="allow-scripts allow-forms"
              />
            ) : (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                title={savedPreviewTitle}
                className={styles.iframe}
                srcDoc={savedSrcDoc}
                sandbox="allow-scripts allow-forms"
              />
            )
          ) : (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="Live component preview"
              className={styles.iframe}
              srcDoc={srcDoc}
              sandbox="allow-scripts allow-forms"
            />
          )}
        </div>
      </div>

      <div className={styles.previewMeta}>
        <span className={`${styles.renderBadge} ${usingSaved ? styles.renderBadgeDirectus : ""}`}>
          {usingSaved ? savedBadge : "Live draft"}
        </span>
        <span className={styles.previewWidth}>
          {DEVICES.find((item) => item.id === device)?.label}
        </span>
      </div>

      <div className={styles.console}>
        <div className={styles.consoleHead}>
          <span className={styles.consoleTitle}>
            Preview console
            {errorCount ? <span className={styles.errorDot}>{errorCount}</span> : null}
          </span>
          <button
            type="button"
            className={styles.consoleClear}
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
          >
            Clear
          </button>
        </div>
        <div className={styles.consoleList} aria-live="polite">
          {messages.length === 0 ? (
            <span className={styles.consoleEmpty}>No messages from the component.</span>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={styles.consoleLine}>
                <span
                  className={`${styles.consoleLevel} ${
                    message.type === "error" || message.level === "error"
                      ? styles.consoleLevelError
                      : message.level === "warn"
                        ? styles.consoleLevelWarn
                        : ""
                  }`}
                >
                  {message.type === "error" ? "error" : message.level}
                </span>
                <span className={styles.consoleText}>{message.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
