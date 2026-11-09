import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getChartCourse } from "@/lib/chartCourses";
import styles from "@/components/charts/charts.module.css";

export const dynamic = "force-dynamic";

export default async function ChartsLayout({ children, params }) {
  const { courseId } = await params;
  const course = getChartCourse(courseId);

  if (!course) notFound();

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
            {course.courseLabel}
          </Link>
          <Link href={course.sectionHref} className={styles.topLink}>
            {course.sectionTopLink}
          </Link>
          <Link href={`/courses/${courseId}/charts`} className={styles.topLink}>
            Lesson
          </Link>
          <Link
            href={`/courses/${courseId}/charts/showcase`}
            className={styles.topLink}
          >
            Showcase <ExternalLink size={12} />
          </Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
