"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import ChartsLessonBody from "@/components/charts/ChartsLessonBody";

export default function ChartsSubtopic({ topic, courseId, data, content }) {
  return (
    <article
      id={topic.id}
      className="card-premium p-4 p-md-5 mb-5 position-relative"
      style={{ scrollMarginTop: "220px" }}
    >
      <div
        className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <span className="badge-custom mb-2 d-inline-block">
            Level 8 · Advanced Graphs
          </span>
          <h2 className="h2 fw-bold mb-1">{topic.title}</h2>
          <span className="text-muted-custom" style={{ fontSize: "0.9rem" }}>
            {topic.sectionTitle}
          </span>
        </div>
      </div>

      <p
        className="text-muted-custom mb-4"
        style={{ lineHeight: "1.7", fontSize: "1rem" }}
      >
        {content?.section?.subtopicCopy}
      </p>

      <div className="d-flex gap-2 flex-wrap mb-4">
        <Link
          href={`/courses/${courseId}/charts`}
          className="btn btn-secondary-custom d-flex align-items-center gap-2"
        >
          <BookOpen size={15} /> Open the standalone lesson
        </Link>
        <Link
          href={`/courses/${courseId}/charts/showcase`}
          className="btn btn-primary-custom d-flex align-items-center gap-2"
        >
          Full chart showcase <ArrowRight size={15} />
        </Link>
      </div>

      {data && content ? (
        <ChartsLessonBody
          courseId={courseId}
          data={data}
          content={content}
          headingLevel="h3"
          idPrefix="section8-charts"
        />
      ) : (
        <div
          className="p-3 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)"
          }}
        >
          <p className="text-muted-custom mb-0">
            Chart data is not available for this section. Open the standalone
            charts lesson to view the live showcase.
          </p>
        </div>
      )}
    </article>
  );
}
