"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import styles from "./builderLab.module.css";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone }
];

export default function BuilderPreview({
  embedUrl,
  providerLabel = "CMS",
  spec,
  device,
  onDeviceChange,
  health
}) {
  const iframeRef = useRef(null);
  const retriedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [nonce, setNonce] = useState(0);

  const sendSpec = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !spec) return;
    iframeRef.current.contentWindow.postMessage(
      { source: "lumina-lab", type: "render", spec },
      "*"
    );
  }, [spec]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "lumina-embed") return;
      if (data.type === "ready") {
        setReady(true);
        setSlow(false);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sendSpec();
  }, [ready, sendSpec]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      sendSpec();
    }, 220);
    return () => clearTimeout(timer);
  }, [spec, ready, sendSpec]);

  useEffect(() => {
    if (health !== "online" || ready) return undefined;
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, [health, ready]);

  useEffect(() => {
    if (!slow || ready || health !== "online" || retriedRef.current) return undefined;
    // The Keystone dev page may serve an empty shell on its first request.
    const timer = setTimeout(() => {
      retriedRef.current = true;
      setReady(false);
      setNonce((value) => value + 1);
    }, 80);
    return () => clearTimeout(timer);
  }, [slow, ready, health]);

  const refresh = () => {
    retriedRef.current = false;
    setReady(false);
    setSlow(false);
    setNonce((value) => value + 1);
  };

  const iframeSrc = embedUrl ? embedUrl.replace(/\/+$/, "") : "";
  const showOffline = health === "offline";

  return (
    <section className={styles.previewPanel} aria-label={`${providerLabel} component preview`}>
      <div className={styles.previewToolbar}>
        <div className={styles.renderBadge}>
          <span className={styles.renderDot} />
          Rendered by {providerLabel}
        </div>

        <div className={styles.previewActions}>
          <div className={styles.segmented} role="group" aria-label="Preview width">
            {DEVICES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.iconButton} ${
                    device === item.id ? styles.iconButtonActive : ""
                  }`}
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
            aria-label="Reload preview"
            title="Reload preview"
            onClick={refresh}
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      <div className={styles.previewStage}>
        <div className={`${styles.deviceFrame} ${styles[device] || ""}`}>
          {showOffline ? (
            <div className={styles.previewMessage}>
              <strong>{providerLabel} is offline.</strong>
              <span>
                Start {providerLabel} at {embedUrl || "the configured URL"} to render
                the live component.
              </span>
            </div>
          ) : health === "checking" ? (
            <div className={styles.previewMessage}>
              <strong>Connecting to {providerLabel}…</strong>
              <span>The preview will load when the CMS responds.</span>
            </div>
          ) : iframeSrc ? (
            <>
              <iframe
                key={nonce}
                ref={iframeRef}
                title={`${providerLabel} component preview`}
                className={styles.iframe}
                src={iframeSrc}
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => {
                  iframeRef.current?.contentWindow?.postMessage(
                    { source: "lumina-lab", type: "hello" },
                    "*"
                  );
                }}
              />
              {!ready ? (
                <div className={styles.previewLoading} aria-live="polite">
                  {slow
                    ? `Still waiting for ${providerLabel}. Check the CMS server.`
                    : `Starting the ${providerLabel} renderer…`}
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.previewMessage}>
              <strong>Preview URL missing.</strong>
              <span>Set the CMS public URL and reload the page.</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.previewMeta}>
        <span>{DEVICES.find((item) => item.id === device)?.label || "Desktop"}</span>
        <span>
          {ready ? `Live from ${providerLabel}` : `Waiting for ${providerLabel}`}
        </span>
      </div>
    </section>
  );
}
