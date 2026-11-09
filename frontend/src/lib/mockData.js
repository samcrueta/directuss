import { DIRECTUS_CONTENT } from './courseData/directusContent';
import { PAYLOAD_CONTENT } from './courseData/payloadContent';
import { KEYSTONE_CONTENT } from './courseData/keystoneContent';

const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const DIRECTUS_SECTIONS = [
  "Introduction and Fundamentals",
  "Installation and Setup",
  "Database Management",
  "Content Management",
  "API and Development",
  "Security and Administration",
  "Advanced Directus Topics",
  "Advanced Graphs with Directus"
];

const DIRECTUS_SECTION_IDS = {
  8: "section-8-practical-projects-using-directus"
};

const PAYLOAD_SECTIONS = [
  "Introduction and Fundamentals",
  "Installation and Setup",
  "Database and Collection Management",
  "Content Management",
  "API and Development",
  "Security and Administration",
  "Advanced Payload CMS Topics",
  "Advanced Graphs with Payload CMS"
];

const PAYLOAD_SECTION_IDS = {
  8: "payload-section-8-practical-projects-using-payload-cms"
};

const KEYSTONE_SECTIONS = [
  "Introduction and Fundamentals",
  "Installation and Setup",
  "Database and List Management",
  "Content Management",
  "API and Development",
  "Security and Administration",
  "Advanced KeystoneJS Topics",
  "Advanced Graphs with KeystoneJS"
];

const KEYSTONE_SECTION_IDS = {
  8: "keystone-section-8-practical-projects-using-keystonejs"
};

export const MOCK_COURSES = [
  {
    id: "directus-from-beginner-to-advanced",
    title: "Directus: From Beginner to Advanced",
    description: "A complete 64-topic masterclass covering Directus fundamentals, Docker setup, relational database modeling, content workflows, REST & GraphQL APIs, RBAC security, Flows automation, and advanced graph dashboards.",
    difficulty: "Beginner to Advanced",
    lessonsCount: DIRECTUS_SECTIONS.length,
    progress: 0,
    lessons: DIRECTUS_SECTIONS.map((title, index) => ({
      id:
        DIRECTUS_SECTION_IDS[index + 1] ||
        `section-${index + 1}-${slugify(title)}`,
      title: `${index + 1}. ${title}`,
      status: index === 0 ? "current" : "available"
    }))
  },
  {
    id: "payload-cms",
    title: "Payload CMS",
    description: "Master Payload CMS from beginner to advanced: code-first TypeScript schemas, Next.js App Router integration, PostgreSQL & MongoDB database adapters, Local API, access control functions, and advanced graph dashboards.",
    difficulty: "Beginner to Advanced",
    lessonsCount: PAYLOAD_SECTIONS.length,
    progress: 0,
    lessons: PAYLOAD_SECTIONS.map((title, index) => ({
      id:
        PAYLOAD_SECTION_IDS[index + 1] ||
        `payload-section-${index + 1}-${slugify(title)}`,
      title: `${index + 1}. ${title}`,
      status: "available"
    }))
  },
  {
    id: "keystonejs",
    title: "KeystoneJS",
    description: "Learn KeystoneJS through GraphQL-native schemas, Prisma ORM database mapping, automated queries & mutations, custom Next.js admin dashboards, session security, and advanced graph dashboards.",
    difficulty: "Beginner to Advanced",
    lessonsCount: KEYSTONE_SECTIONS.length,
    progress: 0,
    lessons: KEYSTONE_SECTIONS.map((title, index) => ({
      id:
        KEYSTONE_SECTION_IDS[index + 1] ||
        `keystone-section-${index + 1}-${slugify(title)}`,
      title: `${index + 1}. ${title}`,
      status: "available"
    }))
  }
];

export const LESSON_CONTENT = {
  ...DIRECTUS_CONTENT,
  ...PAYLOAD_CONTENT,
  ...KEYSTONE_CONTENT
};
