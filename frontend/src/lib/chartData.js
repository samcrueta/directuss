import { getChartCourse } from "@/lib/chartCourses";
import { getDirectusChartData } from "@/lib/directusCharts";
import { getPayloadChartData } from "@/lib/payloadCharts";
import { getKeystoneChartData } from "@/lib/keystoneCharts";

export async function getChartDataForCourse(courseId) {
  const course = getChartCourse(courseId);
  if (!course) return null;

  if (course.provider === "Directus") {
    return getDirectusChartData();
  }

  if (course.provider === "Payload") {
    return getPayloadChartData();
  }

  if (course.provider === "Keystone") {
    return getKeystoneChartData();
  }

  return null;
}
