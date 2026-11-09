"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Trash2
} from "lucide-react";
import BuilderFields from "./BuilderFields";
import BuilderPreview from "./BuilderPreview";
import { useStudioSession } from "@/lib/studioSession";
import * as keystoneApi from "@/lib/keystoneBuilder";
import * as payloadApi from "@/lib/payloadBuilder";
import {
  defaultComponentDescription,
  defaultComponentName,
  defaultTokensFromCatalog,
  tokenFieldsFromCatalog
} from "@/lib/builderCatalog";
import styles from "./builderLab.module.css";

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

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function requiredFieldError(fields, content) {
  for (const field of fields || []) {
    if (!field.required) continue;
    const value = content?.[field.name];
    if (value === undefined || value === null || value === "") {
      return `${field.label || field.name} is required.`;
    }
  }
  return "";
}

export default function BuilderLab({
  lesson,
  catalog,
  builder,
  showcaseHref
}) {
  const provider = builder?.provider === "keystone" ? "keystone" : "payload";
  const providerLabel =
    builder?.label || (provider === "keystone" ? "Keystone" : "Payload");
  const api = provider === "keystone" ? keystoneApi : payloadApi;
  const previewUrl = builder?.previewUrl;
  const adminUrl = builder?.adminUrl;
  const externalShowcaseUrl = builder?.externalShowcaseUrl;

  const lab = lesson.lab || {};
  const builderKind = lab.builderKind || "card";
  const surface = lab.surface === "admin" ? "admin" : "public";
  const publishable = lab.publishable === true && surface !== "admin";

  const catalogKind = useMemo(
    () => catalog?.kinds?.find((kind) => kind.slug === builderKind) || null,
    [catalog, builderKind]
  );
  const tokenFields = useMemo(() => tokenFieldsFromCatalog(catalog), [catalog]);
  const defaultTokens = useMemo(() => defaultTokensFromCatalog(catalog), [catalog]);

  const starter = useMemo(
    () => ({
      content: clone(lab.starter?.content || catalogKind?.defaults || {}),
      tokens: {
        ...defaultTokens,
        ...(lab.starter?.tokens || catalogKind?.defaultTokens || {})
      }
    }),
    [lab.starter, catalogKind, defaultTokens]
  );

  const solution = useMemo(
    () => ({
      content: clone(lab.solution?.content || starter.content),
      tokens: {
        ...defaultTokens,
        ...(lab.solution?.tokens || starter.tokens)
      }
    }),
    [lab.solution, starter, defaultTokens]
  );

  const session = useStudioSession();

  const [content, setContent] = useState(starter.content);
  const [tokens, setTokens] = useState(starter.tokens);
  const [name, setName] = useState(() => defaultComponentName(lesson));
  const [description, setDescription] = useState(() => defaultComponentDescription(lesson));

  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState("draft");
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [publishedOnce, setPublishedOnce] = useState(false);

  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState("");

  const [health, setHealth] = useState("checking");
  const [device, setDevice] = useState(lab.device || "desktop");
  const [hintsOpen, setHintsOpen] = useState(false);
  const [checks, setChecks] = useState(() => (lab.checklist || []).map(() => false));

  const previewSpec = useMemo(
    () => ({ kind: builderKind, surface, content, tokens }),
    [builderKind, surface, content, tokens]
  );

  const refreshVersions = useCallback(async () => {
    if (!session) return;
    setVersionsLoading(true);
    setVersionsError("");
    try {
      const items = await api.listBuilderComponents(lesson.slug);
      setVersions(items);
    } catch (loadError) {
      setVersionsError(loadError?.message || "Could not load saved versions.");
    } finally {
      setVersionsLoading(false);
    }
  }, [session, lesson.slug, api]);

  useEffect(() => {
    if (!session) return undefined;
    let cancelled = false;

    const load = async () => {
      setVersionsLoading(true);
      setVersionsError("");
      try {
        const items = await api.listBuilderComponents(lesson.slug);
        if (!cancelled) setVersions(items);
      } catch (loadError) {
        if (!cancelled) {
          setVersionsError(loadError?.message || "Could not load saved versions.");
        }
      } finally {
        if (!cancelled) setVersionsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [session, lesson.slug, api]);

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer;
    let cancelled = false;

    const check = async (attempt) => {
      try {
        const response = await fetch(`/api/lab/${provider}/health`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (cancelled) return;
        if (data.ok) {
          setHealth("online");
          return;
        }
      } catch {
        // The dev route may still be compiling on the first request.
      }

      if (cancelled) return;
      if (attempt < 2) {
        retryTimer = setTimeout(() => check(attempt + 1), 1000);
        return;
      }
      setHealth("offline");
    };

    check(0);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(retryTimer);
    };
  }, [provider]);

  const markDirty = useCallback(() => {
    setDirty(true);
    setError("");
    setSuccess("");
  }, []);

  const handleContentChange = (next) => {
    setContent(next);
    markDirty();
  };

  const handleTokensChange = (next) => {
    setTokens(next);
    markDirty();
  };

  const handleNameChange = (value) => {
    setName(value);
    markDirty();
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    markDirty();
  };

  const handleReset = () => {
    setContent(clone(starter.content));
    setTokens({ ...starter.tokens });
    setName(defaultComponentName(lesson));
    setDescription(defaultComponentDescription(lesson));
    setSelectedId(null);
    setStatus("draft");
    setSavedAt(null);
    setDirty(false);
    setError("");
    setSuccess("");
    setHintsOpen(false);
  };

  const handleSolution = () => {
    setContent(clone(solution.content));
    setTokens({ ...solution.tokens });
    markDirty();
  };

  const handleLoad = async (id) => {
    if (dirty && !window.confirm("Load this saved version and discard your current edits?")) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      const component = await api.loadBuilderComponent(id);
      setContent(clone(component.content));
      setTokens({ ...defaultTokens, ...(component.tokens || {}) });
      setName(component.name || defaultComponentName(lesson));
      setDescription(component.description || "");
      setSelectedId(component.id);
      setStatus(component.status || "draft");
      setSavedAt(component.updatedAt || component.createdAt || null);
      setDirty(false);
      setPublishedOnce(component.status === "published");
    } catch (loadError) {
      setVersionsError(loadError?.message || "Could not load that version.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this saved component?")) return;

    setError("");
    try {
      await api.deleteBuilderComponent(id);
      setVersions((current) => current.filter((version) => version.id !== id));
      if (selectedId === id) handleReset();
    } catch (deleteError) {
      setVersionsError(deleteError?.message || "Could not delete that version.");
    }
  };

  const save = async (nextStatus) => {
    if (!session) {
      setError("The lab session is not ready yet. Reload the page and try again.");
      return;
    }
    if (health === "offline") {
      setError(`${providerLabel} is offline. Start it and try again.`);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give this component a name before saving.");
      return;
    }

    const missing = requiredFieldError(catalogKind?.fields, content);
    if (missing) {
      setError(missing);
      return;
    }

    setSaving(nextStatus);
    setError("");
    setSuccess("");

    const input = {
      name: trimmedName,
      description: description.trim(),
      lessonSlug: lesson.slug,
      kind: builderKind,
      status: nextStatus,
      content,
      tokens
    };

    try {
      const saved = selectedId
        ? await api.updateBuilderComponent(selectedId, input)
        : await api.createBuilderComponent(input);

      if (!saved?.id) {
        throw new Error(`${providerLabel} did not return the saved component.`);
      }

      setSelectedId(saved.id);
      setStatus(saved.status || nextStatus);
      setSavedAt(saved.updatedAt || new Date().toISOString());
      setDirty(false);
      setSuccess(
        (saved.status || nextStatus) === "published"
          ? `Published. Your component is now in the ${providerLabel} showcase.`
          : `Draft saved in ${providerLabel}.`
      );
      if ((saved.status || nextStatus) === "published") setPublishedOnce(true);
      await refreshVersions();
    } catch (saveError) {
      setError(saveError?.message || "Could not save this component.");
    } finally {
      setSaving("");
    }
  };

  const toggleCheck = (index) => {
    setChecks((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? !value : value))
    );
  };

  const statusText = saving
    ? saving === "published"
      ? "Publishing…"
      : "Saving…"
    : dirty
      ? "Unsaved changes"
      : status === "published"
        ? "Published"
        : savedAt
          ? `Draft saved ${formatRelative(savedAt)}`
          : "Not saved yet";

  const healthLabel =
    health === "online"
      ? `${providerLabel} connected`
      : health === "offline"
        ? `${providerLabel} offline`
        : `Checking ${providerLabel}`;

  const kindLabel = catalogKind?.label || builderKind;
  const kindFields = Array.isArray(catalogKind?.fields) ? catalogKind.fields : [];
  const canSave = Boolean(session) && !saving && health !== "offline";

  return (
    <div className={styles.lab}>
      <div className={styles.labHead}>
        <div>
          <div className={styles.kicker}>{providerLabel} UI/UX lab</div>
          <h3 className={styles.title}>{lab.title}</h3>
        </div>
        <div className={styles.headMeta}>
          <span className={styles.kindPill}>{kindLabel}</span>
          <span className={styles.health}>
            <span
              className={`${styles.healthDot} ${
                health === "online"
                  ? styles.healthDotOn
                  : health === "offline"
                    ? styles.healthDotOff
                    : ""
              }`}
            />
            {healthLabel}
          </span>
        </div>
      </div>

      <p className={styles.brief}>{lab.brief}</p>

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

      {health === "offline" ? (
        <div className={styles.banner}>
          {providerLabel} is offline. You can still read the lesson and edit the fields,
          but the live preview and saving need the CMS.
        </div>
      ) : null}

      {surface === "admin" ? (
        <div className={styles.adminNote}>
          This lab renders inside the {providerLabel} admin. It can be saved as a draft,
          but it never appears in the public showcase.
          {adminUrl ? (
            <a href={adminUrl} target="_blank" rel="noreferrer">
              Open the {providerLabel} admin <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className={styles.workspace}>
        <section className={styles.panel} aria-label={`${providerLabel} component builder`}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelKicker}>Builder</div>
              <h4 className={styles.panelTitle}>{kindLabel}</h4>
            </div>
            <span
              className={`${styles.statusChip} ${
                dirty
                  ? styles.statusDirty
                  : status === "published"
                    ? styles.statusPublished
                    : styles.statusDraft
              }`}
            >
              {statusText}
            </span>
          </div>

          <div className={styles.controls}>
            <details className={styles.controlGroup} open>
              <summary>Showcase entry</summary>
              <div className={styles.fieldStack}>
                <div className={styles.field}>
                  <label htmlFor="builder-name" className={styles.fieldLabel}>
                    <span>Component name</span>
                    <span className={styles.required}>required</span>
                  </label>
                  <input
                    id="builder-name"
                    type="text"
                    value={name}
                    maxLength={90}
                    onChange={(event) => handleNameChange(event.target.value)}
                  />
                  <span className={styles.fieldHint}>
                    The name shown in the {providerLabel} showcase.
                  </span>
                </div>
                <div className={styles.field}>
                  <label htmlFor="builder-description" className={styles.fieldLabel}>
                    <span>Description</span>
                  </label>
                  <textarea
                    id="builder-description"
                    rows={2}
                    value={description}
                    maxLength={500}
                    onChange={(event) => handleDescriptionChange(event.target.value)}
                  />
                </div>
              </div>
            </details>

            <details className={styles.controlGroup} open>
              <summary>Content fields</summary>
              {!catalog ? (
                <p className={styles.catalogNote}>
                  The {providerLabel} component catalog is unavailable. You can edit the
                  raw JSON, but the live preview and saving still need {providerLabel}.
                </p>
              ) : null}
              <BuilderFields
                fields={kindFields}
                value={content}
                onChange={handleContentChange}
                idPrefix="content"
              />
            </details>

            <details className={styles.controlGroup}>
              <summary>Design tokens</summary>
              <BuilderFields
                fields={tokenFields}
                value={tokens}
                onChange={handleTokensChange}
                idPrefix="tokens"
              />
            </details>
          </div>

          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => save("draft")}
              disabled={!canSave}
            >
              <Save size={14} /> {saving === "draft" ? "Saving…" : "Save draft"}
            </button>

            {publishable ? (
              <button
                type="button"
                className={styles.publishButton}
                onClick={() => save("published")}
                disabled={!canSave}
              >
                <Send size={14} /> {saving === "published" ? "Publishing…" : "Publish"}
              </button>
            ) : null}

            <button type="button" className={styles.ghostButton} onClick={handleReset}>
              <RotateCcw size={13} /> Reset
            </button>
            <button type="button" className={styles.ghostButton} onClick={handleSolution}>
              Show solution
            </button>
            {lab.hints?.length ? (
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setHintsOpen((open) => !open)}
              >
                <Lightbulb size={13} /> Hints
              </button>
            ) : null}
          </div>

          {error ? <div className={styles.errorMessage}>{error}</div> : null}
          {success ? (
            <div className={styles.successMessage}>
              <CheckCircle2 size={14} />
              <span>{success}</span>
              {status === "published" ? (
                <span className={styles.successLinks}>
                  {showcaseHref ? (
                    <Link href={showcaseHref}>Open the showcase</Link>
                  ) : null}
                  {externalShowcaseUrl ? (
                    <a
                      href={
                        provider === "payload" && selectedId
                          ? `${externalShowcaseUrl}/${selectedId}`
                          : externalShowcaseUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      View in {providerLabel} <ExternalLink size={11} />
                    </a>
                  ) : null}
                </span>
              ) : null}
            </div>
          ) : null}
        </section>

        <BuilderPreview
          embedUrl={previewUrl}
          providerLabel={providerLabel}
          spec={previewSpec}
          device={device}
          onDeviceChange={setDevice}
          health={health}
        />
      </div>

      {hintsOpen && lab.hints?.length ? (
        <div className={styles.hints}>
          <strong>Hints</strong>
          <ul>
            {lab.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {lab.code?.source ? (
        <details className={styles.codeBlock}>
          <summary>
            <span>The code behind it</span>
            <span className={styles.codeFile}>{lab.code.filename}</span>
          </summary>
          <pre>
            <code>{lab.code.source}</code>
          </pre>
        </details>
      ) : null}

      <section className={styles.versions} aria-labelledby={`builder-versions-${lesson.slug}`}>
        <div className={styles.versionsHead}>
          <div>
            <h4 id={`builder-versions-${lesson.slug}`} className={styles.versionsTitle}>
              Saved versions{versions.length ? ` (${versions.length})` : ""}
            </h4>
            <p className={styles.versionsSubtitle}>
              Stored in {providerLabel} for this lesson and this browser session.
            </p>
          </div>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={refreshVersions}
            disabled={versionsLoading || !session}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {versionsError ? (
          <div className={styles.versionsError}>
            <span>{versionsError}</span>
            <button type="button" className={styles.ghostButton} onClick={refreshVersions}>
              Retry
            </button>
          </div>
        ) : null}

        {versionsLoading && versions.length === 0 ? (
          <p className={styles.versionsEmpty}>Loading saved versions…</p>
        ) : null}

        {!versionsLoading && !versionsError && versions.length === 0 ? (
          <p className={styles.versionsEmpty}>
            No saved versions yet. Save a draft to keep one in {providerLabel}.
          </p>
        ) : null}

        {versions.length > 0 ? (
          <div className={styles.versionList}>
            {versions.map((version) => (
              <div
                key={version.id}
                className={`${styles.versionRow} ${
                  selectedId === version.id ? styles.versionRowActive : ""
                }`}
              >
                <div className={styles.versionInfo}>
                  <span className={styles.versionName}>{version.name}</span>
                  <span className={styles.versionMeta}>
                    <span
                      className={
                        version.status === "published"
                          ? styles.versionPublished
                          : styles.versionDraft
                      }
                    >
                      {version.status}
                    </span>
                    <span>{formatDate(version.updatedAt || version.createdAt)}</span>
                  </span>
                </div>
                <div className={styles.versionActions}>
                  <button
                    type="button"
                    className={styles.versionButton}
                    onClick={() => handleLoad(version.id)}
                  >
                    Load
                  </button>
                  {version.status === "published" && externalShowcaseUrl ? (
                    <a
                      className={styles.versionButton}
                      href={
                        provider === "payload"
                          ? `${externalShowcaseUrl}/${version.id}`
                          : externalShowcaseUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
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

      {publishedOnce && status === "published" ? (
        <p className={styles.publishedHint}>
          This component is live. Open the showcase to confirm the card appears, then
          continue to the next lesson.
        </p>
      ) : null}
    </div>
  );
}
