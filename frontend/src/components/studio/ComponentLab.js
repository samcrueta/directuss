"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Lightbulb, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import StudioEditor from "./StudioEditor";
import ComponentPreview from "./ComponentPreview";
import { buildPreviewDocument } from "@/lib/studio";
import { getComponentLabProvider } from "@/lib/componentLabProviders";
import studioStyles from "./studio.module.css";
import styles from "./componentLab.module.css";

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

function versionDate(version) {
  return (
    version?.updatedAt ||
    version?.date_updated ||
    version?.createdAt ||
    version?.date_created ||
    null
  );
}

export default function ComponentLab({ lesson, provider = "directus" }) {
  const lab = lesson.lab || {};
  const providerConfig = useMemo(() => getComponentLabProvider(provider), [provider]);
  const labels = providerConfig.labels;
  const storageKey = `lumina:level7:component:${provider}:${lesson.slug}`;
  const publishable =
    providerConfig.supportsPublishing && lab.publishable === true && lab.surface !== "admin";

  const starter = useMemo(
    () => lab.starter || { html: "", css: "", js: "" },
    [lab.starter]
  );
  const solution = useMemo(() => lab.solution || starter, [lab.solution, starter]);

  const [html, setHtml] = useState(starter.html || "");
  const [css, setCss] = useState(starter.css || "");
  const [js, setJs] = useState(starter.js || "");
  const [activeTab, setActiveTab] = useState("html");

  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [checks, setChecks] = useState(() => (lab.checklist || []).map(() => false));

  const [previewMode, setPreviewMode] = useState("draft");
  const [device, setDevice] = useState(lab.device || "desktop");
  const [previewNonce, setPreviewNonce] = useState(0);
  const [draftVersion, setDraftVersion] = useState(0);
  const [previewDoc, setPreviewDoc] = useState(() => buildPreviewDocument(starter));
  const [savedDoc, setSavedDoc] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setVersionsLoading(false);
        return;
      }
      try {
        const items = JSON.parse(raw);
        const savedItems = Array.isArray(items) ? items : [items];
        setVersions(savedItems);
        if (savedItems[0]) {
          const component = savedItems[0];
          setHtml(component.html || "");
          setCss(component.css || "");
          setJs(component.js || "");
          setSelectedId(component.id);
          setSavedAt(versionDate(component));
          setPreviewMode("saved");
          setSavedDoc(buildPreviewDocument(component));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setVersionsLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewDoc(buildPreviewDocument({ html, css, js }));
      setDraftVersion((value) => value + 1);
    }, 280);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const setDraft = useCallback((next, options = {}) => {
    setHtml(next.html || "");
    setCss(next.css || "");
    setJs(next.js || "");
    setSelectedId(null);
    setActiveTab("html");
    setDirty(options.dirty ?? true);
    setSaveError("");
    setPreviewMode("draft");
    setSavedDoc("");
    setPreviewDoc(buildPreviewDocument(next));
    setDraftVersion((value) => value + 1);
    setPreviewNonce((value) => value + 1);
  }, []);

  const handleCodeChange = useCallback((tab, value) => {
    if (tab === "html") setHtml(value);
    else if (tab === "css") setCss(value);
    else setJs(value);
    setDirty(true);
    setPreviewMode("draft");
    setSaveError("");
  }, []);

  const handleReset = useCallback(() => {
    setDraft(starter, { dirty: false });
    setSavedAt(null);
    setHintsOpen(false);
  }, [setDraft, starter]);

  const handleShowSolution = useCallback(() => {
    setDraft(solution, { dirty: true });
    setSavedAt(null);
  }, [setDraft, solution]);

  const selectedVersion = versions.find(
    (version) => String(version.id) === String(selectedId)
  );
  const selectedPublished = selectedVersion?.status === "published";
  const busy = saving || publishing;

  const persist = useCallback(
    (status) => {
      if (busy) return;
      const isPublish = status === "published";
      if (isPublish && !publishable) return;

      if (isPublish) setPublishing(true);
      else setSaving(true);
      setSaveError("");

      const now = new Date();
      const generatedName = `${lesson.title} · ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`;
      const saved = {
        id: selectedId || `local-${Date.now()}`,
        name: selectedVersion?.name || generatedName,
        description: selectedVersion?.description || `Saved from ${lesson.title}`,
        html,
        css,
        js,
        lessonSlug: lesson.slug,
        status,
        updatedAt: now.toISOString(),
        createdAt: selectedVersion?.createdAt || now.toISOString()
      };

      const nextVersions = [saved, ...versions.filter((version) => String(version.id) !== String(saved.id))];
      window.localStorage.setItem(storageKey, JSON.stringify(nextVersions));
      setVersions(nextVersions);
      setSelectedId(saved.id);
      setSavedAt(versionDate(saved) || now.toISOString());
      setDirty(false);
      setPreviewMode("saved");
      setSavedDoc(buildPreviewDocument(saved));
      setPreviewNonce((value) => value + 1);
      setSaving(false);
      setPublishing(false);
    },
    [
      busy,
      publishable,
      lesson.title,
      lesson.slug,
      selectedId,
      selectedVersion,
      html,
      css,
      js,
      versions,
      storageKey
    ]
  );

  const handleSave = useCallback(() => persist("draft"), [persist]);
  const handlePublish = useCallback(() => persist("published"), [persist]);

  const handleLoad = useCallback(
    (id) => {
      if (dirty && !window.confirm("Load this saved version and discard your current draft?")) {
        return;
      }

      setSaveError("");
      const component = versions.find((version) => String(version.id) === String(id));
      if (component) {
        const nextDoc = buildPreviewDocument(component);
        setHtml(component.html || "");
        setCss(component.css || "");
        setJs(component.js || "");
        setActiveTab("html");
        setSelectedId(component.id);
        setSavedAt(versionDate(component));
        setDirty(false);
        setPreviewMode("saved");
        setPreviewDoc(nextDoc);
        setSavedDoc(nextDoc);
        setDraftVersion((value) => value + 1);
        setPreviewNonce((value) => value + 1);
      }
    },
    [dirty, versions]
  );

  const handleDelete = useCallback(
    (id) => {
      if (!window.confirm("Delete this saved version?")) return;

      const nextVersions = versions.filter(
        (version) => String(version.id) !== String(id)
      );
      window.localStorage.setItem(storageKey, JSON.stringify(nextVersions));
      setVersions(nextVersions);
      if (String(selectedId) === String(id)) {
        setDraft(starter, { dirty: false });
        setSavedAt(null);
      }
    },
    [selectedId, setDraft, starter, storageKey, versions]
  );

  const toggleCheck = (index) => {
    setChecks((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)));
  };

  const previewKey =
    previewMode === "saved" && selectedId
      ? `saved-${selectedId}-${previewNonce}`
      : `draft-${draftVersion}`;

  const statusText = publishing
    ? labels.publishing
    : saving
      ? labels.saving
      : dirty
        ? "Unsaved changes"
        : savedAt
          ? `Saved ${formatRelative(savedAt)}`
          : "Not saved yet";

  return (
    <div className={styles.lab}>
      <div className={styles.labHead}>
        <div>
          <div className={styles.kicker}>UI/UX lab</div>
          <h3 className={styles.title}>{lab.title}</h3>
        </div>
        <span className={studioStyles.health}>Saved in this browser</span>
      </div>

      <p className={styles.brief}>{lab.brief}</p>

      {lab.surface === "admin" ? (
        <div className={styles.adminNote}>
          <strong>Admin-surface prototype.</strong> {labels.adminNote}
        </div>
      ) : null}

      {lab.checklist?.length ? (
        <div className={styles.checklist} aria-label="Lab checklist">
          {lab.checklist.map((item, index) => (
            <label key={item} className={styles.checkItem}>
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

      <div className={styles.workspace}>
        <section className={studioStyles.panel} aria-label="Component editor">
          <div className={studioStyles.panelHead}>
            <div>
              <div className={studioStyles.panelKicker}>Editor</div>
              <h4 className={studioStyles.panelTitle}>HTML · CSS · JS</h4>
            </div>
          </div>

          <StudioEditor
            showMeta={false}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            html={html}
            css={css}
            js={js}
            onCodeChange={handleCodeChange}
          />

          <div className={studioStyles.actionBar}>
            <button
              type="button"
              className={studioStyles.primaryButton}
              onClick={handleSave}
              disabled={busy}
            >
              <Save size={14} /> {saving ? labels.saving : labels.save}
            </button>
            {publishable ? (
              <button
                type="button"
                className={styles.publishButton}
                onClick={handlePublish}
                disabled={busy}
              >
                <Upload size={14} />{" "}
                {publishing
                  ? labels.publishing
                  : selectedPublished
                    ? "Update published"
                    : labels.publish}
              </button>
            ) : null}
            <button type="button" className={studioStyles.ghostButton} onClick={handleReset}>
              <RotateCcw size={13} /> Reset
            </button>
            <button type="button" className={studioStyles.ghostButton} onClick={handleShowSolution}>
              Show solution
            </button>
            {lab.hints?.length ? (
              <button
                type="button"
                className={studioStyles.ghostButton}
                onClick={() => setHintsOpen((open) => !open)}
              >
                <Lightbulb size={13} /> Hints
              </button>
            ) : null}
            <span className={studioStyles.status}>{statusText}</span>
          </div>

          {saveError ? <div className={studioStyles.saveError}>{saveError}</div> : null}
        </section>

        <ComponentPreview
          key={previewKey}
          mode={previewMode}
          savedUrl={null}
          savedSrcDoc={providerConfig.savedPreview === "srcDoc" ? savedDoc : null}
          savedLabel={labels.saved}
          savedPreviewTitle={labels.savedPreviewTitle}
          savedBadge={labels.savedBadge}
          srcDoc={previewDoc}
          device={device}
          nonce={previewNonce}
          health="online"
          onModeChange={setPreviewMode}
          onDeviceChange={setDevice}
          onRefresh={() => setPreviewNonce((value) => value + 1)}
        />
      </div>

      {hintsOpen && lab.hints?.length ? (
        <div className={studioStyles.hints}>
          <strong style={{ fontSize: "0.75rem", color: "#fcd34d" }}>Hints</strong>
          <ul>
            {lab.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className={styles.versions} aria-labelledby={`versions-${lesson.slug}`}>
        <div className={styles.versionsHead}>
          <div>
            <h4 id={`versions-${lesson.slug}`} className={styles.versionsTitle}>
              Saved versions{versions.length ? ` (${versions.length})` : ""}
            </h4>
            <p className={styles.versionsSubtitle}>{labels.versionsSubtitle}</p>
          </div>
        </div>

        {versionsLoading && versions.length === 0 ? (
          <p className={styles.versionsEmpty}>Loading saved versions…</p>
        ) : null}

        {!versionsLoading && versions.length === 0 ? (
          <p className={styles.versionsEmpty}>{labels.emptyVersions}</p>
        ) : null}

        {versions.length > 0 ? (
          <div className={styles.versionList}>
            {versions.map((version) => (
              <div
                key={version.id}
                className={`${styles.versionRow} ${
                  String(selectedId) === String(version.id) ? styles.versionRowActive : ""
                }`}
              >
                <div className={styles.versionInfo}>
                  <span className={styles.versionName}>{version.name}</span>
                  <span className={styles.versionMeta}>
                    {formatVersionDate(versionDate(version))}
                    {version.status ? (
                      <span
                        className={`${styles.versionStatus} ${
                          version.status === "published" ? styles.versionStatusPublished : ""
                        }`}
                      >
                        {version.status}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className={styles.versionActions}>
                  <button
                    type="button"
                    className={styles.versionButton}
                    onClick={() => handleLoad(version.id)}
                  >
                    <Check size={12} /> Load
                  </button>
                  <button
                    type="button"
                    className={styles.versionDanger}
                    aria-label={`Delete ${version.name}`}
                    onClick={() => handleDelete(version.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
