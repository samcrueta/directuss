import { getChartCourse } from "@/lib/chartCourses";
import { getChartDataForCourse } from "@/lib/chartData";
import { LESSON_CONTENT, MOCK_COURSES } from "@/lib/mockData";
import LessonClient from "./LessonClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { courseId, lessonId } = await params;
  const course = MOCK_COURSES.find((item) => item.id === courseId);
  const lesson = LESSON_CONTENT[lessonId];

  if (!course || !lesson) return { title: "Lesson not found" };

  const isSingleLesson = lesson.subtopics.length === 1;

  return {
    title: `${lesson.title} · ${course.title}`,
    description: isSingleLesson
      ? `Work through ${lesson.title} in one advanced lesson.`
      : `Explore ${lesson.subtopics.length} practical subtopics in ${lesson.title}.`
  };
}

export default async function LessonPage({ params }) {
  const { courseId, lessonId } = await params;
  const course = MOCK_COURSES.find((item) => item.id === courseId);
  const lesson = LESSON_CONTENT[lessonId];

  const courseSummary = course
    ? {
        id: course.id,
        title: course.title,
        lessonCount: course.lessons.length
      }
    : null;

  const chartCourse = getChartCourse(courseId);
  const hasCharts = lesson?.subtopics.some((topic) => topic.kind === "charts");
  const chartData = hasCharts && chartCourse
    ? await getChartDataForCourse(courseId)
    : null;

  return (
    <LessonClient
      course={courseSummary}
      lesson={lesson}
      chartData={chartData}
      chartCourse={chartCourse}
    />
  );
}
