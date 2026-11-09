import { notFound, redirect } from "next/navigation";
import { getAdvancedContent } from "@/lib/advancedContent";

export const dynamic = "force-dynamic";

export default async function AdvancedIndexPage({ params }) {
  const { courseId } = await params;
  const content = await getAdvancedContent(courseId);

  if (!content) notFound();

  const first = content.lessons[0];

  if (!first) {
    return (
      <div>
        <h1>{content.section.title}</h1>
        <p>No lessons have been published yet.</p>
      </div>
    );
  }

  redirect(`/courses/${courseId}/advanced/${first.slug}`);
}
