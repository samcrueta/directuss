"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Terminal,
  BookOpen,
  Lightbulb,
  HelpCircle,
  ShieldCheck,
  Code2,
  Layers,
  LineChart
} from "lucide-react";

const ChartsSubtopic = dynamic(() =>
  import("@/components/charts/ChartsSubtopic")
);

export default function LessonClient({ course, lesson, chartData, chartCourse }) {
  const [activeSubtopicId, setActiveSubtopicId] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  if (!course || !lesson) {
    return (
      <main className="container py-5">
        <div className="card-premium p-5 text-center">
          <h1 className="fw-bold mb-2">Lesson not found</h1>
          <p className="text-muted-custom mb-4">
            The requested lesson could not be loaded.
          </p>
          <Link href="/courses" className="btn btn-primary-custom">
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 2000);
  };

  const displayedSubtopics =
    activeSubtopicId === "all"
      ? lesson.subtopics
      : lesson.subtopics.filter((topic) => topic.id === activeSubtopicId);

  const activeIndex = lesson.subtopics.findIndex(
    (topic) => topic.id === activeSubtopicId
  );

  const chartsSubtopic = lesson.subtopics.find(
    (topic) => topic.kind === "charts"
  );

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link
            href="/"
            className="navbar-brand text-white fw-bold fs-5 d-flex align-items-center gap-2"
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                background: "var(--accent)",
                borderRadius: "4px"
              }}
            />
            LUMINA ACADEMY
          </Link>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <Link
              href={`/courses/${course.id}`}
              className="text-white text-decoration-none d-flex align-items-center gap-1"
            >
              <ArrowLeft size={16} /> Course Curriculum
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-5" style={{ maxWidth: "960px" }}>
        {/* Navigation Breadcrumb */}
        <Link
          href={`/courses/${course.id}`}
          className="text-muted-custom text-decoration-none d-flex align-items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} /> Back to {course.title}
        </Link>

        {/* Section Header */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge-custom">
              Section {lesson.sectionNumber} of {course.lessonCount}
            </span>
            <span className="text-muted-custom" style={{ fontSize: "0.9rem" }}>
              • {lesson.subtopics.length}{" "}
              {lesson.subtopics.length === 1
                ? "In-Depth Lesson"
                : "In-Depth Subtopics"}
            </span>
          </div>
          <h1 className="display-5 fw-bold mb-2">{lesson.title}</h1>
          <p className="text-muted-custom lead" style={{ fontSize: "1.05rem" }}>
            {chartsSubtopic
              ? chartCourse?.content.section.headerCopy ||
                "Choose the right graph, query the CMS efficiently, shape chart-ready series on the server, and render an accessible live dashboard."
              : "Explore practical implementations, architectural explanations, code examples, and real-world case studies for each topic below."}
          </p>
          {lesson.images?.length ? (
            <div className="row g-3 mt-2" aria-label={`${lesson.title} reference images`}>
              {lesson.images.map((image) => (
                <figure
                  className={lesson.images.length === 1 ? "col-12 mb-0" : "col-12 col-md-6 col-xl-4 mb-0"}
                  key={image.src}
                  style={lesson.images.length === 1 ? { maxWidth: "720px", marginInline: "auto" } : undefined}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={675}
                    className="w-100 rounded border"
                    style={{
                      aspectRatio: "16 / 9",
                      height: "auto",
                      maxHeight: "405px",
                      objectFit: "cover",
                      borderColor: "var(--border)"
                    }}
                  />
                  <figcaption className="text-muted-custom mt-2" style={{ fontSize: "0.78rem" }}>
                    {image.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </div>

        {chartsSubtopic ? (
          <div
            className="card-premium p-3 p-md-4 mb-4"
            style={{ borderColor: "rgba(59, 130, 246, 0.35)" }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                <span
                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.35)"
                  }}
                >
                  <LineChart size={20} color="#93c5fd" />
                </span>
                <div>
                  <span className="badge-custom mb-2 d-inline-block">
                    Level 8 · Advanced Graphs
                  </span>
                  <p className="h5 fw-bold mb-1">{chartsSubtopic.title}</p>
                  <p
                    className="text-muted-custom mb-0"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {chartCourse?.content.section.cardDescription ||
                      "Query live CMS records, shape the series on the server, and render an advanced graph showcase without exposing credentials."}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveSubtopicId(chartsSubtopic.id)}
                  className="btn btn-primary-custom btn-sm"
                >
                  Open the Level 8 lesson
                </button>
                <Link
                  href={`/courses/${course.id}/charts/showcase`}
                  className="btn btn-secondary-custom btn-sm"
                >
                  Live showcase
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Subtopic Filter Bar */}
        {lesson.subtopics.length > 1 ? (
        <div className="card-premium p-3 mb-4 sticky-top" style={{ top: "84px", zIndex: 10 }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span
              className="fw-bold d-flex align-items-center gap-2"
              style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              <Layers size={14} color="var(--accent)" /> Subtopic Navigation
            </span>
            <span className="text-muted-custom" style={{ fontSize: "0.8rem" }}>
              {activeSubtopicId === "all"
                ? `Showing all ${lesson.subtopics.length} subtopics`
                : `Viewing Subtopic ${activeIndex + 1} of ${lesson.subtopics.length}`}
            </span>
          </div>
          <div className="d-flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
            <button
              onClick={() => setActiveSubtopicId("all")}
              className={`btn btn-sm ${
                activeSubtopicId === "all"
                  ? "btn-primary-custom"
                  : "btn-secondary-custom"
              }`}
              style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}
            >
              All Subtopics ({lesson.subtopics.length})
            </button>
            {lesson.subtopics.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveSubtopicId(t.id)}
                className={`btn btn-sm ${
                  activeSubtopicId === t.id
                    ? "btn-primary-custom"
                    : "btn-secondary-custom"
                }`}
                style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}
              >
                {idx + 1}. {t.title.length > 28 ? t.title.slice(0, 26) + "..." : t.title}
              </button>
            ))}
          </div>
        </div>
        ) : null}

        {/* Subtopics Content List */}
        {displayedSubtopics.map((topic) =>
          topic.kind === "charts" ? (
            <ChartsSubtopic
              key={topic.id}
              topic={topic}
              courseId={course.id}
              data={chartData}
              content={chartCourse?.content}
            />
          ) : (
            <article
              key={topic.id}
              id={topic.id}
              className="card-premium p-4 p-md-5 mb-5 position-relative"
              style={{ scrollMarginTop: "220px" }}
            >
              {/* Subtopic Header */}
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="badge-custom mb-2 d-inline-block">
                    Subtopic {topic.topicIndex} of {lesson.subtopics.length}
                  </span>
                  <h2 className="h2 fw-bold mb-1">{topic.title}</h2>
                  <span className="text-muted-custom" style={{ fontSize: "0.9rem" }}>
                    {lesson.title}
                  </span>
                </div>
              </div>

              {/* 1. Introduction */}
              <section className="mb-4">
                <h3 className="h5 fw-bold text-white d-flex align-items-center gap-2 mb-2">
                  <BookOpen size={18} color="var(--accent)" /> 1. Overview & Context
                </h3>
                <p className="text-muted-custom mb-0" style={{ lineHeight: "1.7", fontSize: "1rem" }}>
                  {topic.introduction}
                </p>
                {topic.images?.length ? (
                  <div className="row g-3 mt-2" aria-label={`${topic.title} reference images`}>
                    {topic.images.map((image) => (
                      <figure
                        className={topic.images.length === 1 ? "col-12 mb-0" : "col-12 col-md-6 col-xl-4 mb-0"}
                        key={image.src}
                        style={topic.images.length === 1 ? { maxWidth: "720px", marginInline: "auto" } : undefined}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={1200}
                          height={675}
                          className="w-100 rounded border"
                          style={{
                            aspectRatio: "16 / 9",
                            height: "auto",
                            maxHeight: "405px",
                            objectFit: "cover",
                            borderColor: "var(--border)"
                          }}
                        />
                        <figcaption className="text-muted-custom mt-2" style={{ fontSize: "0.78rem" }}>
                          {image.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </section>

              {/* 2. Definition & Architecture */}
              <section className="mb-4 p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.02)", borderLeft: "3px solid var(--accent)" }}>
                <h3 className="h6 fw-bold text-white mb-2">
                  2. Technical Definition & Architecture
                </h3>
                <p className="text-muted-custom mb-0" style={{ lineHeight: "1.7", fontSize: "0.95rem" }}>
                  {topic.definition}
                </p>
              </section>

              {/* 3. Key Concepts */}
              <section className="mb-4">
                <h3 className="h5 fw-bold text-white d-flex align-items-center gap-2 mb-3">
                  <Code2 size={18} color="var(--accent)" /> 3. Key Concepts & Components
                </h3>
                <div className="d-flex flex-wrap gap-2">
                  {topic.concepts.map((concept) => (
                    <span
                      key={concept}
                      className="p-2 px-3 rounded-pill"
                      style={{
                        background: "var(--surface-active)",
                        border: "1px solid var(--border)",
                        fontSize: "0.85rem",
                        color: "#e2e8f0"
                      }}
                    >
                      • {concept}
                    </span>
                  ))}
                </div>
              </section>

              {/* 4. How It Works */}
              <section className="mb-4">
                <h3 className="h5 fw-bold text-white mb-3">4. How It Operates Under the Hood</h3>
                <div className="d-flex flex-column gap-2">
                  {topic.howItWorks.map((step, idx) => (
                    <div
                      key={step}
                      className="p-3 rounded d-flex gap-3 align-items-start"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <span
                        className="badge rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "24px",
                          height: "24px",
                          background: "var(--accent)",
                          color: "#000",
                          fontWeight: "bold",
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-muted-custom" style={{ lineHeight: "1.6" }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Step-by-Step Tutorial */}
              <section className="mb-4">
                <h3 className="h5 fw-bold text-white mb-3">5. Step-by-Step Implementation Guide</h3>
                <ol className="text-muted-custom ps-3 mb-0" style={{ lineHeight: "1.8" }}>
                  {topic.tutorial.map((step) => (
                    <li key={step} className="mb-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </section>

              {/* 6. Practical Code Example */}
              <section className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h5 fw-bold text-white d-flex align-items-center gap-2 mb-0">
                    <Terminal size={18} color="var(--accent)" /> 6. Practical Code Example
                  </h3>
                  <button
                    onClick={() => handleCopy(topic.id, topic.example)}
                    className="btn btn-sm btn-secondary-custom d-flex align-items-center gap-2"
                    style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                  >
                    {copiedId === topic.id ? (
                      <>
                        <Check size={14} color="#10b981" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <p className="text-muted-custom" style={{ fontSize: "0.9rem" }}>
                  Executable or production-ready implementation snippet:
                </p>
                <pre
                  className="p-3 rounded position-relative"
                  style={{
                    background: "#090d16",
                    color: "#e2e8f0",
                    overflowX: "auto",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.88rem",
                    lineHeight: "1.6"
                  }}
                >
                  <code>{topic.example}</code>
                </pre>
              </section>

              {/* 7. Expected Output */}
              <section className="mb-4">
                <h3 className="h5 fw-bold text-white mb-2">7. Expected Execution Output</h3>
                <div
                  className="p-3 rounded"
                  style={{
                    background: "#050811",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    color: "#a7f3d0",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.85rem",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom" style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "0.75rem", color: "#6ee7b7", textTransform: "uppercase" }}>Terminal / API Response</span>
                  </div>
                  {topic.expected}
                </div>
              </section>

              {/* 8. Real-World Application */}
              <section className="mb-4 p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
                <h3 className="h6 fw-bold text-white d-flex align-items-center gap-2 mb-2">
                  <Lightbulb size={16} color="var(--accent)" /> 8. Real-World Production Application
                </h3>
                <p className="text-muted-custom mb-0" style={{ lineHeight: "1.7", fontSize: "0.95rem" }}>
                  {topic.application}
                </p>
              </section>

              {/* 9. Considerations */}
              <section className="mb-4">
                <h3 className="h5 fw-bold text-white d-flex align-items-center gap-2 mb-3">
                  <ShieldCheck size={18} color="var(--accent)" /> 9. Advantages & Critical Considerations
                </h3>
                <ul className="text-muted-custom ps-3 mb-0" style={{ lineHeight: "1.8" }}>
                  {topic.considerations.map((item) => (
                    <li key={item} className="mb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 10. Summary */}
              <section className="mb-4 p-3 rounded" style={{ background: "rgba(56, 189, 248, 0.05)", borderLeft: "3px solid #38bdf8" }}>
                <h3 className="h6 fw-bold text-white mb-1">10. Lesson Summary</h3>
                <p className="text-muted-custom mb-0" style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                  {topic.summary}
                </p>
              </section>

              {/* 11. Knowledge Check */}
              <section className="mt-4 pt-3 border-top" style={{ borderColor: "var(--border)" }}>
                <h3 className="h5 fw-bold text-white d-flex align-items-center gap-2 mb-3">
                  <HelpCircle size={18} color="var(--accent)" /> 11. Knowledge Check
                </h3>
                <ol className="text-muted-custom ps-3 mb-3" style={{ lineHeight: "1.8" }}>
                  {topic.questions.map((question) => (
                    <li key={question} className="mb-2 fw-semibold text-white">
                      {question}
                    </li>
                  ))}
                </ol>

                <details className="p-3 rounded" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <summary className="fw-bold text-accent" style={{ cursor: "pointer", userSelect: "none" }}>
                    Reveal Verified Answer Key
                  </summary>
                  <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border)" }}>
                    <ol className="text-muted-custom ps-3 mb-0" style={{ lineHeight: "1.8" }}>
                      {topic.answers.map((answer, aIdx) => (
                        <li key={aIdx} className="mb-3">
                          <span className="text-white fw-bold d-block mb-1">Answer {aIdx + 1}:</span>
                          {answer}
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              </section>
            </article>
          )
        )}

        {/* Single-subtopic next/prev pager */}
        {activeSubtopicId !== "all" && lesson.subtopics.length > 1 && (
          <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: "var(--border)" }}>
            {activeIndex > 0 ? (
              <button
                onClick={() => setActiveSubtopicId(lesson.subtopics[activeIndex - 1].id)}
                className="btn btn-secondary-custom d-flex align-items-center gap-2"
              >
                <ChevronLeft size={16} /> Previous: {lesson.subtopics[activeIndex - 1].title}
              </button>
            ) : (
              <div />
            )}

            {activeIndex < lesson.subtopics.length - 1 ? (
              <button
                onClick={() => setActiveSubtopicId(lesson.subtopics[activeIndex + 1].id)}
                className="btn btn-primary-custom d-flex align-items-center gap-2 ms-auto"
              >
                Next: {lesson.subtopics[activeIndex + 1].title} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setActiveSubtopicId("all")}
                className="btn btn-primary-custom d-flex align-items-center gap-2 ms-auto"
              >
                View All Subtopics <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        )}

        {/* Section Completion Checkpoint */}
        <div className="card-premium p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <CheckCircle2 size={32} color="var(--accent)" />
            <div>
              <h2 className="h5 fw-bold mb-1">Section Checkpoint Completed</h2>
              <p className="text-muted-custom mb-0">
                You have reviewed {lesson.subtopics.length === 1 ? "the" : "all"}{" "}
                {lesson.subtopics.length}{" "}
                {lesson.subtopics.length === 1 ? "lesson" : "subtopics"} in{" "}
                {lesson.title}.
              </p>
            </div>
          </div>
          <Link href={`/courses/${course.id}`} className="btn btn-primary-custom">
            Back to Curriculum
          </Link>
        </div>
      </main>
    </>
  );
}
