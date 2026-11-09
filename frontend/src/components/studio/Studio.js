"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Code2, Plus, Save, Trash2 } from "lucide-react";
import StudioEditor from "./StudioEditor";
import ComponentPreview from "./ComponentPreview";
import SavedComponents from "./SavedComponents";
import { buildPreviewDocument } from "@/lib/studio";
import { STARTER_COMPONENT } from "@/lib/studioStarter";
import styles from "./studio.module.css";

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

export default function Studio() {
  const storageKey = "lumina:studio:components";

  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState(STARTER_COMPONENT.name);
  const [description, setDescription] = useState(STARTER_COMPONENT.description);
  const [html, setHtml] = useState(STARTER_COMPONENT.html);
  const [css, setCss] = useState(STARTER_COMPONENT.css);
  const [js, setJs] = useState(STARTER_COMPONENT.js);
  const [activeTab, setActiveTab] = useState("html");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  const [previewMode, setPreviewMode] = useState("draft");
  const [device, setDevice] = useState("desktop");
  const [previewNonce, setPreviewNonce] = useState(0);
  const [draftVersion, setDraftVersion] = useState(0);
  const [previewDoc, setPreviewDoc] = useState(() => buildPreviewDocument(STARTER_COMPONENT));

  const applyComponent = useCallback((component) => {
    setName(component.name || STARTER_COMPONENT.name);
    setDescription(component.description || "");
    setHtml(component.html || "");
    setCss(component.css || "");
    setJs(component.js || "");
    setSelectedId(component.id);
    setActiveTab("html");
    setDirty(false);
    setSaveError("");
    setSavedAt(component.date_updated || component.date_created || null);
    setPreviewMode("saved");
  }, []);

  const resetToStarter = useCallback(() => {
    setName(STARTER_COMPONENT.name);
    setDescription(STARTER_COMPONENT.description);
    setHtml(STARTER_COMPONENT.html);
    setCss(STARTER_COMPONENT.css);
    setJs(STARTER_COMPONENT.js);
    setSelectedId(null);
    setActiveTab("html");
    setDirty(false);
    setSaveError("");
    setSavedAt(null);
    setPreviewMode("draft");
    setPreviewDoc(buildPreviewDocument(STARTER_COMPONENT));
    setDraftVersion((value) => value + 1);
    setPreviewNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      try {
        const items = JSON.parse(raw);
        if (!Array.isArray(items)) return;
        setComponents(items);
        if (items[0]) {
          applyComponent(items[0]);
          setPreviewNonce((value) => value + 1);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applyComponent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewDoc(buildPreviewDocument({ html, css, js }));
      setDraftVersion((value) => value + 1);
    }, 280);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const persistComponents = useCallback((items) => {
    setComponents(items);
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, []);

  const handleNameChange = useCallback((value) => {
    setName(value);
    setDirty(true);
    setSaveError("");
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
    setDirty(true);
    setSaveError("");
  }, []);

  const handleCodeChange = useCallback((tab, value) => {
    if (tab === "html") setHtml(value);
    else if (tab === "css") setCss(value);
    else setJs(value);
    setDirty(true);
    setPreviewMode("draft");
    setSaveError("");
  }, []);

  const handleNew = useCallback(() => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    resetToStarter();
  }, [dirty, resetToStarter]);

  const handleOpen = useCallback(
    (id) => {
      if (dirty && !window.confirm("Discard unsaved changes?")) return;
      const component = components.find((item) => item.id === id);
      if (!component) return;
      applyComponent(component);
      setPreviewNonce((value) => value + 1);
    },
    [components, dirty, applyComponent]
  );

  const handleSave = useCallback(async () => {
    if (saving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setSaveError("Give the component a name before saving.");
      return;
    }
    setSaving(true);
    setSaveError("");

    const payload = {
      name: trimmedName,
      description,
      framework: "html",
      html,
      css,
      js
    };

    try {
      const id = selectedId || `local-${Date.now()}`;
      const saved = {
        ...payload,
        id,
        date_created: selectedId
          ? components.find((item) => item.id === selectedId)?.date_created
          : new Date().toISOString(),
        date_updated: new Date().toISOString()
      };

      setName(trimmedName);
      setSelectedId(saved.id);
      setSavedAt(saved.date_updated || saved.date_created || new Date().toISOString());
      setDirty(false);
      setPreviewMode("saved");
      setPreviewNonce((value) => value + 1);
      persistComponents([saved, ...components.filter((item) => item.id !== saved.id)]);
    } finally {
      setSaving(false);
    }
  }, [
    saving,
    name,
    description,
    html,
    css,
    js,
    selectedId,
    components,
    persistComponents
  ]);

  const handleDeleteSaved = useCallback(
    (id) => {
      const target = components.find((component) => component.id === id);
      if (!window.confirm(`Delete "${target?.name || "this component"}"?`)) return;

      persistComponents(components.filter((component) => component.id !== id));
      if (selectedId === id) resetToStarter();
    },
    [components, selectedId, resetToStarter, persistComponents]
  );

  const handleDeleteCurrent = useCallback(() => {
    if (selectedId) handleDeleteSaved(selectedId);
  }, [selectedId, handleDeleteSaved]);

  const previewKey =
    previewMode === "saved" && selectedId
      ? `saved-${selectedId}-${previewNonce}`
      : `draft-${draftVersion}`;

  const statusText = saving
    ? "Saving…"
    : dirty
        ? "Unsaved changes"
        : savedAt
          ? `Saved ${formatRelative(savedAt)}`
          : "Not saved yet";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} />
          LUMINA ACADEMY
        </Link>
        <nav className={styles.topLinks}>
          <Link href="/courses/directus-from-beginner-to-advanced/advanced" className={styles.topLink}>
            <ArrowLeft size={13} /> Advanced Directus
          </Link>
          <span className={styles.health}>Saved in this browser</span>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            <Code2 size={14} /> Component Studio
          </div>
          <h1 className={styles.title}>Build a component. See it rendered.</h1>
          <p className={styles.subtitle}>
            Paste HTML, CSS, and JS. Preview it live, then save it locally and reopen it anytime.
          </p>
        </div>
        <button type="button" className={styles.newButton} onClick={handleNew}>
          <Plus size={15} /> New component
        </button>
      </section>

      <div className={styles.workspace}>
        <section className={styles.panel} aria-label="Component editor">
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelKicker}>Builder</div>
              <h2 className={styles.panelTitle}>{selectedId ? "Edit component" : "New component"}</h2>
            </div>
            <span className={selectedId && !dirty ? styles.savedBadge : styles.draftBadge}>
              {selectedId && !dirty ? "Saved in Directus" : dirty ? "Unsaved" : "Draft"}
            </span>
          </div>

          <StudioEditor
            name={name}
            description={description}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            html={html}
            css={css}
            js={js}
            onCodeChange={handleCodeChange}
            onNameChange={handleNameChange}
            onDescriptionChange={handleDescriptionChange}
          />

          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              <Save size={14} />
              {saving ? "Saving…" : selectedId ? "Save changes" : "Save locally"}
            </button>

            {selectedId ? (
              <button type="button" className={styles.dangerButton} onClick={handleDeleteCurrent}>
                <Trash2 size={14} /> Delete
              </button>
            ) : null}

            <span className={styles.status}>{statusText}</span>
          </div>

          {saveError ? <div className={styles.saveError}>{saveError}</div> : null}
        </section>

        <ComponentPreview
          key={previewKey}
          mode={previewMode}
          savedUrl={null}
          savedLabel="Local"
          savedPreviewTitle="Local component preview"
          savedBadge="Saved in this browser"
          srcDoc={previewDoc}
          device={device}
          nonce={previewNonce}
          health="online"
          onModeChange={setPreviewMode}
          onDeviceChange={setDevice}
          onRefresh={() => setPreviewNonce((value) => value + 1)}
        />
      </div>

      <SavedComponents
        components={components}
        loading={false}
        error=""
        selectedId={selectedId}
        onOpen={handleOpen}
        onDelete={handleDeleteSaved}
        onRefresh={() => {}}
      />

      <footer className={styles.footnote}>
        Saved in this browser · Sandboxed in the browser
      </footer>
    </main>
  );
}
