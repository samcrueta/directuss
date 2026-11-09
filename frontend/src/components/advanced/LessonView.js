"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useAdvancedProgress } from "@/lib/progress";
import BuilderLab from "./BuilderLab";
import CodeLab from "./CodeLab";
import DatasetLab from "./DatasetLab";
import ComponentLab from "../studio/ComponentLab";
import KnowledgeCheck from "./KnowledgeCheck";
import DeepDive from "./DeepDive";
import styles from "./advanced.module.css";

function RichText({ children }) {
  if (typeof children !== "string") return children;
  const parts = children.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

function normalizeLab(value) {
  if (!value) return {};
  if (typeof value !== "string") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function LessonView({
  courseId,
  lesson,
  lessons,
  catalog,
  builder,
  showcaseHref
}) {
  const { isComplete, toggle, ready } = useAdvancedProgress();
  const index = lessons.findIndex((item) => item.slug === lesson.slug);
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
  const done = ready && isComplete(lesson.slug);
  const lab = normalizeLab(lesson.lab);
  const lessonWithLab = { ...lesson, lab };
  const isComponentLab =
    lab.kind === "component" ||
    (lab.starter &&
      typeof lab.starter === "object" &&
      ("html" in lab.starter || "css" in lab.starter || "js" in lab.starter));
  const provider =
    courseId === "payload-cms"
      ? "payload"
      : courseId === "keystonejs"
        ? "keystone"
        : "directus";

  return (
    <article>
      <header className={styles.lessonHeader}>
        <div className={styles.eyebrow}>
          <span>Lesson {index + 1} of {lessons.length}</span>
          <span aria-hidden="true">·</span>
          <span>Concept + live lab</span>
        </div>
        <h1 className={styles.lessonTitle}>{lesson.title}</h1>
        <p className={styles.outcome}>{lesson.outcome}</p>
      </header>

      <section className={styles.block} aria-labelledby="mental-model">
        <h2 id="mental-model" className={styles.blockLabel}>
          Mental model
        </h2>
        <ul className={styles.mentalList}>
          {(lesson.mental_model || []).map((item, itemIndex) => (
            <li key={itemIndex} className={styles.mentalItem}>
              <span className={styles.mentalDot} aria-hidden="true" />
              <span>
                <RichText>{item}</RichText>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="lab">
        <h2 id="lab" className={styles.blockLabel}>
          Lab
        </h2>
        {lab.kind === "builder" ? (
          <BuilderLab
            lesson={lessonWithLab}
            catalog={catalog}
            builder={builder}
            showcaseHref={showcaseHref}
          />
        ) : lab.kind === "dataset" || lab.kind === "chart" ? (
          <DatasetLab lesson={lessonWithLab} provider={provider} />
        ) : isComponentLab ? (
          <ComponentLab
            lesson={lessonWithLab}
            provider={provider}
          />
        ) : (
          <CodeLab lab={lab} />
        )}
      </section>

      <section className={styles.block}>
        <div className={styles.takeaway}>
          <strong>Takeaway.</strong> {lesson.takeaway}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="check">
        <h2 id="check" className={styles.blockLabel}>
          Check yourself
        </h2>
        <KnowledgeCheck check={lesson.knowledge_check || {}} />
      </section>

      <section className={styles.block} aria-labelledby="deeper">
        <h2 id="deeper" className={styles.blockLabel}>
          Go deeper
        </h2>
        <DeepDive items={lesson.deep_dive || []} />
      </section>

      <footer className={styles.footerNav}>
        {previous ? (
          <Link href={`/courses/${courseId}/advanced/${previous.slug}`} className={styles.navLink}>
            <ArrowLeft size={14} /> {previous.title}
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`} className={styles.navLink}>
            <ArrowLeft size={14} /> Curriculum
          </Link>
        )}

        <button
          type="button"
          onClick={() => toggle(lesson.slug)}
          className={`${styles.completeButton} ${done ? styles.completeButtonDone : ""}`}
        >
          {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {done ? "Completed" : "Mark complete"}
        </button>

        {next ? (
          <Link href={`/courses/${courseId}/advanced/${next.slug}`} className={styles.navLink}>
            {next.title} <ArrowRight size={14} />
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`} className={styles.navLink}>
            Back to curriculum <ArrowRight size={14} />
          </Link>
        )}
      </footer>
    </article>
  );
}
