"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ChartShowcase from "@/components/charts/ChartShowcase";
import DeepDive from "@/components/advanced/DeepDive";
import KnowledgeCheck from "@/components/advanced/KnowledgeCheck";
import { readStoredDataset } from "@/lib/datasetData";
import styles from "@/components/charts/charts.module.css";

function toVariableName(value) {
  const words = String(value || "data")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "data";

  const name = words
    .map((word, index) => {
      const normalized = word.toLowerCase();
      return index === 0
        ? normalized
        : normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join("");

  return /^[a-zA-Z_$]/.test(name) ? name : `data${name}`;
}

function personalizeQueryCode(code, dataset) {
  const term = toVariableName(dataset?.rows?.[0]?.label || dataset?.title);
  const replacements = new Map([
    ["lessonsByTrack", `${term}LessonsByTrack`],
    ["componentsByStatus", `${term}ComponentsByStatus`],
    ["statusRows", `${term}StatusRows`],
    ["statusSeries", `${term}StatusSeries`],
    ["byStatus", `${term}StatusBreakdown`],
    ["byTrack", `${term}TrackBreakdown`],
    ["recentNotes", `${term}Records`],
    ["components", `${term}Records`],
    ["notes", `${term}Records`],
    ["lessons", `${term}Lessons`],
    ["activity", `${term}Activity`],
    ["chartPayload", `${term}ChartData`],
  ]);

  return String(code || "")
    .split(/((?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*')|(?:`(?:\\.|[^`\\])*`))/g)
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part.replace(
        /\b(?:lessonsByTrack|componentsByStatus|statusRows|statusSeries|byStatus|byTrack|recentNotes|components|notes|lessons|activity|chartPayload)\b/g,
        (identifier) => replacements.get(identifier),
      );
    })
    .join("");
}

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

export default function ChartsLessonBody({
  courseId,
  data,
  content,
  headingLevel = "h2",
  idPrefix = "charts"
}) {
  const Heading = headingLevel;
  const StepHeading = headingLevel === "h2" ? "h3" : "h4";
  const { lesson } = content;
  const [storedDataset, setStoredDataset] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStoredDataset(readStoredDataset(data.provider));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data.provider]);

  const queryCode = personalizeQueryCode(lesson.code, storedDataset);

  return (
    <div className={styles.content}>
      <p className={styles.lessonLead}>{lesson.outcome}</p>

      <section
        className={styles.block}
        aria-labelledby={`${idPrefix}-mental-model`}
      >
        <Heading id={`${idPrefix}-mental-model`} className={styles.blockLabel}>
          Mental model
        </Heading>
        <ul className={styles.mentalList}>
          {lesson.mental_model.map((item) => (
            <li key={item} className={styles.mentalItem}>
              <span className={styles.mentalDot} aria-hidden="true" />
              <span>
                <RichText>{item}</RichText>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby={`${idPrefix}-build`}>
        <Heading id={`${idPrefix}-build`} className={styles.blockLabel}>
          Build it
        </Heading>
        <div className={styles.stepGrid}>
          {lesson.steps.map((step, index) => (
            <div key={step.title} className={styles.stepCard}>
              <span className={styles.stepNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <StepHeading className={styles.stepTitle}>
                {step.title}
              </StepHeading>
              <p className={styles.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {lesson.graph_types?.length ? (
        <section
          className={styles.block}
          aria-labelledby={`${idPrefix}-graph-types`}
        >
          <Heading
            id={`${idPrefix}-graph-types`}
            className={styles.blockLabel}
          >
            Pick the graph
          </Heading>
          <div className={styles.stepGrid}>
            {lesson.graph_types.map((graph) => (
              <div key={graph.name} className={styles.stepCard}>
                <StepHeading className={styles.stepTitle}>
                  {graph.name}
                </StepHeading>
                <p className={styles.stepBody}>{graph.use_when}</p>
                <p className={styles.stepWarning}>{graph.watch_for}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className={styles.block}
        aria-labelledby={`${idPrefix}-preview`}
      >
        <div className={styles.sectionHeader}>
          <div>
            <Heading
              id={`${idPrefix}-preview`}
              className={styles.blockLabel}
            >
              The showcase, live
            </Heading>
            <p className={styles.sectionCopy}>
              {lesson.preview}
            </p>
          </div>
          <Link
            href={`/courses/${courseId}/charts/showcase`}
            className={styles.textLink}
          >
            Full showcase <ArrowRight size={13} />
          </Link>
        </div>
        <ChartShowcase data={data} copy={content.showcase} mode="preview" />
      </section>

      <section className={styles.block} aria-labelledby={`${idPrefix}-query`}>
        <Heading id={`${idPrefix}-query`} className={styles.blockLabel}>
          The query
        </Heading>
        <div className={styles.codePanel}>
          <div className={styles.codeHead}>
            <span>server / charts.js</span>
            <span>{lesson.code_label || "Server SDK"}</span>
          </div>
          <pre className={styles.code}>
            <code>{queryCode}</code>
          </pre>
        </div>
        <p className={styles.codeNote}>
          The credentials stay in the server environment. The browser only
          receives the shaped series.
        </p>
      </section>

      <div className={styles.takeaway}>
        <strong>Takeaway.</strong> {lesson.takeaway}
      </div>

      <section className={styles.block} aria-labelledby={`${idPrefix}-check`}>
        <Heading id={`${idPrefix}-check`} className={styles.blockLabel}>
          Check yourself
        </Heading>
        <KnowledgeCheck check={lesson.knowledge_check} />
      </section>

      <section className={styles.block} aria-labelledby={`${idPrefix}-deeper`}>
        <Heading id={`${idPrefix}-deeper`} className={styles.blockLabel}>
          Go deeper
        </Heading>
        <DeepDive items={lesson.deep_dive} />
      </section>
    </div>
  );
}
