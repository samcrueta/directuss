"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { Check, Copy, Lightbulb, Play, RotateCcw, Square, Terminal } from "lucide-react";
import InterfacePreview from "./InterfacePreview";
import styles from "./advanced.module.css";

let entryId = 0;

export default function CodeLab({ lab }) {
  const starter = typeof lab.starter === "string" ? lab.starter : "";
  const solution = typeof lab.solution === "string" ? lab.solution : starter;
  const instructions = typeof lab.instructions === "string" ? lab.instructions : "";
  const [code, setCode] = useState(starter);
  const [entries, setEntries] = useState([]);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [hintsOpen, setHintsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const keepAliveRef = useRef(null);

  const append = useCallback((level, text) => {
    setEntries((current) => [...current, { id: ++entryId, level, text }]);
  }, []);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (keepAliveRef.current) clearTimeout(keepAliveRef.current);
    timeoutRef.current = null;
    keepAliveRef.current = null;
  }, []);

  const terminate = useCallback(() => {
    clearTimers();
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, [clearTimers]);

  const run = useCallback(() => {
    if (!code.trim()) return;
    terminate();
    setEntries([]);
    setResult(null);
    setStatus("running");

    let worker;
    try {
      worker = new Worker("/lab-worker.js");
    } catch (error) {
      setStatus("error");
      append("error", error?.message || "The lab worker could not start.");
      return;
    }
    workerRef.current = worker;

    const timeoutMs = lab.timeoutMs || 6000;
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current === worker) {
        worker.terminate();
        workerRef.current = null;
        setStatus("timeout");
        append("error", `Execution timed out after ${(timeoutMs / 1000).toFixed(1)}s.`);
      }
    }, timeoutMs);

    worker.onmessage = (event) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "log") {
        append(message.level || "log", message.text ?? "");
        return;
      }

      if (message.type === "error") {
        append("error", message.text || "Execution failed.");
        setStatus("error");
        clearTimers();
        worker.terminate();
        if (workerRef.current === worker) workerRef.current = null;
        return;
      }

      if (message.type === "done") {
        if (message.resultText != null) setResult(message.resultText);
        setStatus("done");
        clearTimers();
        if (lab.keepAliveMs) {
          keepAliveRef.current = setTimeout(() => {
            if (workerRef.current === worker) {
              worker.terminate();
              workerRef.current = null;
            }
          }, lab.keepAliveMs);
        } else {
          worker.terminate();
          if (workerRef.current === worker) workerRef.current = null;
        }
      }
    };

    worker.onerror = (event) => {
      append("error", event.message || "The lab worker crashed.");
      setStatus("error");
      clearTimers();
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };

    worker.postMessage({ code });
  }, [append, clearTimers, code, lab.keepAliveMs, lab.timeoutMs, terminate]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    terminate();
    setStatus("idle");
    append("system", "Execution stopped.");
  }, [append, terminate]);

  const reset = useCallback(() => {
    terminate();
    setCode(starter);
    setEntries([]);
    setResult(null);
    setStatus("idle");
    setHintsOpen(false);
  }, [starter, terminate]);

  const showSolution = useCallback(() => {
    setCode(solution);
    append("system", "Solution loaded. Run it to compare with the expected output.");
  }, [append, solution]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      append("warn", "Clipboard access was blocked by the browser.");
    }
  }, [append, code]);

  useEffect(() => () => terminate(), [terminate]);

  const extensions = useMemo(() => [javascript(), EditorView.lineWrapping], []);

  const running = status === "running";
  return (
    <>
      <div className={styles.lab}>
        <div className={styles.labHead}>
          <div className={styles.labTitleWrap}>
            <div className={styles.labKicker}>Interactive lab</div>
            <h3 className={styles.labTitle}>{lab.title || "Run the code"}</h3>
          </div>
          <span className={styles.health}>Local preview</span>
        </div>

        <div className={styles.labBody}>
          <p className={styles.instructions}>{instructions}</p>

          <div className={styles.editorFrame}>
            <div className={styles.editorBar}>
              <span className={styles.editorFile}>lab.js</span>
              <div className={styles.editorActions}>
                <button type="button" className={styles.ghostButton} onClick={copyCode}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className={styles.ghostButton} onClick={reset}>
                  <RotateCcw size={12} /> Reset
                </button>
                {running ? (
                  <button type="button" className={styles.runButton} onClick={stop}>
                    <Square size={11} /> Stop
                  </button>
                ) : (
                  <button type="button" className={styles.runButton} onClick={run}>
                    <Play size={12} /> Run
                  </button>
                )}
              </div>
            </div>

            <div
              className={styles.editorHost}
              onKeyDownCapture={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  if (!running) run();
                }
              }}
            >
              <CodeMirror
                value={code}
                height="240px"
                theme={oneDark}
                extensions={extensions}
                onChange={(value) => setCode(value)}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  highlightActiveLine: true,
                  highlightActiveLineGutter: false
                }}
              />
            </div>

            <div className={styles.console} aria-live="polite" aria-label="Lab output">
              {entries.length === 0 ? (
                <div className={styles.consoleEmpty}>
                  <Terminal size={12} style={{ verticalAlign: "-2px", marginRight: "5px" }} />
                  Run the code to see output. {running ? "Starting worker…" : ""}
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className={styles.consoleLine}>
                    <span
                      className={`${styles.consoleLevel} ${
                        entry.level === "error"
                          ? styles.consoleLevelError
                          : entry.level === "warn"
                            ? styles.consoleLevelWarn
                            : entry.level === "system"
                              ? styles.consoleLevelSystem
                              : styles.consoleLevelLog
                      }`}
                    >
                      {entry.level}
                    </span>
                    <span className={styles.consoleText}>{entry.text}</span>
                  </div>
                ))
              )}
            </div>

            {result != null ? (
              <div className={styles.resultBox}>
                <div className={styles.resultLabel}>Return value</div>
                {result}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.labFoot}>
          <div className={styles.footGroup}>
            <span className={styles.pill}>
              {status === "running"
                ? "Running"
                : status === "done"
                  ? "Completed"
                  : status === "error"
                    ? "Error"
                    : status === "timeout"
                      ? "Timed out"
                      : "Ready"}
            </span>
            <span className={styles.railHint}>Ctrl / ⌘ + Enter to run</span>
          </div>
          <div className={styles.footGroup}>
            {lab.hints?.length ? (
              <button type="button" className={styles.ghostButton} onClick={() => setHintsOpen((open) => !open)}>
                <Lightbulb size={12} /> Hints ({lab.hints.length})
              </button>
            ) : null}
            {lab.solution ? (
              <button type="button" className={styles.ghostButton} onClick={showSolution}>
                Show solution
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {hintsOpen && lab.hints?.length ? (
        <div className={styles.hints}>
          <strong style={{ fontSize: "0.75rem", color: "#fcd34d" }}>Hints</strong>
          <ul>
            {lab.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {lab.expected ? (
        <details className={styles.expected} style={{ marginTop: "12px" }}>
          <summary>What you should see</summary>
          <pre>{lab.expected}</pre>
        </details>
      ) : null}

      {lab.interfacePreview ? <InterfacePreview preview={lab.interfacePreview} /> : null}
    </>
  );
}
