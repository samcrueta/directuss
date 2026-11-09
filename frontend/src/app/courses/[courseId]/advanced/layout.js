import { notFound } from "next/navigation";
import AdvancedShell from "@/components/advanced/AdvancedShell";
import { getAdvancedContent } from "@/lib/advancedContent";

export const dynamic = "force-dynamic";

export default async function AdvancedLayout({ children, params }) {
  const { courseId } = await params;
  const content = await getAdvancedContent(courseId);

  if (!content) notFound();

  return (
    <AdvancedShell courseId={courseId} content={content}>
      {children}
    </AdvancedShell>
  );
}
