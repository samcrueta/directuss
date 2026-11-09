"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useAdvancedProgress } from "@/lib/progress";
import styles from "./advanced.module.css";

export default function AdvancedShell({ courseId, content, children }) {
  const pathname = usePathname();
  const { completed, ready, reset } = useAdvancedProgress();
  const { section, lessons, source, trackLabels, showcaseHref } = content;

  const sourceLabel =
    source === "directus"
      ? "Live from Directus"
      : source === "payload"
        ? "Live from Payload"
        : source === "keystone"
          ? "Live from Keystone"
          : "Offline content";
  const sourceIsLive =
    source === "directus" || source === "payload" || source === "keystone";
  const groupLabel = (track) => trackLabels?.[track] || trackLabels?.api || "Lessons";

  const activeSlug = pathname.split("/").filter(Boolean).pop();
  const lessonSlugs = new Set(lessons.map((lesson) => lesson.slug));
  const completedCount = completed.filter((slug) => lessonSlugs.has(slug)).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const lessonGroups = lessons.reduce((groups, lesson, index) => {
    const track = lesson.track || "api";
    let group = groups.find((entry) => entry.track === track);
    if (!group) {
      group = { track, lessons: [] };
      groups.push(group);
    }
    group.lessons.push({ lesson, index });
    return groups;
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} />
          LUMINA ACADEMY
        </Link>
        <nav className={styles.topLinks}>
          <Link href={`/courses/${courseId}`} className={styles.topLink}>
            <ArrowLeft size={13} />
            Course curriculum
          </Link>
          <Link href={`/courses/${courseId}/charts`} className={styles.topLink}>
            Level 8 · Charts
          </Link>
          {showcaseHref ? (
            <Link href={showcaseHref} className={styles.topLink}>
              Showcase
            </Link>
          ) : null}
          <Link href="/courses" className={styles.topLink}>
            All courses
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.pill}>Level 7 · Advanced</span>
          <span className={`${styles.pill} ${sourceIsLive ? styles.pillLive : ""}`}>
            {sourceLabel}
          </span>
          <span className={styles.pill}>{lessons.length} lessons</span>
        </div>
        <h1 className={styles.heroTitle}>{section.title}</h1>
        <p className={styles.heroDescription}>{section.description}</p>
      </section>

      <div className={styles.layout}>
        <aside className={styles.rail} aria-label="Lesson navigation">
          <div className={styles.railHead}>
            <span className={styles.railLabel}>Lessons</span>
            <span className={styles.railCount}>
              {ready ? `${completedCount}/${lessons.length}` : `${lessons.length} total`}
            </span>
          </div>
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>

          <div className={styles.railList}>
            {lessonGroups.map((group) => (
              <Fragment key={group.track}>
                <div className={styles.railGroup}>{groupLabel(group.track)}</div>
                {group.lessons.map(({ lesson, index }) => {
                  const active = lesson.slug === activeSlug;
                  const done = ready && completed.includes(lesson.slug);
                  return (
                    <Link
                      key={lesson.slug}
                      href={`/courses/${courseId}/advanced/${lesson.slug}`}
                      className={`${styles.railItem} ${active ? styles.railItemActive : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={styles.railNumber}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.railTitle}>{lesson.title}</span>
                      {done ? (
                        <CheckCircle2 size={14} className={styles.railCheck} aria-label="Complete" />
                      ) : (
                        <Circle size={14} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />
                      )}
                    </Link>
                  );
                })}
              </Fragment>
            ))}
          </div>

          <div className={styles.railFoot}>
            <span className={styles.railHint}>Progress is saved in this browser.</span>
            <button type="button" className={styles.resetButton} onClick={reset}>
              Reset
            </button>
          </div>
        </aside>

        <div className={styles.main}>{children}</div>
      </div>
    </main>
  );
}
