import {
  DIRECTUS_CHARTS_CONTENT,
  DIRECTUS_CHARTS_COURSE_ID
} from "@/lib/directusChartsContent";
import {
  PAYLOAD_CHARTS_CONTENT,
  PAYLOAD_CHARTS_COURSE_ID
} from "@/lib/payloadChartsContent";
import {
  KEYSTONE_CHARTS_CONTENT,
  KEYSTONE_CHARTS_COURSE_ID
} from "@/lib/keystoneChartsContent";

export const CHART_COURSES = {
  [DIRECTUS_CHARTS_COURSE_ID]: {
    id: DIRECTUS_CHARTS_COURSE_ID,
    provider: "Directus",
    content: DIRECTUS_CHARTS_CONTENT,
    sectionHref: `/courses/${DIRECTUS_CHARTS_COURSE_ID}/charts`,
    sectionLabel: "Section 8 · Advanced Graphs",
    sectionTopLink: "Section 8 · Advanced Graphs",
    courseLabel: "Course curriculum"
  },
  [PAYLOAD_CHARTS_COURSE_ID]: {
    id: PAYLOAD_CHARTS_COURSE_ID,
    provider: "Payload",
    content: PAYLOAD_CHARTS_CONTENT,
    sectionHref: `/courses/${PAYLOAD_CHARTS_COURSE_ID}/charts`,
    sectionLabel: "Section 8 · Advanced Graphs",
    sectionTopLink: "Section 8 · Advanced Graphs",
    courseLabel: "Course curriculum"
  },
  [KEYSTONE_CHARTS_COURSE_ID]: {
    id: KEYSTONE_CHARTS_COURSE_ID,
    provider: "Keystone",
    content: KEYSTONE_CHARTS_CONTENT,
    sectionHref: `/courses/${KEYSTONE_CHARTS_COURSE_ID}/charts`,
    sectionLabel: "Section 8 · Advanced Graphs",
    sectionTopLink: "Section 8 · Advanced Graphs",
    courseLabel: "Course curriculum"
  }
};

export function getChartCourse(courseId) {
  return CHART_COURSES[courseId] || null;
}

export function isChartCourse(courseId) {
  return Boolean(getChartCourse(courseId));
}
