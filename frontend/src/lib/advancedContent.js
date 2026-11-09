import { cache } from "react";
import { getDirectusAdvancedContent } from "./directus";
import { getKeystoneAdvancedContent } from "./keystone";
import { getPayloadAdvancedContent } from "./payload";

const COURSE_LOADERS = {
  "directus-from-beginner-to-advanced": getDirectusAdvancedContent,
  "payload-cms": getPayloadAdvancedContent,
  keystonejs: getKeystoneAdvancedContent
};

export const getAdvancedContent = cache(async (courseId) => {
  const loader = COURSE_LOADERS[courseId];
  if (!loader) return null;
  return loader();
});

export async function getAdvancedLesson(courseId, slug) {
  const content = await getAdvancedContent(courseId);
  if (!content) return { content: null, lesson: null };
  return {
    content,
    lesson: content.lessons.find((item) => item.slug === slug) || null
  };
}
