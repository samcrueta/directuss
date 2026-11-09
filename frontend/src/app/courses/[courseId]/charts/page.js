import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ChartsLessonBody from "@/components/charts/ChartsLessonBody";
import { getChartCourse } from "@/lib/chartCourses";
import { getChartDataForCourse } from "@/lib/chartData";
import styles from "@/components/charts/charts.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = getChartCourse(courseId);
  if (!course) return { title: "Not found" };

  return {
    title: `${course.content.section.title} · Level 8`,
    description: course.content.section.description
  };
}

export default async function ChartsLessonPage({ params }) {
  const { courseId } = await params;
  const course = getChartCourse(courseId);
  if (!course) notFound();

  const data = await getChartDataForCourse(courseId);
  const { section } = course.content;

  return (
    <article>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.pill}>Level 8 · Charts</span>
          <span className={`${styles.pill} ${styles.pillLive}`}>
            Live {course.provider} data
          </span>
        </div>
        <h1 className={styles.heroTitle}>{section.title}</h1>
        <p className={styles.heroDescription}>{section.description}</p>
        <div className={styles.actions}>
          <Link
            href={`/courses/${courseId}/charts/showcase`}
            className={styles.primaryButton}
          >
            Open the showcase <ArrowRight size={14} />
          </Link>
          <Link href={course.sectionHref} className={styles.secondaryButton}>
            <ArrowLeft size={14} /> {course.sectionLabel}
          </Link>
        </div>
      </section>

      <ChartsLessonBody
        courseId={courseId}
        data={data}
        content={course.content}
      />

      <footer className={styles.lessonFooter}>
        <Link href={course.sectionHref} className={styles.footerLink}>
          <ArrowLeft size={14} /> {course.sectionLabel}
        </Link>
        <Link href={`/courses/${courseId}`} className={styles.footerLink}>
          Course curriculum <ArrowRight size={14} />
        </Link>
      </footer>
    </article>
  );
}
