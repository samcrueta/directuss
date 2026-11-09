import { notFound } from "next/navigation";
import LessonView from "@/components/advanced/LessonView";
import { getAdvancedLesson } from "@/lib/advancedContent";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { courseId, lessonSlug } = await params;
  const { content, lesson } = await getAdvancedLesson(courseId, lessonSlug);
  if (!lesson) return { title: "Lesson not found · Advanced" };
  return {
    title: `${lesson.title} · ${content.section.title}`,
    description: lesson.outcome
  };
}

export default async function AdvancedLessonPage({ params }) {
  const { courseId, lessonSlug } = await params;
  const { content, lesson } = await getAdvancedLesson(courseId, lessonSlug);

  if (!content || !lesson) notFound();

  return (
    <LessonView
      key={lesson.slug}
      courseId={courseId}
      lesson={lesson}
      lessons={content.lessons}
      catalog={content.catalog}
      builder={content.builder}
      showcaseHref={content.showcaseHref}
    />
  );
}
