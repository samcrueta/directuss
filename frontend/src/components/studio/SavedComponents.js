"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import styles from "./studio.module.css";

function formatUpdated(value) {
  if (!value) return "Not saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
  });
}

export default function SavedComponents({
  components,
  loading,
  error,
  selectedId,
  onOpen,
  onDelete,
  onRefresh
}) {
  return (
    <section className={styles.gallery} aria-labelledby="saved-components">
      <div className={styles.galleryHead}>
        <div>
          <h2 id="saved-components" className={styles.galleryTitle}>
            Saved components
          </h2>
          <p className={styles.gallerySubtitle}>
            {loading
              ? "Loading from Directus…"
              : `${components.length} ${components.length === 1 ? "component" : "components"} in this browser session`}
          </p>
        </div>
        <button type="button" className={styles.ghostButton} onClick={onRefresh} disabled={loading}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error ? (
        <div className={styles.galleryError}>
          <span>{error}</span>
          <button type="button" className={styles.ghostButton} onClick={onRefresh}>
            Retry
          </button>
        </div>
      ) : null}

      {loading && components.length === 0 ? (
        <div className={styles.galleryGrid}>
          {[1, 2, 3].map((item) => (
            <div key={item} className={`${styles.savedCard} ${styles.skeleton}`} aria-hidden="true">
              <div className={styles.skeletonLine} style={{ width: "55%" }} />
              <div className={styles.skeletonLine} style={{ width: "85%" }} />
              <div className={styles.skeletonLine} style={{ width: "40%" }} />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && components.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No saved components yet</h3>
          <p>Save the starter component, or paste your own, to start your library.</p>
        </div>
      ) : null}

      {components.length > 0 ? (
        <div className={styles.galleryGrid}>
          {components.map((component) => (
            <article
              key={component.id}
              className={`${styles.savedCard} ${
                selectedId === component.id ? styles.savedCardActive : ""
              }`}
            >
              <div className={styles.savedCardTop}>
                <h3 className={styles.savedCardName}>{component.name}</h3>
                <span className={styles.frameworkBadge}>HTML/CSS/JS</span>
              </div>
              <p className={styles.savedCardDescription}>
                {component.description || "No description."}
              </p>
              <div className={styles.savedCardMeta}>
                <span>Updated {formatUpdated(component.date_updated || component.date_created)}</span>
              </div>
              <div className={styles.savedCardActions}>
                <button
                  type="button"
                  className={styles.openButton}
                  onClick={() => onOpen(component.id)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className={styles.deleteIcon}
                  aria-label={`Delete ${component.name}`}
                  title="Delete component"
                  onClick={() => onDelete(component.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
