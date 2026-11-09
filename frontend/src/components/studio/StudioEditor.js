"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLanguage } from "@codemirror/lang-html";
import { css as cssLanguage } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import styles from "./studio.module.css";

const TABS = [
  { id: "html", label: "HTML", file: "index.html" },
  { id: "css", label: "CSS", file: "styles.css" },
  { id: "js", label: "JS", file: "script.js" }
];

export default function StudioEditor({
  name = "",
  description = "",
  activeTab,
  onTabChange,
  html,
  css,
  js,
  onCodeChange,
  onNameChange,
  onDescriptionChange,
  showMeta = true
}) {
  const values = { html, css, js };
  const active = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const extensions = useMemo(() => {
    if (activeTab === "html") return [htmlLanguage(), EditorView.lineWrapping];
    if (activeTab === "css") return [cssLanguage(), EditorView.lineWrapping];
    return [javascript(), EditorView.lineWrapping];
  }, [activeTab]);

  return (
    <div className={styles.builderBody}>
      {showMeta ? (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="component-name">
              Component name
            </label>
            <input
              id="component-name"
              className={styles.input}
              value={name}
              maxLength={80}
              placeholder="Profile card"
              onChange={(event) => onNameChange?.(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="component-description">
              Description <span className={styles.optional}>optional</span>
            </label>
            <textarea
              id="component-description"
              className={styles.textarea}
              value={description}
              maxLength={500}
              rows={2}
              placeholder="What does this component do?"
              onChange={(event) => onDescriptionChange?.(event.target.value)}
            />
          </div>
        </>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="Component code">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.editorFrame}>
        <div className={styles.editorBar}>
          <span className={styles.editorFile}>{active.file}</span>
          <span className={styles.editorHint}>Paste body markup, styles, and browser JS</span>
        </div>
        <div className={styles.editorHost}>
          <CodeMirror
            value={values[activeTab] || ""}
            height="340px"
            theme={oneDark}
            extensions={extensions}
            onChange={(value) => onCodeChange(activeTab, value)}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              highlightActiveLine: true,
              highlightActiveLineGutter: false
            }}
          />
        </div>
      </div>
    </div>
  );
}
