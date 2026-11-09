import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ChartShowcase from "@/components/charts/ChartShowcase";
import { getChartCourse } from "@/lib/chartCourses";
import { getChartDataForCourse } from "@/lib/chartData";
import styles from "@/components/charts/charts.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = getChartCourse(courseId);
  if (!course) return { title: "Not found" };

  return {
    title: `Charts showcase · ${course.content.section.title}`,
    description: `A live chart showcase built from lessons and activity in ${course.provider}.`
  };
}

export default async function ChartsShowcasePage({ params }) {
  const { courseId } = await params;
  const course = getChartCourse(courseId);
  if (!course) notFound();

  const data = await getChartDataForCourse(courseId);
  const { showcase } = course.content;

  return (
    <article>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.pill}>Level 8 · Showcase</span>
          <span className={styles.pill}>Aggregates only</span>
        </div>
        <h1 className={styles.heroTitle}>{showcase.heroTitle}</h1>
        <p className={styles.heroDescription}>{showcase.heroDescription}</p>
        <div className={styles.actions}>
          <Link
            href={`/courses/${courseId}/charts`}
            className={styles.primaryButton}
          >
            <ArrowLeft size={14} /> Read the lesson
          </Link>
          <Link href={course.sectionHref} className={styles.secondaryButton}>
            {course.sectionLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div className={styles.content}>
        <ChartShowcase data={data} copy={showcase} mode="full" />

        <section className={styles.showcaseNote} aria-labelledby="showcase-notes">
          <h2 id="showcase-notes" className={styles.blockLabel}>
            What you are looking at
          </h2>
          {showcase.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </section>
      </div>
    </article>
  );
}
