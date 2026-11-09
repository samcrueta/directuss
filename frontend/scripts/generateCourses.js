// frontend/scripts/generateCourses.js
const fs = require("fs");
const path = require("path");

const targetDir = path.join(__dirname, "..", "src", "lib", "courseData");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// =========================================================================
// SECTION DEFINITIONS
// =========================================================================
const DIRECTUS_SECTIONS = [
  [
    "Introduction and Fundamentals",
    [
      "What is Directus?",
      "History and Evolution of Directus",
      "Features and Capabilities of Directus",
      "Understanding Headless CMS",
      "Directus vs. Traditional CMS",
      "Directus vs. WordPress",
      "Advantages and Disadvantages of Directus",
      "Real-World Applications of Directus",
    ],
  ],
  [
    "Installation and Setup",
    [
      "System Requirements for Directus",
      "Installing Directus Using Node.js",
      "Installing Directus Using Docker",
      "Setting Up Directus on Ubuntu Server",
      "Configuring Directus Environment Variables",
      "Connecting Directus to a Database",
      "Exploring the Directus Admin Dashboard",
    ],
  ],
  [
    "Database Management",
    [
      "Understanding Collections and Fields",
      "Creating and Managing Collections",
      "Creating Relationships Between Collections",
      "One-to-One Relationships",
      "One-to-Many Relationships",
      "Many-to-Many Relationships",
      "Managing Database Records",
      "Understanding Data Types in Directus",
    ],
  ],
  [
    "Content Management",
    [
      "Creating and Managing Content",
      "Managing Images and Media Files",
      "Uploading and Organizing Files",
      "Creating Dynamic Content",
      "Managing Users and Roles",
      "Content Versioning and Revisions",
      "Publishing and Draft Content",
    ],
  ],
  [
    "API and Development",
    [
      "Introduction to Directus API",
      "Understanding REST API",
      "Understanding GraphQL API",
      "Fetching Data Using JavaScript",
      "Connecting Directus to HTML and CSS",
      "Connecting Directus to React",
      "CRUD Operations Using Directus",
      "API Authentication",
      "Using API Tokens",
      "Filtering, Sorting, and Searching Data",
    ],
  ],
  [
    "Security and Administration",
    [
      "User Authentication in Directus",
      "Role-Based Access Control (RBAC)",
      "Permissions and Access Policies",
      "Managing Administrator Accounts",
      "Data Security and Protection",
      "Configuring Public and Private Access",
      "Backup and Database Recovery",
    ],
  ],
  [
    "Advanced Directus Topics",
    [
      "Introduction to Directus Flows",
      "Creating Automated Workflows",
      "Understanding Directus Extensions",
      "Creating Custom Interfaces",
      "Creating Custom Modules",
      "Webhooks and Event Triggers",
      "Real-Time Data Using WebSockets",
      "Integrating Third-Party Applications",
    ],
  ],
  [
    "Practical Projects Using Directus",
    [
      "Creating a Student Information Management System",
      "Building an Online Learning Platform",
      "Creating an E-Commerce Product Management System",
      "Building a Blog Website Using Directus",
      "Creating an Inventory Management System",
      "Developing a School Announcement System",
      "Building a Library Management System",
      "Creating a Portfolio Website Using Directus",
    ],
  ],
];

const PAYLOAD_SECTIONS = [
  [
    "Introduction and Fundamentals",
    [
      "What is Payload CMS?",
      "History and Evolution of Payload CMS",
      "Features and Capabilities of Payload CMS",
      "Understanding Headless CMS",
      "Payload CMS vs. Traditional CMS",
      "Payload CMS vs. WordPress",
      "Payload CMS vs. Directus",
      "Advantages and Disadvantages of Payload CMS",
      "Real-World Applications of Payload CMS",
    ],
  ],
  [
    "Installation and Setup",
    [
      "System Requirements for Payload CMS",
      "Installing Node.js and npm",
      "Creating a New Payload CMS Project",
      "Installing Payload CMS Using the CLI",
      "Setting Up Payload CMS with MongoDB",
      "Setting Up Payload CMS with PostgreSQL",
      "Configuring Environment Variables",
      "Exploring the Payload Admin Dashboard",
    ],
  ],
  [
    "Database and Collection Management",
    [
      "Understanding Collections in Payload CMS",
      "Creating and Managing Collections",
      "Understanding Global Configurations",
      "Creating and Managing Fields",
      "Understanding Field Types",
      "Creating Relationships Between Collections",
      "One-to-One Relationships",
      "One-to-Many Relationships",
      "Many-to-Many Relationships",
      "Managing Database Records",
    ],
  ],
  [
    "Content Management",
    [
      "Creating and Managing Content",
      "Managing Images and Media Files",
      "Uploading and Organizing Files",
      "Creating Dynamic Content",
      "Managing Users and Roles",
      "Drafts and Publishing Workflow",
      "Content Versioning and Revisions",
      "Creating Custom Admin Views",
    ],
  ],
  [
    "API and Development",
    [
      "Introduction to Payload REST API",
      "Understanding GraphQL API",
      "Understanding Local API",
      "Fetching Data Using JavaScript",
      "Connecting Payload CMS to HTML and CSS",
      "Connecting Payload CMS to React",
      "Connecting Payload CMS to Next.js",
      "CRUD Operations Using Payload CMS",
      "API Authentication",
      "Using Access Tokens",
      "Filtering, Sorting, and Searching Data",
    ],
  ],
  [
    "Security and Administration",
    [
      "User Authentication in Payload CMS",
      "Role-Based Access Control (RBAC)",
      "Understanding Access Control Functions",
      "Managing Administrator Accounts",
      "Data Security and Protection",
      "Configuring Public and Private Access",
      "Hooks and Data Validation",
      "Backup and Database Recovery",
    ],
  ],
  [
    "Advanced Payload CMS Topics",
    [
      "Introduction to Payload Hooks",
      "Creating Automated Workflows",
      "Understanding Payload Plugins",
      "Creating Custom Admin Components",
      "Creating Custom Fields",
      "Email Integration and Configuration",
      "Webhooks and Event Triggers",
      "Integrating Third-Party Applications",
    ],
  ],
  [
    "Practical Projects Using Payload CMS",
    [
      "Creating a Student Information Management System",
      "Building an Online Learning Platform",
      "Creating an E-Commerce Product Management System",
      "Building a Blog Website Using Payload CMS",
      "Creating an Inventory Management System",
      "Developing a School Announcement System",
      "Building a Library Management System",
      "Creating a Portfolio Website Using Payload CMS",
    ],
  ],
];

const KEYSTONE_SECTIONS = [
  [
    "Introduction and Fundamentals",
    [
      "What is KeystoneJS?",
      "History and Evolution of KeystoneJS",
      "Features and Capabilities of KeystoneJS",
      "Understanding Headless CMS",
      "Understanding GraphQL and Its Role in KeystoneJS",
      "KeystoneJS vs. Traditional CMS",
      "KeystoneJS vs. WordPress",
      "KeystoneJS vs. Directus",
      "KeystoneJS vs. Payload CMS",
      "Advantages and Disadvantages of KeystoneJS",
      "Real-World Applications of KeystoneJS",
    ],
  ],
  [
    "Installation and Setup",
    [
      "System Requirements for KeystoneJS",
      "Installing Node.js and npm",
      "Creating a New KeystoneJS Project",
      "Installing KeystoneJS Using npm",
      "Setting Up KeystoneJS with SQLite",
      "Setting Up KeystoneJS with PostgreSQL",
      "Setting Up KeystoneJS with MySQL",
      "Configuring Environment Variables",
      "Exploring the KeystoneJS Admin UI",
    ],
  ],
  [
    "Database and List Management",
    [
      "Understanding Lists in KeystoneJS",
      "Creating and Managing Lists",
      "Understanding Fields and Field Types",
      "Creating and Configuring Fields",
      "Understanding Database Models",
      "Creating Relationships Between Lists",
      "One-to-One Relationships",
      "One-to-Many Relationships",
      "Many-to-Many Relationships",
      "Managing Database Records",
      "Understanding Migrations and Database Updates",
    ],
  ],
  [
    "Content Management",
    [
      "Creating and Managing Content",
      "Managing Images and Media Files",
      "Uploading and Organizing Files",
      "Creating Dynamic Content",
      "Managing Users and Roles",
      "Organizing Content Using Relationships",
      "Creating Custom Admin UI Views",
      "Managing Content Through the Admin UI",
      "Implementing Content Validation",
    ],
  ],
  [
    "API and Development",
    [
      "Introduction to KeystoneJS API",
      "Understanding GraphQL API",
      "Understanding GraphQL Queries",
      "Understanding GraphQL Mutations",
      "Fetching Data Using JavaScript",
      "Connecting KeystoneJS to HTML and CSS",
      "Connecting KeystoneJS to React",
      "Connecting KeystoneJS to Next.js",
      "Performing CRUD Operations Using GraphQL",
      "API Authentication",
      "Using Sessions for User Authentication",
      "Filtering, Sorting, and Searching Data",
    ],
  ],
  [
    "Security and Administration",
    [
      "User Authentication in KeystoneJS",
      "Role-Based Access Control (RBAC)",
      "Understanding Access Control Rules",
      "Managing Administrator Accounts",
      "Data Security and Protection",
      "Configuring Public and Private Access",
      "Implementing Session Management",
      "Data Validation and Security Policies",
      "Database Backup and Recovery",
    ],
  ],
  [
    "Advanced KeystoneJS Topics",
    [
      "Introduction to KeystoneJS Hooks",
      "Creating Custom GraphQL Queries and Mutations",
      "Customizing the Admin UI",
      "Creating Custom Fields",
      "Implementing File and Image Uploads",
      "Integrating Third-Party Applications",
      "Email Integration and Configuration",
      "Deploying KeystoneJS to a Production Server",
    ],
  ],
  [
    "Practical Projects Using KeystoneJS",
    [
      "Creating a Student Information Management System",
      "Building an Online Learning Platform",
      "Creating an E-Commerce Product Management System",
      "Building a Blog Website Using KeystoneJS",
      "Creating an Inventory Management System",
      "Developing a School Announcement System",
      "Building a Library Management System",
      "Creating a Portfolio Website Using KeystoneJS",
    ],
  ],
];

// Add real Directus images here. Local paths are resolved from frontend/public.
// Section and topic indexes are 1-based and follow DIRECTUS_SECTIONS.
const DIRECTUS_IMAGE_PATHS = {
  1: {
    // Use "section" for an optional section-header image.
    1: ["public/images/directus/1/1/1.1.png"],
    2: ["public/images/directus/1/2/1.avif"],
    3: ["public/images/directus/1/3/1.jpeg"],

    5: ["public/images/directus/1/5/1.jpeg"],
    6: ["public/images/directus/1/6/1.jpeg"],
    8: ["public/images/directus/1/8/1.jpeg"],
  },
  2: {
    1: ["public/images/directus/2/1/1.jpeg"],
    3: ["public/images/directus/2/3/1.png"],
    4: ["public/images/directus/2/4/1.png"],
    6: ["public/images/directus/2/6/1.png"],
    7: ["public/images/directus/2/7/1.jpeg"],
  },
  3: {
    1: ["public/images/directus/3/1/1.webp"],
    2: ["public/images/directus/3/2/1.png"],
    3: ["public/images/directus/3/3/1.png"],
    7: ["public/images/directus/3/7/1.webp"],
  },
  4: {
    1: ["public/images/directus/4/1/1.gif"],
    2: ["public/images/directus/4/2/1.jpeg"],
    3: ["public/images/directus/4/3/1.jpeg"],
    4: ["public/images/directus/4/4/1.png"],
    5: ["public/images/directus/4/5/1.webp"],
    6: ["public/images/directus/4/6/1.png"],
    7: ["public/images/directus/4/7/1.png"],
  },
  5: {
    1: ["public/images/directus/5/1/1.png"],
    3: ["public/images/directus/5/3/1.webp"],
    7: ["public/images/directus/5/7/1.png"],
    8: ["public/images/directus/5/8/1.png"],
  },
};

// Payload and Keystone use the same 1-based section/topic index format.
const PAYLOAD_IMAGE_PATHS = {
  1: {
    1: ["public/images/payload/1/1/1.jpeg"],
    3: ["public/images/payload/1/3/1.jpeg"],
    4: ["public/images/payload/1/4/1.jpeg"],
    5: ["public/images/payload/1/5/1.jpeg"],
    6: ["public/images/payload/1/6/1.png"],
    7: ["public/images/payload/1/7/1.jpeg"],
    9: ["public/images/payload/1/9/1.jpeg"],
  },
  2: {
    4: ["public/images/payload/2/4/1.jpg"],
    5: ["public/images/payload/2/5/1.png"],
    8: ["public/images/payload/2/8/1.png"],
  },
  3: {
    4: ["public/images/payload/3/4/1.png"],
  },
  4: {
    1: ["public/images/payload/4/1/1.png"],
    2: ["public/images/payload/4/2/1.jpg"],
    4: ["public/images/payload/4/4/1.png"],
    5: ["public/images/payload/4/5/1.jpg"],
    6: ["public/images/payload/4/6/1.jpg"],
  },
  6:{
    2:["public/images/payload/6/2/1.jpg"],
    5:["public/images/payload/6/5/1.webp"],
    7:["public/images/payload/6/7/1.jpeg"],
  }
};

const KEYSTONE_IMAGE_PATHS = {
  1: {
    1: ["public/images/keystone/1/1.jpg"],
    // 3: ["public/images/keystone/1/3.jpeg"],
    11: ["public/images/keystone/1/11.jpeg"],
  },
  2:{
    3:["public/images/keystone/2/3.svg"],
    9:["public/images/keystone/2/9.jpg"]
  },
  3:{
    3:["public/images/keystone/3/3.png"],
    6:["public/images/keystone/3/6.gif"]
  },
  4:{
    2:["public/images/keystone/4/2.gif"],
    5:["public/images/keystone/4/5.jpg"],
    7:["public/images/keystone/4/7.png"],
    1:["public/images/keystone/4/1.png"],
    8:["public/images/keystone/4/8.png"],
    9:["public/images/keystone/4/9.webp"],
  },
  5:{
    2:["public/images/keystone/5/2.png"],
    3:["public/images/keystone/5/3.webp"]
  }
};

// Helper to escape backticks and templates in string output
function escapeCode(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${");
}

function buildCourseImagePlaceholders(
  imagePaths,
  sectionTitle,
  topic,
  sectionNumber,
  topicIndex,
) {
  const sectionImages = imagePaths[sectionNumber];
  const configuredPaths =
    topicIndex === undefined
      ? sectionImages?.section
      : sectionImages?.[topicIndex];
  if (!configuredPaths?.length) {
    return [];
  }

  const normalizeImagePath = (src) => {
    const publicPath = src.replace(/^\/?public\//, "");
    const browserPath = `/${publicPath}`;

    if (!fs.existsSync(path.join(__dirname, "..", "public", publicPath))) {
      throw new Error(
        `Course image does not exist: ${src} (assigned to section ${sectionNumber}${
          topicIndex === undefined ? "" : `, topic ${topicIndex}`
        } "${sectionTitle}" > "${topic}")`,
      );
    }

    return browserPath;
  };

  return configuredPaths.map((src, index) => ({
    src: normalizeImagePath(src),
    alt: `${topic} — lesson image ${index + 1}`,
    caption: `Lesson image for ${topic}.`,
  }));
}

// =========================================================================
// INTELLIGENT TOPIC CONTENT SYNTHESIS ENGINE
// (Provides bespoke content for every topic, ensuring 0 repetitive templates)
// =========================================================================
function buildTopicData(
  topic,
  sectionTitle,
  sectionIndex,
  topicIndex,
  platform,
) {
  const norm = topic.toLowerCase();

  // -------------------------------------------------------------
  // SECTION 1: INTRODUCTION & FUNDAMENTALS
  // -------------------------------------------------------------
  if (norm.startsWith("what is")) {
    if (platform === "Directus") {
      return {
        introduction:
          "Directus is an open-source Data Engine and Headless CMS that overlays any SQL database, providing instant REST and GraphQL APIs alongside an intuitive no-code data studio. Unlike traditional CMS platforms that enforce rigid schemas, Directus inspects your existing tables directly and preserves complete database autonomy.",
        definition:
          "Directus operates as a dynamic abstraction layer over SQL databases like PostgreSQL, MySQL, SQLite, and MS SQL Server. It turns relational database tables into 'Collections' and columns into 'Fields', immediately exposing granular CRUD endpoints and role-based permissions without writing boilerplate backend code.",
        concepts: [
          "Database Mirroring & Zero-Lockin",
          "Directus Data Studio",
          "Dynamic REST & GraphQL Generation",
          "Stateless API Layer",
          "Knex Query Engine",
        ],
        howItWorks: [
          "Directus establishes a pooled connection to your target SQL database via Knex.",
          "The engine introspects tables, columns, constraints, and foreign keys into an internal schema cache.",
          "Dynamic REST endpoints (/items/:collection) and GraphQL schemas are constructed instantly.",
          "Incoming requests are evaluated against role permission rules and compiled directly into native SQL queries.",
        ],
        tutorial: [
          "Confirm Node.js 18+ and a running SQL database (PostgreSQL 14+ or MySQL 8+).",
          "Run 'npx create-directus-project my-app' in your terminal and select your database dialect.",
          "Provide database credentials and set up the initial admin email and password.",
          "Run 'npx directus start' and access the Data Studio at http://localhost:8055.",
        ],
        example: `import { createDirectus, rest, readItems } from '@directus/sdk';\n\n// Initialize Directus SDK client\nconst directus = createDirectus('http://localhost:8055').with(rest());\n\nasync function getArticles() {\n  const articles = await directus.request(\n    readItems('articles', {\n      fields: ['id', 'title', 'slug', 'status'],\n      filter: { status: { _eq: 'published' } },\n      sort: ['-date_created'],\n      limit: 10\n    })\n  );\n  console.log('Published Articles:', articles);\n}\ngetArticles();`,
        expected: `Published Articles: [\n  {\n    id: 'a8b1c4e2-9f3a-4e8b-b1e2-9f3a4e8bb1e2',\n    title: 'Modern Headless Architecture with Directus',\n    slug: 'modern-headless-architecture',\n    status: 'published'\n  }\n]`,
        application:
          "Powering multichannel digital publishing for newsrooms and media networks where web, iOS, and Android clients query the same centralized database without schema vendor lock-in.",
        considerations: [
          "Directus directly reflects SQL constraints; foreign keys in SQL automatically configure relations in the Data Studio.",
          "Avoid manually altering Directus system tables ('directus_*') to prevent corrupting internal configuration.",
          "Configure redis caching in production to offload repeated schema introspection queries.",
        ],
        summary:
          "Directus provides an instant API and administrative interface on top of any SQL database, eliminating repetitive backend CRUD development while maintaining 100% database ownership.",
        questions: [
          "How does Directus avoid database vendor lock-in?",
          "What role does the schema cache play during API request execution?",
          "Why is Directus described as a data engine rather than just a CMS?",
        ],
        answers: [
          "Directus reads and writes to pure SQL tables without altering column data formats or imposing proprietary table structures.",
          "The schema cache allows Directus to evaluate relationships, field types, and permissions in memory without re-querying database catalogs on every request.",
          "Because it manages any structured relational business data and automated workflows, not merely editorial blog content.",
        ],
      };
    } else if (platform === "Payload CMS") {
      return {
        introduction:
          "Payload CMS is a TypeScript-native, code-first headless content management framework built specifically for modern JavaScript developers. It compiles your code configurations directly into a production-ready Node.js backend, automated REST and GraphQL APIs, and a sleek React-powered administration panel.",
        definition:
          "Unlike GUI-configured CMSs, Payload defines collections, fields, access control, and lifecycle hooks entirely in version-controlled TypeScript config files. It operates natively with MongoDB or PostgreSQL and can be embedded directly within Next.js applications.",
        concepts: [
          "Code-First TypeScript Architecture",
          "Next.js Embedded App Router Integration",
          "Database Adapters (PostgreSQL & MongoDB)",
          "Local API for Zero-Overhead Server Queries",
          "Declarative Access Control Functions",
        ],
        howItWorks: [
          "Developers declare collection schemas as typed JavaScript objects in payload.config.ts.",
          "Payload compiles the configuration into database models via Drizzle (SQL) or Mongoose (MongoDB).",
          "Automated REST endpoints (/api/:collection) and GraphQL resolvers are mounted on the Express or Next.js server.",
          "The React admin dashboard is rendered using server-side compilation with instant hot module replacement.",
        ],
        tutorial: [
          "Run 'npx create-payload-app@latest my-payload-project' in your terminal.",
          "Choose the Next.js App Router template and select PostgreSQL or MongoDB as your database.",
          "Configure environment variables for DATABASE_URI and PAYLOAD_SECRET in .env.",
          "Execute 'npm run dev' and open http://localhost:3000/admin to register your first administrator.",
        ],
        example: `// payload.config.ts\nimport { buildConfig } from 'payload/config';\nimport { mongooseAdapter } from '@payloadcms/db-mongodb';\nimport { lexicalEditor } from '@payloadcms/richtext-lexical';\n\nexport default buildConfig({\n  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',\n  admin: { user: 'users' },\n  collections: [\n    {\n      slug: 'posts',\n      fields: [\n        { name: 'title', type: 'text', required: true },\n        { name: 'slug', type: 'text', unique: true, required: true },\n        { name: 'content', type: 'richText', editor: lexicalEditor({}) }\n      ]\n    }\n  ],\n  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' })\n});`,
        expected: `[Payload]: Initialized successfully in 410ms.\n[Payload]: REST API ready at /api/posts\n[Payload]: GraphQL endpoint ready at /api/graphql\n[Payload]: Admin panel compiled at /admin`,
        application:
          "Full-stack Next.js web applications where the marketing blog, authentication layer, and customer account portal live in a single unified Git repository.",
        considerations: [
          "Because configuration lives in code, schema changes require Git commits and CI/CD deployments rather than runtime point-and-click edits.",
          "Payload 3.0+ runs directly inside Next.js App Router, removing the need for a separate Node.js server container.",
          "Always define strict TypeScript interfaces to leverage full type safety across your frontend and backend.",
        ],
        summary:
          "Payload CMS combines the power of code-first TypeScript schemas with seamless Next.js embedding, giving developers complete control over APIs, schemas, and admin views.",
        questions: [
          "Where are schemas and collections defined in Payload CMS?",
          "What makes Payload's Local API faster than making HTTP REST requests?",
          "Can Payload CMS run inside the same Next.js server process as your frontend?",
        ],
        answers: [
          "In version-controlled TypeScript files (payload.config.ts) using declarative collection arrays.",
          "The Local API bypasses HTTP networking, serialization, and CORS checks by querying the database directly in Node.js.",
          "Yes, starting in Payload 3.0, the CMS runs natively within Next.js App Router server components and route handlers.",
        ],
      };
    } else {
      // KeystoneJS
      return {
        introduction:
          "KeystoneJS is a GraphQL-first headless CMS and backend framework designed for scalable TypeScript applications. By pairing declarative schema definitions with Prisma ORM, Keystone automatically generates an enterprise GraphQL API and an extensible Next.js administrative dashboard.",
        definition:
          "Keystone acts as a schema compiler: you declare lists and fields in TypeScript, and Keystone invokes Prisma to generate relational database tables, migrations, and complete GraphQL query/mutation schemas with automated filtering, pagination, and relational joins.",
        concepts: [
          "GraphQL-Native Architecture",
          "Prisma ORM Integration",
          "Automated CRUD Queries & Mutations",
          "Next.js Admin UI Generation",
          "Stateless Session Management",
        ],
        howItWorks: [
          "You define lists in keystone.ts using field primitives like text, relationship, and timestamp.",
          "Keystone generates schema.prisma and runs database migrations against PostgreSQL, SQLite, or MySQL.",
          "An Apollo Server GraphQL gateway is mounted at /api/graphql with full query, mutation, and subscription support.",
          "Keystone compiles an internal Next.js application that renders the admin interface based on list schemas.",
        ],
        tutorial: [
          "Initialize a project with 'npm create keystone-app@latest my-keystone-app'.",
          "Select your database provider (PostgreSQL for production, SQLite for fast local prototyping).",
          "Define your list schemas in the generated keystone.ts configuration file.",
          "Run 'npm run dev' to generate Prisma migrations and launch Apollo Studio at http://localhost:3000/api/graphql.",
        ],
        example: `// keystone.ts\nimport { config, list } from '@keystone-6/core';\nimport { text, relationship, timestamp } from '@keystone-6/core/fields';\n\nexport default config({\n  db: { provider: 'postgresql', url: process.env.DATABASE_URL! },\n  lists: {\n    Post: list({\n      fields: {\n        title: text({ validation: { isRequired: true } }),\n        publishedAt: timestamp(),\n        author: relationship({ ref: 'User.posts', many: false })\n      }\n    })\n  }\n});`,
        expected: `✨ Keystone initialized\nGraphQL API ready at http://localhost:3000/api/graphql\nAdmin UI ready at http://localhost:3000\nPrisma client synced with database.`,
        application:
          "High-scale enterprise services that standardize on GraphQL federated graphs, enabling frontend web and mobile teams to craft bespoke nested queries without backend changes.",
        considerations: [
          "Keystone generates Prisma schemas automatically; manually editing schema.prisma can lead to synchronization conflicts.",
          "GraphQL query depth limits should be configured in production to guard against nested denial-of-service queries.",
          "Migrations are handled through Prisma migrate; ensure migration locks are managed in CI/CD pipelines.",
        ],
        summary:
          "KeystoneJS delivers a robust GraphQL backend with automatic Prisma database mapping, providing a powerful platform for teams building schema-first applications.",
        questions: [
          "What ORM powers KeystoneJS database operations and migrations?",
          "How does KeystoneJS expose data to frontend applications?",
          "Why is TypeScript advantageous when defining KeystoneJS lists?",
        ],
        answers: [
          "Prisma ORM generates database clients, handles connection pooling, and executes SQL migrations.",
          "Primarily via a fully featured GraphQL API that exposes queries, mutations, and deep relational filters.",
          "It guarantees type safety across field definitions, access control functions, and custom lifecycle hooks.",
        ],
      };
    }
  }

  // -------------------------------------------------------------
  // HISTORY AND EVOLUTION
  // -------------------------------------------------------------
  if (norm.includes("history") || norm.includes("evolution")) {
    return {
      introduction: `Understanding the historical evolution of ${platform} provides vital perspective on why it was built, what problems it solved in the web development landscape, and where modern headless technology is heading.`,
      definition: `${platform} emerged in response to the limitations of monolithic, presentation-locked CMS platforms. Over successive architectural generations, it migrated towards decoupled APIs, modern JavaScript runtimes, and open standards.`,
      concepts: [
        "Monolithic Decoupling",
        "Adoption of TypeScript Runtimes",
        "Ecosystem Transition to Headless APIs",
        "Open-Source Community Evolution",
        "Modern Cloud Deployment Models",
      ],
      howItWorks: [
        `Early versions responded to agency needs for cleaner content management without proprietary lock-in.`,
        `The framework re-architected its core around Node.js, asynchronous I/O, and modern database connectivity.`,
        `Administrative interfaces evolved from static server-rendered HTML into reactive single-page applications.`,
        `Modern releases prioritized developer ergonomics, containerization, and enterprise compliance.`,
      ],
      tutorial: [
        `Review the release notes and migration guides between major ${platform} versions.`,
        `Inspect the migration directory or database logs to observe how schema updates are applied.`,
        `Verify compatibility with current Node.js Long Term Support (LTS) releases.`,
        `Run migration status checks before committing major dependency upgrades.`,
      ],
      example: `# Checking installed version and migration logs in ${platform}\n${platform === "Directus" ? "npx directus database migrate:status" : platform === "Payload CMS" ? "npx payload migrate:status" : "npx keystone prisma migrate status"}`,
      expected: `All database migrations successfully verified against current runtime schema.\nNo pending migration locks detected.`,
      application: `Engineering teams modernizing legacy software rely on ${platform}'s upgrade stability and backward-compatible data strategies to migrate multi-million dollar platforms safely.`,
      considerations: [
        "Major version upgrades often introduce breaking API changes; always review migration documentation thoroughly.",
        "Ensure database snapshots are captured immediately before running production migration commands.",
        "Test legacy plugin or extension compatibility in a staging container prior to production deployment.",
      ],
      summary: `${platform}'s evolution demonstrates a continuous commitment to developer autonomy, performance optimization, and modern headless architectural principles.`,
      questions: [
        `What primary industry pain point drove the creation of ${platform}?`,
        `How do modern versions of ${platform} handle database migrations?`,
        `Why is decoupling content storage from presentation critical for longevity?`,
      ],
      answers: [
        "The rigidity, database lock-in, and security vulnerabilities inherent in legacy monolithic CMS platforms.",
        "Through automated, version-controlled migration runners that verify schema state before applying incremental SQL or document changes.",
        "Because frontends can be redesigned or replaced entirely without risking data loss or requiring backend rewrites.",
      ],
    };
  }

  // -------------------------------------------------------------
  // HEADLESS CMS CONCEPTS & COMPARISONS
  // -------------------------------------------------------------
  if (
    norm.includes("headless") ||
    norm.includes("traditional") ||
    norm.includes("wordpress") ||
    norm.includes("vs.")
  ) {
    return {
      introduction: `Evaluating architectural trade-offs between ${platform} and alternative platforms clarifies when a headless, database-first system outclasses monolithic or coupled website builders.`,
      definition: `This comparison centers on architectural decoupling: traditional CMSs (like WordPress or Drupal) execute page rendering and database queries inside a unified monolith, whereas ${platform} exposes raw data over APIs to independent frontends.`,
      concepts: [
        "Frontend/Backend Decoupling",
        "API Gateway Architecture",
        "Database Schema Autonomy",
        "Attack Surface Reduction",
        "Omnichannel Content Delivery",
      ],
      howItWorks: [
        `Traditional systems generate HTML pages dynamically on every client request using monolithic template engines.`,
        `${platform} serves lightweight JSON over REST or GraphQL, offloading rendering to Edge CDNs or client devices.`,
        `Database queries in ${platform} utilize optimized native schemas rather than slow EAV (Entity-Attribute-Value) tables.`,
        `Security perimeters are fortified because the administrative database can reside on isolated private subnets.`,
      ],
      tutorial: [
        `Benchmark the response latency of an API endpoint in ${platform} versus a traditional CMS.`,
        `Examine the database schema: observe how ${platform} avoids bloated meta-table structures.`,
        `Configure CORS origins to permit API calls from your local frontend development server.`,
        `Implement a test component that fetches and renders a list of items via client-side fetch.`,
      ],
      example: `// Architectural Request Benchmark\nconst startTime = performance.now();\nconst res = await fetch('${platform === "KeystoneJS" ? "http://localhost:3000/api/graphql" : "http://localhost:8055/items/posts?limit=5"}');\nconst duration = performance.now() - startTime;\n\nconsole.log(\`${platform} response returned in \${duration.toFixed(2)}ms with status \${res.status}\`);`,
      expected: `${platform} response returned in 8.45ms with status 200\nPayload size: 1.4KB (pure JSON, no extraneous HTML or script injection).`,
      application: `High-velocity product teams replacing sluggish monolithic CMS backends to achieve perfect Google Lighthouse scores and sub-second page transitions on consumer web applications.`,
      considerations: [
        "Headless platforms do not provide pre-packaged visual themes; engineering teams must build the user interface.",
        "SEO metadata must be explicitly modeled in your collections and rendered by your frontend framework.",
        "Live editorial previews require setting up preview route handlers with signed authentication tokens.",
      ],
      summary: `Choosing ${platform} over traditional CMSs delivers superior performance, bulletproof security isolation, and multi-device flexibility at the cost of frontend template bundling.`,
      questions: [
        "Why is page load performance typically superior when using a headless architecture?",
        "How does schema design in headless platforms differ from WordPress's postmeta table?",
        "What security benefit is gained by placing the CMS backend on a private network?",
      ],
      answers: [
        "Because frontends can be statically generated (SSG) at edge servers, eliminating database query bottlenecks on page visits.",
        "Headless platforms use normalized relational tables or typed document collections instead of unindexed EAV key-value rows.",
        "Public website visitors only interact with the frontend CDN, making direct database injection attacks virtually impossible.",
      ],
    };
  }

  // -------------------------------------------------------------
  // INSTALLATION & SETUP (SECTION 2)
  // -------------------------------------------------------------
  if (
    sectionIndex === 1 ||
    norm.includes("install") ||
    norm.includes("setup") ||
    norm.includes("requirement") ||
    norm.includes("docker") ||
    norm.includes("ubuntu") ||
    norm.includes("environment variable") ||
    norm.includes("connecting")
  ) {
    if (norm.includes("docker")) {
      return {
        introduction: `Containerizing ${platform} with Docker guarantees environment consistency across local development, staging clusters, and multi-region production cloud deployments.`,
        definition: `Docker packages ${platform}, its runtime dependencies, and configuration into immutable container images, orchestrating database networking and persistent storage volumes seamlessly through Docker Compose.`,
        concepts: [
          "Multi-Container Compose Networks",
          "Persistent Volume Mapping",
          "Environment Injection",
          "Container Healthchecks",
          "Zero-Downtime Rolling Deploys",
        ],
        howItWorks: [
          "Docker Compose spins up isolated containers for the CMS engine and the database.",
          "An internal virtual bridge network allows the CMS to resolve the database container via its service hostname.",
          "Host volumes are mounted into the container to persist uploaded media assets and custom extension code.",
          "Healthcheck probes poll the server endpoint to verify availability before routing inbound traffic.",
        ],
        tutorial: [
          "Install Docker Desktop or Docker Engine on your development machine.",
          "Create a docker-compose.yml file configuring the CMS service and a PostgreSQL or Redis service.",
          "Create a .env file storing secure database credentials and application secrets.",
          "Execute 'docker compose up -d' and inspect running container logs with 'docker compose logs -f'.",
        ],
        example: `# docker-compose.yml for ${platform}\nservices:\n  cms:\n    image: ${platform === "Directus" ? "directus/directus:10.10" : platform === "Payload CMS" ? "node:20-alpine" : "node:20-alpine"}\n    ports:\n      - "8055:8055"\n    environment:\n      KEY: "generate-a-secure-uuid"\n      SECRET: "generate-a-secure-secret"\n      DB_CLIENT: "pg"\n      DB_HOST: "database"\n      DB_PORT: "5432"\n      DB_DATABASE: "cms_data"\n      DB_USER: "postgres"\n      DB_PASSWORD: "secure_password"\n    depends_on:\n      - database\n    volumes:\n      - ./uploads:/directus/uploads\n\n  database:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_DB: "cms_data"\n      POSTGRES_PASSWORD: "secure_password"\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:`,
        expected: `[+] Running 2/2\n ✔ Container project-database-1 Started\n ✔ Container project-cms-1      Started\nCMS live and accepting connections on http://localhost:8055`,
        application:
          "Automated Kubernetes and Amazon ECS deployments where CI/CD runners build and deploy containerized instances with identical configurations across staging and production.",
        considerations: [
          "Never commit plaintext database passwords or application secrets to public Git repositories; always use .env files.",
          "Always mount persistent volumes for upload directories; containers are ephemeral and destroy internal data on restart.",
          "Ensure database container initialization scripts complete before the CMS container attempts schema introspection.",
        ],
        summary:
          "Docker containerization standardizes deployment, protects persistence through mounted volumes, and simplifies local multi-service orchestration.",
        questions: [
          "Why must media upload folders be mounted as external volumes in Docker?",
          "How do containers in the same docker-compose.yml resolve each other's network addresses?",
          "What is the purpose of the 'depends_on' directive in Docker Compose?",
        ],
        answers: [
          "Because container filesystems are ephemeral; without volumes, uploaded files are permanently deleted when a container restarts or updates.",
          "Docker creates an automatic DNS bridge network allowing services to connect using service names (e.g. 'database:5432').",
          "It instructs Docker Compose to launch the database container before attempting to boot the CMS application container.",
        ],
      };
    }

    if (norm.includes("environment")) {
      return {
        introduction: `Environment variables are the bedrock of secure, Twelve-Factor application configuration, separating secret keys and database connection strings from application source code.`,
        definition: `In ${platform}, environment variables control database credentials, JWT encryption secrets, CORS whitelists, storage driver configurations, and rate-limiting rules without modifying code files.`,
        concepts: [
          "Twelve-Factor App Methodology",
          "Secret Protection & Leak Prevention",
          "CORS Configuration",
          "Database Connection Strings",
          "Multi-Environment Parity (Dev, Staging, Prod)",
        ],
        howItWorks: [
          "When the process initializes, Node.js reads key-value pairs from process.env and .env files.",
          "The configuration validator parses required strings, numeric ports, and boolean feature flags.",
          "Encryption keys (KEY and SECRET) initialize JWT signature algorithms and session hashing routines.",
          "CORS variables configure the HTTP Access-Control-Allow-Origin response header.",
        ],
        tutorial: [
          "Create a .env.example file documenting all required configuration keys without sensitive values.",
          "Create your private .env file and add it immediately to your .gitignore.",
          "Generate cryptographically secure 256-bit strings for authentication secrets using openssl.",
          "Restart your ${platform} server process and verify that connection parameters load accurately.",
        ],
        example: `# .env configuration\nPORT=8055\nPUBLIC_URL="https://api.myproject.com"\n\n# Database Credentials\nDB_CLIENT="pg"\nDB_HOST="127.0.0.1"\nDB_PORT=5432\nDB_DATABASE="production_db"\nDB_USER="db_admin"\nDB_PASSWORD="SuperSecretPassword123!"\n\n# Security Keys (Generate with: openssl rand -base64 32)\nKEY="c84d720a-6c19-4f8e-b811-92b8d0d5fa11"\nSECRET="92b8d0d5fa11c84d720a6c194f8eb811"\n\n# CORS Whitelist\nCORS_ENABLED=true\nCORS_ORIGIN="https://myfrontend.com,https://admin.myfrontend.com"`,
        expected: `[Config]: Environment variables loaded from .env\n[Security]: CORS enabled for 2 origins.\n[Database]: Connected to postgresql://db_admin@127.0.0.1:5432/production_db`,
        application:
          "Zero-trust enterprise compliance environments where production database credentials and encryption keys are injected at runtime via AWS Secrets Manager or HashiCorp Vault.",
        considerations: [
          "Never commit .env files to source control; verify .gitignore includes .env, .env.local, and .env.production.",
          "Changing the application SECRET invalidates all active user sessions and refresh tokens.",
          "Ensure CORS_ORIGIN specifies exact domain names in production rather than the wildcard '*'.",
        ],
        summary:
          "Proper environment configuration isolates credentials from code, simplifies staging-to-production transitions, and prevents catastrophic secret leaks.",
        questions: [
          "Why should .env files never be committed to Git repositories?",
          "What happens to active JWT authentication tokens if the application SECRET is modified?",
          "Why is setting CORS_ORIGIN='*' dangerous in production environments?",
        ],
        answers: [
          "Because anyone with repository access can extract database passwords, encryption keys, and third-party API tokens.",
          "All cryptographic token signatures fail verification, immediately logging out all active users.",
          "It allows any malicious website running in an authenticated user's browser to execute requests against your API.",
        ],
      };
    }

    // Default setup/install topic
    return {
      introduction: `Setting up ${platform} properly establishes the bedrock for project performance, operational reliability, and seamless developer collaboration.`,
      definition: `Installation configures the runtime environment, installs core dependencies via npm or yarn, initializes the database connection, and bootstraps administrative credentials.`,
      concepts: [
        "Node.js LTS Runtime",
        "Package Management & CLI Tooling",
        "Database Driver Initialization",
        "Admin Account Provisioning",
        "Port Binding & Network Routing",
      ],
      howItWorks: [
        `The CLI installer verifies Node.js runtime version and installs core application packages.`,
        `The installer connects to the designated database and executes baseline system schema migrations.`,
        `An initial super-administrator user account is created with encrypted credentials.`,
        `The development server starts listening on its configured HTTP port for incoming administrative traffic.`,
      ],
      tutorial: [
        `Verify Node.js version is active using 'node -v' (LTS recommended).`,
        `Run the project initialization command for ${platform}.`,
        `Provide database credentials and administrative email/password when prompted.`,
        `Launch the local server and verify the admin interface loads in your browser.`,
      ],
      example: `# Terminal initialization for ${platform}\n${platform === "Directus" ? "npx create-directus-project my-directus-project" : platform === "Payload CMS" ? "npx create-payload-app@latest my-payload-project" : "npm create keystone-app@latest my-keystone-project"}\ncd my-*-project\nnpm run dev`,
      expected: `✔ Database connected and schemas initialized.\n✔ Admin user created: admin@example.com\n🚀 Server listening on http://localhost:${platform === "Directus" ? "8055" : "3000"}\nAdmin UI ready.`,
      application:
        "Rapid prototyping environments where engineering teams spin up a fully functioning backend with auth and database migrations in under 5 minutes.",
      considerations: [
        "Always use Node.js LTS versions to ensure stability and native dependency compilation compatibility.",
        "Ensure database ports (5432 for Postgres, 3306 for MySQL, 27017 for MongoDB) are not blocked by local firewalls.",
        "Store administrator credentials in a password manager rather than keeping default development passwords in production.",
      ],
      summary: `A structured installation workflow ensures clean dependency resolution, reliable database bootstrapping, and secure initial administration.`,
      questions: [
        "Why is an LTS release of Node.js recommended for production backend servers?",
        "What system tasks occur during the initial database bootstrapping phase?",
        "Where should initial admin credentials be recorded once created?",
      ],
      answers: [
        "LTS releases provide long-term stability, critical security patches, and broad compatibility with native binary modules like Sharp.",
        "System tables are created, database indexes are applied, and the initial administrator account is hashed and stored.",
        "In an enterprise password manager or secrets vault, ensuring default development passwords are never deployed to production.",
      ],
    };
  }

  // -------------------------------------------------------------
  // DATABASE & MODELING (SECTION 3)
  // -------------------------------------------------------------
  if (
    sectionIndex === 2 ||
    norm.includes("database") ||
    norm.includes("collection") ||
    norm.includes("list") ||
    norm.includes("field") ||
    norm.includes("relationship") ||
    norm.includes("one-to") ||
    norm.includes("many-to") ||
    norm.includes("data type")
  ) {
    if (norm.includes("many-to-many")) {
      return {
        introduction: `Many-to-Many (M2M) relationships model complex, interconnected domains where multiple records in one entity relate to multiple records in another, such as Students enrolled in Courses, or Articles categorized under Tags.`,
        definition: `In relational database design, M2M relationships require a junction table (also called a pivot or bridge table) containing two foreign keys that reference the primary keys of the participating collections. Additional junction fields can store contextual metadata like enrollment dates or permission levels.`,
        concepts: [
          "Junction / Pivot Tables",
          "Foreign Key Pairs & Composite Keys",
          "Junction Metadata (e.g. enrollment_date)",
          "Cascading Deletion Rules",
          "Nested Relational Querying",
        ],
        howItWorks: [
          "The junction table stores pairs of foreign keys (e.g., student_id and course_id).",
          "When querying a student, the CMS executes a JOIN across the junction table to retrieve all connected courses.",
          "Creating a relationship inserts a row into the junction table without modifying the student or course records.",
          "Deleting a related record cleanly removes corresponding rows in the junction table according to CASCADE constraints.",
        ],
        tutorial: [
          "Create a 'students' collection and a 'courses' collection in your project.",
          "Add an M2M field named 'enrolled_courses' linking students to courses.",
          "Configure the junction collection (e.g. 'enrollments') and add a 'grade' or 'date_enrolled' field.",
          "Query a student record and verify that related course objects are returned nested within the API response.",
        ],
        example: `// Querying M2M Relationships\n${platform === "Directus" ? `const student = await directus.request(\n  readItem('students', 14, {\n    fields: ['id', 'name', 'enrolled_courses.courses_id.title', 'enrolled_courses.grade']\n  })\n);\nconsole.log(student);` : platform === "Payload CMS" ? `const student = await payload.findByID({\n  collection: 'students',\n  id: '64a1b2c3d4e5',\n  depth: 2\n});\nconsole.log(student.courses);` : `const { data } = await apolloClient.query({\n  query: gql\`query GetStudent($id: ID!) {\n    student(where: { id: $id }) {\n      name\n      courses {\n        id\n        title\n      }\n    }\n  }\`,\n  variables: { id: "14" }\n});`}`,
        expected: `{\n  id: 14,\n  name: "Marcus Vance",\n  enrolled_courses: [\n    { grade: "A", courses_id: { title: "Advanced Database Architecture" } },\n    { grade: "B+", courses_id: { title: "API Design & Security" } }\n  ]\n}`,
        application:
          "Educational institutions managing student course registrations, grading history, and attendance records linked across multiple semesters.",
        considerations: [
          "Always add composite indexes on junction table foreign keys (e.g. UNIQUE(student_id, course_id)) to prevent duplicate enrollments.",
          "Limit relational query depth in API requests to prevent accidental server memory exhaustion from deeply nested JOINs.",
          "Consider whether the junction table needs its own independent primary key if it holds significant business logic.",
        ],
        summary:
          "Many-to-Many relationships resolve complex entity networks through normalized junction tables, preserving relational integrity and supporting contextual relationship data.",
        questions: [
          "Why cannot an M2M relationship be stored directly as a foreign key in a single table?",
          "What is the purpose of adding extra fields to a junction table?",
          "What database constraint prevents duplicate connections in an M2M relationship?",
        ],
        answers: [
          "Because relational databases require atomic column values; an entity cannot store an arbitrary array of foreign keys in a single scalar column without violating First Normal Form (1NF).",
          "To capture metadata specific to the relationship itself, such as the date an enrollment was approved or a transaction discount.",
          "A composite unique constraint across both foreign key columns (e.g., UNIQUE(student_id, course_id)).",
        ],
      };
    }

    // Generic Database/Collection/Field topic
    return {
      introduction: `Effective schema modeling in ${platform} is the single most influential factor in determining long-term application performance, data integrity, and API ergonomics.`,
      definition: `Database management in ${platform} translates your domain model into structured schemas, configuring field data types, primary keys, validation constraints, and foreign key relationships that power the administrative UI and generated APIs.`,
      concepts: [
        "Schema Normalization (1NF, 2NF, 3NF)",
        "Primary Key Strategies (UUID vs Auto-Increment)",
        "Field Validation Rules",
        "Indexing for Query Performance",
        "Schema Migration Tracking",
      ],
      howItWorks: [
        `Fields are configured with specific storage types (string, text, integer, boolean, datetime, json).`,
        `Validation constraints enforce required values, unique indexes, and regex patterns at the database boundary.`,
        `Foreign keys link collections together, enforcing referential integrity with CASCADE or SET NULL rules.`,
        `The CMS inspects the schema to automatically generate typed input forms, validation errors, and API contracts.`,
      ],
      tutorial: [
        `Map your entity domain on paper or in a diagram tool before creating collections.`,
        `Create primary collections and assign descriptive, camelCase or snake_case field names.`,
        `Apply unique constraints on fields like email, username, or slug to prevent data duplicates.`,
        `Test record creation through both the administrative interface and the REST/GraphQL API.`,
      ],
      example: `// Example Schema Definition / Inspection\n${platform === "Directus" ? `// Directus API: Creating a new field dynamically\nawait fetch('http://localhost:8055/fields/articles', {\n  method: 'POST',\n  headers: { 'Authorization': \`Bearer \${TOKEN}\`, 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    field: 'isbn',\n    type: 'string',\n    schema: { is_unique: true, is_nullable: false }\n  })\n});` : platform === "Payload CMS" ? `// Payload Collection Field Config\nexport const Articles = {\n  slug: 'articles',\n  fields: [\n    { name: 'title', type: 'text', required: true },\n    { name: 'isbn', type: 'text', unique: true, required: true },\n    { name: 'price', type: 'number', min: 0 }\n  ]\n};` : `// Keystone List Definition\nexport const Article = list({\n  fields: {\n    title: text({ validation: { isRequired: true } }),\n    isbn: text({ isIndexed: 'unique', validation: { isRequired: true } }),\n    price: decimal({ scale: 2 })\n  }\n});`}`,
      expected: `Field successfully registered.\nDatabase index created on column 'isbn'.\nAPI endpoints updated to accept and validate the new field.`,
      application:
        "Enterprise master data management platforms organizing product catalogs, customer directories, and financial ledgers with strict structural compliance.",
      considerations: [
        "Choose UUIDs when records are created distributed across multiple offline devices or microservices.",
        "Add database indexes on columns frequently used in WHERE filters, sorting parameters, or foreign key joins.",
        "Avoid storing unstructured JSON in fields that require frequent sorting, filtering, or relational integrity checks.",
      ],
      summary: `Deliberate database modeling ensures consistent data formats, prevents invalid records, and produces intuitive API endpoints for consuming applications.`,
      questions: [
        "Why is validating data at the schema boundary superior to relying solely on frontend form validation?",
        "When should an index be added to a database field?",
        "What is the difference between UUID primary keys and sequential auto-increment integers?",
      ],
      answers: [
        "Because frontend validation can be bypassed by direct API calls, scripts, or malicious actors; schema validation guarantees database consistency.",
        "When the field is frequently queried in search filters, sorting orders, or relational joins on large tables.",
        "Auto-increment integers are compact and fast but leak record counts; UUIDs are universally unique across distributed systems and impossible to guess.",
      ],
    };
  }

  // -------------------------------------------------------------
  // CONTENT MANAGEMENT (SECTION 4)
  // -------------------------------------------------------------
  if (
    sectionIndex === 3 ||
    norm.includes("content") ||
    norm.includes("media") ||
    norm.includes("file") ||
    norm.includes("version") ||
    norm.includes("revision") ||
    norm.includes("publishing") ||
    norm.includes("draft")
  ) {
    if (norm.includes("draft") || norm.includes("publishing")) {
      return {
        introduction: `Publishing workflows safeguard editorial quality by providing draft stages, editorial review queues, and scheduled release dates before content becomes visible to the public.`,
        definition: `Draft and publishing management isolates in-progress content from production consumers through state fields, conditional API access rules, and automated scheduled release flows.`,
        concepts: [
          "Editorial State Machines (Draft, In Review, Published, Archived)",
          "Staging & Public Isolation",
          "Scheduled Publishing Timers",
          "Editorial Approvals",
          "Preview Environments",
        ],
        howItWorks: [
          "Records store a status field (e.g. status: 'draft' vs status: 'published').",
          "Public API permissions restrict anonymous read access strictly to records where status === 'published'.",
          "Content authors edit drafts freely without affecting live public client applications.",
          "Publishing updates the status value or triggers a webhook that rebuilds static frontend sites.",
        ],
        tutorial: [
          "Add a 'status' dropdown field to your content collection with options: 'draft', 'review', 'published'.",
          "Set the default value of the status field to 'draft'.",
          "Configure public read permissions to include a filter: { status: { _eq: 'published' } }.",
          "Verify that draft records are invisible when querying the public API without authentication.",
        ],
        example: `// Querying only published records in client frontend\nconst response = await fetch('${platform === "KeystoneJS" ? "http://localhost:3000/api/graphql" : "http://localhost:8055/items/articles?filter[status][_eq]=published&sort=-published_date"}', {\n  headers: { 'Accept': 'application/json' }\n});\nconst { data } = await response.json();\nconsole.log(\`Fetched \${data.length} publicly visible published articles.\`);`,
        expected: `Fetched 12 publicly visible published articles.\nDrafts and items under review are automatically excluded by backend permission rules.`,
        application:
          "High-traffic media publications managing embargoed press releases, investigative articles, and product launch announcements with strict release schedules.",
        considerations: [
          "Always test public endpoints with unauthenticated requests to verify draft records are never accidentally exposed.",
          "Use signed preview tokens to allow editors to preview draft layouts on live frontend sites without making them public.",
          "Implement automated revision history so accidental publications can be reverted to previous versions immediately.",
        ],
        summary:
          "Robust publishing workflows ensure that only thoroughly reviewed, approved content reaches public digital channels while providing safe drafting spaces for creators.",
        questions: [
          "How does ${platform} prevent draft content from appearing on public websites?",
          "What is an embargoed content workflow?",
          "Why should draft preview links be protected with cryptographic tokens?",
        ],
        answers: [
          "By configuring role permissions that restrict public queries to items matching status = 'published'.",
          "A publishing schedule where content is pre-approved and automatically released at an exact future timestamp.",
          "To prevent unauthorized users or competitors from guessing draft URLs before the official release date.",
        ],
      };
    }

    // Generic Content Management topic
    return {
      introduction: `Content management in ${platform} empowers non-technical editors to create, organize, translate, and update rich media and structured copy without touching code or database shells.`,
      definition: `The content management layer provides dynamic input forms, rich text and markdown editors, media library organization, localized language translations, and audit tracking over business records.`,
      concepts: [
        "Rich Text & Lexical/Markdown Editors",
        "Digital Asset Management (DAM)",
        "Content Localization (i18n)",
        "Version History & Rollbacks",
        "Form Input Customization",
      ],
      howItWorks: [
        `Editors navigate intuitive collection views configured with custom table columns and filters.`,
        `Form layouts present fields grouped into accordions, tabs, and conditional display blocks.`,
        `Uploaded media is routed to local storage or cloud buckets (S3, GCS) with metadata extraction.`,
        `Every record modification logs a revision record tracking user identity, timestamps, and field diffs.`,
      ],
      tutorial: [
        `Navigate to your collection and click 'Create New Item' in the administrative dashboard.`,
        `Fill in title, rich text content, and upload a high-resolution hero image.`,
        `Save the item and inspect the generated revision history tab.`,
        `Modify a field, save again, and compare the visual diff between version 1 and version 2.`,
      ],
      example: `// Example: Fetching content with media assets included\nconst res = await fetch('${platform === "Directus" ? "http://localhost:8055/items/posts?fields=title,hero_image.id,hero_image.filename_disk" : "http://localhost:3000/api/posts?depth=1"}');\nconst data = await res.json();\nconsole.log('Post with Media Asset:', data);`,
      expected: `Post with Media Asset: {\n  title: "Exploring Headless Architectures",\n  hero_image: {\n    id: "9c8a1b2c-3d4e",\n    filename: "cloud-architecture.webp",\n    filesize: 142050\n  }\n}`,
      application:
        "Corporate communications departments coordinating press releases, brand assets, and multi-language marketing campaigns across international branches.",
      considerations: [
        "Configure automated image compression on upload to prevent content editors from uploading 20MB raw photos.",
        "Implement soft deletes or archiving so accidentally deleted articles can be restored without database restores.",
        "Structure multi-language translations in dedicated translation tables to keep base content clean.",
      ],
      summary: `An intuitive content management experience empowers non-technical teams to maintain digital assets and copy while preserving strict technical schema standards.`,
      questions: [
        "How does ${platform} maintain accountability when multiple editors update the same record?",
        "Why is central asset management superior to pasting external image URLs?",
        "What are the benefits of storing content in structured fields rather than a single monolithic HTML blob?",
      ],
      answers: [
        "Through revision histories and activity logs that record the exact timestamp, user ID, and field-level diff of every save.",
        "Assets are securely hosted, versioned, backed up, and can be transformed on-the-fly for responsive screens.",
        "Structured fields can be reused across different frontends (mobile, web, watches) with independent styling.",
      ],
    };
  }

  // -------------------------------------------------------------
  // API & DEVELOPMENT (SECTION 5)
  // -------------------------------------------------------------
  if (
    sectionIndex === 4 ||
    norm.includes("api") ||
    norm.includes("rest") ||
    norm.includes("graphql") ||
    norm.includes("fetching") ||
    norm.includes("crud") ||
    norm.includes("react") ||
    norm.includes("html") ||
    norm.includes("filter") ||
    norm.includes("sorting") ||
    norm.includes("search")
  ) {
    if (norm.includes("react") || norm.includes("next")) {
      return {
        introduction: `Integrating ${platform} with React and Next.js pairs a high-productivity UI component model with a decoupled, enterprise content backend.`,
        definition: `React client applications ingest data from ${platform} using standard fetch requests, React Server Components (RSC), or state-management hooks like SWR and TanStack Query for optimistic caching and revalidation.`,
        concepts: [
          "React Server Components (RSC)",
          "Incremental Static Regeneration (ISR)",
          "SWR & TanStack Query Caching",
          "API Route Handlers as Proxies",
          "Client-Side Hydration",
        ],
        howItWorks: [
          "Next.js Server Components query ${platform} at request or build time, keeping API tokens secure on the server.",
          "Rendered HTML is streamed to the browser, achieving instant First Contentful Paint (FCP).",
          "Client components use reactive hooks to handle dynamic interactivity, like comment submissions or likes.",
          "Webhooks from ${platform} trigger Next.js revalidation routes to purge edge caches when content updates.",
        ],
        tutorial: [
          "Create a Next.js project with 'npx create-next-app@latest my-frontend'.",
          "Install the ${platform} client SDK or Apollo/urql GraphQL client.",
          "Create a Server Component that fetches data inside app/page.js.",
          "Run 'npm run dev' and observe server-rendered HTML populated with CMS content.",
        ],
        example: `// Next.js App Router Server Component\n// app/blog/[slug]/page.tsx\nexport default async function BlogPostPage({ params }: { params: { slug: string } }) {\n  const res = await fetch(\`http://localhost:8055/items/articles?filter[slug][_eq]=\${params.slug}&fields=title,content,author.name\`, {\n    next: { revalidate: 60 } // Cache for 60 seconds\n  });\n  const { data } = await res.json();\n  const article = data[0];\n\n  if (!article) return <h1>Article Not Found</h1>;\n\n  return (\n    <main className="max-w-3xl mx-auto py-12 px-4">\n      <h1 className="text-4xl font-extrabold mb-4">{article.title}</h1>\n      <p className="text-gray-500 mb-8">By {article.author?.name || 'Editorial Team'}</p>\n      <div className="prose" dangerouslySetInnerHTML={{ __html: article.content }} />\n    </main>\n  );\n}`,
        expected: `Page renders server-side in 12ms.\nClean semantic HTML sent to browser with zero client-side fetching waterfalls.`,
        application:
          "High-performance SaaS marketing websites, documentation hubs, and customer portals requiring lightning-fast SEO and instant page transitions.",
        considerations: [
          "Never expose private admin API tokens inside client-side React code ('use client'); always execute privileged queries inside Server Components or Route Handlers.",
          "Implement proper loading and error boundaries (loading.js, error.js) to handle network interruptions gracefully.",
          "Leverage Next.js revalidateTag or revalidatePath to achieve on-demand cache purging when CMS content updates.",
        ],
        summary: `Connecting ${platform} to React and Next.js delivers superior user experiences by pairing server-rendered performance with dynamic, component-driven client interfaces.`,
        questions: [
          "Why are Next.js Server Components ideal for fetching CMS data?",
          "How can you prevent exposing private CMS API tokens in React applications?",
          "What is the role of Incremental Static Regeneration (ISR) in content publishing?",
        ],
        answers: [
          "They fetch data directly on the server without sending API credentials or data fetching libraries to the client browser.",
          "By performing all authenticated requests inside server-side code (RSC or Route Handlers) and returning only sanitized public data.",
          "It allows static pages to be updated in the background without requiring a complete rebuild of the entire website.",
        ],
      };
    }

    if (
      norm.includes("filter") ||
      norm.includes("sorting") ||
      norm.includes("search")
    ) {
      return {
        introduction: `Efficient filtering, sorting, and full-text searching allow client applications to query exact slices of data without downloading unnecessary records over the network.`,
        definition: `Query parameters translate HTTP requests into optimized SQL WHERE clauses, ORDER BY directives, and LIMIT/OFFSET pagination, reducing network payloads and database CPU usage.`,
        concepts: [
          "Relational Filter Operators (_eq, _contains, _in, _between)",
          "Deep Nested Relational Filtering",
          "Multi-Column Sorting (ASC/DESC)",
          "Full-Text Search Indexing",
          "Cursor vs Offset Pagination",
        ],
        howItWorks: [
          "The client appends query parameters to the endpoint (e.g. ?filter[category][_eq]=tech&sort=-created_at).",
          "The CMS parser validates the fields against collection schemas and role permission rules.",
          "The query compiler converts parameters into parameterized SQL queries preventing SQL injection.",
          "The database engine utilizes B-tree or GIN indexes to return the matching rows rapidly.",
        ],
        tutorial: [
          "Open your API client (Postman, Bruno, or curl).",
          "Send a GET request filtering for active items: '?filter[status][_eq]=published'.",
          "Add sorting by descending creation date: '&sort=-date_created'.",
          "Combine with pagination: '&limit=10&page=1' to inspect the structured response metadata.",
        ],
        example: `// Advanced filtering and relational searching\nconst params = new URLSearchParams({\n  'filter[status][_eq]': 'published',\n  'filter[price][_lte]': '100',\n  'filter[category][slug][_eq]': 'electronics',\n  'sort': '-date_created,title',\n  'limit': '15',\n  'search': 'wireless'\n});\n\nconst url = \`http://localhost:8055/items/products?\${params.toString()}\`;\nconst response = await fetch(url);\nconst { data, meta } = await response.json();\nconsole.log(\`Found \${data.length} products matching filter criteria.\`);`,
        expected: `HTTP 200 OK\nFound 8 products matching filter criteria.\nQuery compiled to parameterized SQL with single JOIN across categories table.`,
        application:
          "E-commerce product filter sidebars allowing shoppers to filter simultaneously by category, price range, brand, color, and in-stock status.",
        considerations: [
          "Add composite database indexes on columns frequently filtered together (e.g. status + category + price).",
          "Avoid using unindexed full-text '_contains' wildcards across massive text columns in high-traffic APIs.",
          "Always enforce a server-side maximum limit to prevent users from requesting ?limit=1000000 and crashing memory.",
        ],
        summary: `Mastering API query filtering and sorting ensures applications retrieve precisely the data needed, maximizing responsiveness and conserving server resources.`,
        questions: [
          "What is the difference between filtering by '_eq' and filtering by '_contains'?",
          "Why should you avoid requesting unbounded API result sets?",
          "How do deep relational filters work across foreign key relationships?",
        ],
        answers: [
          "'_eq' performs exact indexed matching, whereas '_contains' performs substring pattern matching which may require slower table scans.",
          "Unbounded queries can overwhelm server memory, exhaust database connection pools, and degrade performance for all users.",
          "The query compiler joins intermediate foreign key tables automatically, applying filter conditions to nested related records.",
        ],
      };
    }

    // Generic API & Development topic
    return {
      introduction: `APIs are the digital nervous system of ${platform}, translating stored content and business records into standardized, secure HTTP interfaces for any client application.`,
      definition: `The API layer exposes automated REST and GraphQL interfaces supporting complete CRUD (Create, Read, Update, Delete) operations, relational graph traversal, authentication headers, and comprehensive error handling.`,
      concepts: [
        "RESTful Resource Conventions",
        "GraphQL Query & Mutation Schemas",
        "HTTP Status Codes (200, 201, 400, 401, 403, 404, 500)",
        "Stateless Token Authentication",
        "Rate Limiting & Throttling",
      ],
      howItWorks: [
        `Client applications send HTTP requests with JSON payloads and Authorization Bearer headers.`,
        `The API gateway checks authentication tokens, extracts user identity, and verifies role permissions.`,
        `The controller executes the requested CRUD operation against the database transaction.`,
        `The response is formatted into standardized JSON with appropriate HTTP headers and status codes.`,
      ],
      tutorial: [
        `Retrieve your personal API access token from your user profile settings in the dashboard.`,
        `Execute a GET request with curl: 'curl -H \"Authorization: Bearer <token>\" http://localhost:8055/items/articles'.`,
        `Execute a POST request creating a new record with a JSON body.`,
        `Inspect HTTP status codes: verify 200/201 for success and 401/403 for unauthorized attempts.`,
      ],
      example: `// Comprehensive CRUD Operations via REST API\nconst API_BASE = 'http://localhost:8055';\nconst AUTH_HEADER = { 'Authorization': \`Bearer \${process.env.API_TOKEN}\`, 'Content-Type': 'application/json' };\n\n// 1. CREATE\nconst created = await fetch(\`\${API_BASE}/items/notes\`, {\n  method: 'POST',\n  headers: AUTH_HEADER,\n  body: JSON.stringify({ title: 'Architecture Review', content: 'Migrate to Directus 10' })\n}).then(r => r.json());\n\n// 2. READ\nconst item = await fetch(\`\${API_BASE}/items/notes/\${created.data.id}\`, { headers: AUTH_HEADER }).then(r => r.json());\n\n// 3. UPDATE\nawait fetch(\`\${API_BASE}/items/notes/\${created.data.id}\`, {\n  method: 'PATCH',\n  headers: AUTH_HEADER,\n  body: JSON.stringify({ completed: true })\n});\n\n// 4. DELETE\nawait fetch(\`\${API_BASE}/items/notes/\${created.data.id}\`, { method: 'DELETE', headers: AUTH_HEADER });\nconsole.log('CRUD cycle completed successfully.');`,
      expected: `CRUD cycle completed successfully.\nAll operations completed within 45ms total execution time.`,
      application:
        "Automated microservice pipelines where background workers continuously ingest, enrich, and update inventory and order records via REST endpoints.",
      considerations: [
        "Use PATCH rather than PUT for updates to modify only specified fields without overwriting omitted data.",
        "Ensure custom API endpoints validate request payload types to prevent malformed records from entering the database.",
        "Always implement exponential backoff retries in client code to handle transient network blips gracefully.",
      ],
      summary: `Automated REST and GraphQL APIs eliminate the need to write repetitive CRUD controllers, enabling teams to focus immediately on user-facing features.`,
      questions: [
        "What is the architectural difference between HTTP PATCH and HTTP PUT in REST APIs?",
        "Why is returning standard HTTP status codes (401 vs 403) important for client applications?",
        "How do API tokens authenticate server-to-server requests?",
      ],
      answers: [
        "PATCH updates only the fields provided in the payload, while PUT replaces the entire resource with the provided body.",
        "401 indicates unauthenticated (invalid or missing token), while 403 indicates authenticated but lacking required permissions.",
        "They are passed in the HTTP Authorization header as 'Bearer <token>', allowing stateless validation against user roles.",
      ],
    };
  }

  // -------------------------------------------------------------
  // SECURITY & ADMINISTRATION (SECTION 6)
  // -------------------------------------------------------------
  if (
    sectionIndex === 5 ||
    norm.includes("security") ||
    norm.includes("auth") ||
    norm.includes("role") ||
    norm.includes("rbac") ||
    norm.includes("permission") ||
    norm.includes("admin") ||
    norm.includes("backup") ||
    norm.includes("recovery")
  ) {
    if (
      norm.includes("rbac") ||
      norm.includes("permission") ||
      norm.includes("policy")
    ) {
      return {
        introduction: `Role-Based Access Control (RBAC) and granular permission policies enforce least-privilege security, ensuring users, editors, and API keys only interact with permitted resources.`,
        definition: `RBAC structures access into Roles (e.g. Editor, Customer, Auditor) assigned specific CRUD permissions. Field-level permissions and conditional rules restrict access down to individual columns and row criteria (e.g. author == $CURRENT_USER).`,
        concepts: [
          "Principle of Least Privilege",
          "Field-Level Read/Write Permissions",
          "Row-Level Conditional Filters ($CURRENT_USER)",
          "Public Role vs Authenticated Roles",
          "Permission Auditing",
        ],
        howItWorks: [
          "Every authenticated request is mapped to the requesting user's assigned Role.",
          "The permission engine evaluates whether the role has permission for the requested action on the target collection.",
          "Row-level filters append security predicates directly into the underlying SQL query.",
          "Field-level rules strip unauthorized columns from the response payload before returning to the client.",
        ],
        tutorial: [
          "Navigate to Settings > Roles & Permissions in the administrative dashboard.",
          "Create a new role named 'Content Contributor'.",
          "Set permissions on 'articles': allow Read on all fields, but allow Update only if { author: { _eq: '$CURRENT_USER' } }.",
          "Log in as a user with this role and verify that editing another author's article returns an HTTP 403 Forbidden error.",
        ],
        example: `// Example: Configuring row-level permission rule in ${platform}\n// Directus Permission Rule JSON structure:\nconst authorPolicy = {\n  role: "contributor-role-uuid",\n  collection: "articles",\n  action: "update",\n  permissions: {\n    "author": {\n      "_eq": "$CURRENT_USER"\n    }\n  },\n  fields: ["title", "content", "summary"] // Cannot alter 'status' or 'publish_date'\n};\nconsole.log('Policy enforces: Contributors can only edit their own draft title/content.');`,
        expected: `Security Rule Active: Attempting to modify articles where author != $CURRENT_USER rejected with 403 Forbidden.\nField 'status' is read-only for this role.`,
        application:
          "Multi-author digital publications where freelance journalists can draft and edit their own articles, but only senior editors possess permissions to change publication status.",
        considerations: [
          "Always test permissions using dedicated non-admin test accounts; super-admin accounts bypass permission checks.",
          "Field-level permissions protect sensitive fields like password_hash, internal_notes, or ssn from accidental API leakage.",
          "Review the permissions granted to the Public role periodically to prevent unintended data exposure.",
        ],
        summary: `Granular Role-Based Access Control establishes strict data governance, protecting sensitive fields and restricting records to authorized personnel.`,
        questions: [
          "What does the '$CURRENT_USER' dynamic variable represent in permission rules?",
          "Why are field-level permissions critical even if row-level permissions are in place?",
          "What is the Principle of Least Privilege in enterprise security?",
        ],
        answers: [
          "It dynamically injects the ID of the currently authenticated user making the request into the security filter.",
          "Because a user may have permission to view a customer record, but should never be allowed to view their credit card hash or social security number.",
          "The practice of providing each user or service only the absolute minimum permissions required to perform their specific job.",
        ],
      };
    }

    // Generic Security & Administration
    return {
      introduction: `Securing your ${platform} deployment protects confidential business records, prevents unauthorized tampering, and maintains continuous service availability against cyber threats.`,
      definition: `Security architecture encompasses password hashing algorithms (Argon2), authentication rate-limiting, CORS origin restrictions, security headers (Helmet), audit logging, and automated database backups.`,
      concepts: [
        "Argon2 Password Hashing",
        "Brute-Force Rate Limiting",
        "Audit Logging & Activity Tracking",
        "Automated Database Backups (pg_dump)",
        "CORS & Security Headers",
      ],
      howItWorks: [
        `User passwords are encrypted with high-entropy salting and memory-hard Argon2 hashing.`,
        `Failed login attempts are tracked in memory or Redis, triggering temporary IP lockouts after repeated failures.`,
        `Security middleware injects HTTP headers (X-Frame-Options, Content-Security-Policy) preventing clickjacking.`,
        `Nightly cron jobs execute point-in-time database snapshots and upload encrypted archives to secure object storage.`,
      ],
      tutorial: [
        `Enable rate limiting in your environment variables to mitigate brute-force password guessing.`,
        `Configure multi-factor authentication (MFA/2FA) on all administrator accounts.`,
        `Inspect the activity/audit log tab to view recent administrative actions and login attempts.`,
        `Execute a database backup script using 'pg_dump' and verify that you can restore it into a blank test database.`,
      ],
      example: `# Production Security Audit & Backup Scripts\n\n# 1. Automated PostgreSQL backup with timestamp\npg_dump -U postgres -d production_db -F c -b -v -f "./backups/backup_\$(date +%Y%m%d_%H%M%S).dump"\n\n# 2. Verify rate-limiting environment variables\necho "AUTH_RATE_LIMITER_ENABLED: true"\necho "AUTH_RATE_LIMITER_POINTS: 5"\necho "AUTH_RATE_LIMITER_DURATION: 60"`,
      expected: `pg_dump: saving database definition...\npg_dump: saving table data...\npg_dump: archive created: ./backups/backup_20261025_093000.dump (42MB)\nRate limiting active: 5 attempts per 60 seconds per IP.`,
      application:
        "Healthcare and fintech applications subject to HIPAA or SOC2 compliance, requiring immutable audit logs and encrypted point-in-time recovery capabilities.",
      considerations: [
        "Backups are useless unless restore drills are practiced regularly to verify backup integrity.",
        "Store database backups in an isolated cloud region or account with Object Lock enabled to protect against ransomware.",
        "Ensure administrator accounts are required to use strong passwords and two-factor authentication.",
      ],
      summary: `A defense-in-depth security posture pairs rigorous authentication, audit trails, and automated recovery procedures to safeguard business continuity.`,
      questions: [
        "Why is Argon2 preferred over older algorithms like MD5 or SHA1 for password storage?",
        "Why is testing database restores just as important as running backup scripts?",
        "What does an activity audit log provide during a security incident investigation?",
      ],
      answers: [
        "Argon2 is a memory-hard hashing algorithm resistant to GPU and ASIC brute-force cracking attacks.",
        "Because corrupted dumps, missing extensions, or version mismatches can render backup files unusable when an emergency occurs.",
        "A verifiable chronological record of exactly which user account accessed, altered, or deleted records.",
      ],
    };
  }

  // -------------------------------------------------------------
  // ADVANCED TOPICS (SECTION 7)
  // -------------------------------------------------------------
  if (
    sectionIndex === 6 ||
    norm.includes("advanced") ||
    norm.includes("flow") ||
    norm.includes("hook") ||
    norm.includes("extension") ||
    norm.includes("plugin") ||
    norm.includes("interface") ||
    norm.includes("module") ||
    norm.includes("webhook") ||
    norm.includes("real-time") ||
    norm.includes("websocket")
  ) {
    if (
      norm.includes("flow") ||
      norm.includes("hook") ||
      norm.includes("workflow")
    ) {
      return {
        introduction: `Automated workflows and event-driven hooks allow ${platform} to react instantly to data changes, orchestrating notifications, external API syncs, and business logic without external cron servers.`,
        definition: `Workflows connect database lifecycle triggers (create, update, delete) to asynchronous operation chains including conditional branching, custom JavaScript execution, email dispatch, and webhook payloads.`,
        concepts: [
          "Event-Driven Architecture",
          "Lifecycle Hooks (beforeChange, afterChange)",
          "Asynchronous vs Synchronous Execution",
          "Payload Transformation & Webhook Dispatch",
          "Idempotent Automation Design",
        ],
        howItWorks: [
          "A user or API client mutates a record in the database.",
          "The event bus emits a lifecycle event with the record's payload and actor context.",
          "The workflow engine executes configured operations (e.g. format payload, send transactional email).",
          "Execution logs capture input, output, and execution duration for full observability.",
        ],
        tutorial: [
          "Open the automation/workflow editor in your administrative dashboard.",
          "Create a new workflow triggered on the 'orders' collection when status changes to 'paid'.",
          "Add a webhook operation that dispatches order details to a Stripe or fulfillment endpoint.",
          "Trigger a test order and inspect the execution history logs to verify successful dispatch.",
        ],
        example: `// Example: Event-Driven Automation Hook in ${platform}\n${platform === "Directus" ? `// Directus Custom Hook Extension (src/index.js)\nexport default ({ action }) => {\n  action('orders.items.create', async (meta, { schema }) => {\n    const order = meta.payload;\n    console.log(\`[Order Created]: Sending confirmation email for order #\${meta.key}\`);\n    // Dispatch external webhook\n    await fetch('https://api.fulfillment.com/orders', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(order)\n    });\n  });\n};` : platform === "Payload CMS" ? `// Payload Collection Hook\nconst sendWelcomeEmail = async ({ doc, operation }) => {\n  if (operation === 'create') {\n    await sendMail({ to: doc.email, subject: 'Welcome to the platform!' });\n  }\n  return doc;\n};` : `// Keystone List Hook\nexport const hooks = {\n  afterOperation: async ({ operation, item }) => {\n    if (operation === 'create') {\n      await notifySlack(\`New user registered: \${item.email}\`);\n    }\n  }\n};`}`,
        expected: `[Workflow Triggered]: Order #9042 created.\nPayload dispatched to fulfillment webhook in 18ms with HTTP 200 OK.\nExecution logged in workflow history.`,
        application:
          "Automated fulfillment centers where customer orders instantly trigger inventory holds, print shipping labels, and send SMS tracking links to shoppers.",
        considerations: [
          "Keep synchronous hooks fast (<50ms); long-running external API calls should be executed asynchronously to prevent blocking user requests.",
          "Design automated webhooks to be idempotent, ensuring retry attempts do not trigger duplicate charges or double shipments.",
          "Always handle network timeout errors in webhook operations to prevent hanging database transactions.",
        ],
        summary: `Event-driven workflows automate critical business operations directly in response to data changes, turning your CMS into an active business automation engine.`,
        questions: [
          "What is the difference between a synchronous hook and an asynchronous event action?",
          "Why must automated webhook receivers be engineered to be idempotent?",
          "How do workflow execution logs help in diagnosing production integration issues?",
        ],
        answers: [
          "Synchronous hooks execute before the database transaction commits and can block or cancel it; asynchronous actions execute in the background after the save completes.",
          "Because network retries may send the same event payload twice; idempotent handlers ensure the second call causes no duplicate side effects.",
          "They provide an exact historical record of the input payload, external response status, error stacks, and execution latency.",
        ],
      };
    }

    // Generic Advanced Topic
    return {
      introduction: `Extending ${platform} with custom code transforms standard content management into a bespoke enterprise operating system tailored to unique organizational workflows.`,
      definition: `The extension architecture provides modular APIs allowing developers to register custom Vue/React UI interfaces, custom REST endpoints, real-time WebSocket listeners, and third-party SaaS integrations.`,
      concepts: [
        "Modular Extension SDKs",
        "Custom Admin Interfaces & Displays",
        "Custom REST/GraphQL Endpoints",
        "WebSocket Subscriptions",
        "Third-Party Microservice Integrations",
      ],
      howItWorks: [
        `Extensions are developed as isolated packages and loaded into the CMS runtime.`,
        `Custom interfaces inject interactive React or Vue components directly into standard edit forms.`,
        `Custom endpoints register express or route handlers with direct access to database services.`,
        `WebSockets stream live record modifications to connected clients without HTTP polling.`,
      ],
      tutorial: [
        `Run the extension creator CLI command in your project directory.`,
        `Select the extension type (e.g. interface, display, or endpoint).`,
        `Implement your custom Vue or React component or Express route handler.`,
        `Build the extension bundle and reload your server to inspect the new capability in the UI.`,
      ],
      example: `// Example: Real-Time WebSocket Listener\nconst ws = new WebSocket('ws://localhost:8055/websocket');\n\nws.onopen = () => {\n  // Authenticate and subscribe to new orders\n  ws.send(JSON.stringify({\n    type: 'auth',\n    access_token: 'user-access-token'\n  }));\n  ws.send(JSON.stringify({\n    type: 'subscribe',\n    collection: 'orders',\n    query: { fields: ['id', 'total', 'customer_name'] }\n  }));\n};\n\nws.onmessage = (event) => {\n  const message = JSON.parse(event.data);\n  console.log('Real-Time Order Update Received:', message);\n};`,
      expected: `WebSocket connection established.\nSubscription confirmed on collection 'orders'.\nReal-Time Update: { type: 'items', event: 'create', data: [{ id: 89, total: 249.99, customer_name: 'Sarah Connor' }] }`,
      application:
        "Live financial trading dashboards and emergency dispatch consoles requiring sub-second record updates streamed simultaneously to hundreds of operator screens.",
      considerations: [
        "Ensure custom extensions are built and bundled using production optimizations to avoid bloating admin SPA load times.",
        "Verify that custom endpoints enforce appropriate authentication checks before executing database queries.",
        "WebSocket servers require sticky sessions or Redis pub/sub adapters when scaling across multiple container instances.",
      ],
      summary: `Extensibility turns ${platform} into an infinite canvas, enabling engineering teams to build custom UI controls, proprietary algorithms, and real-time streaming services directly into the core.`,
      questions: [
        "What capability do WebSockets provide over standard HTTP REST requests?",
        "How do custom interfaces enhance the data entry experience for specialized fields?",
        "Why is Redis required when running WebSockets across multiple server replicas?",
      ],
      answers: [
        "Bidirectional, real-time push communication with minimal latency, eliminating the need for periodic client polling.",
        "They allow rendering specialized widgets like interactive maps, color pickers, or audio waveform editors instead of plain text boxes.",
        "To publish and distribute WebSocket broadcast events across all running server instances so all connected clients receive updates regardless of which node they connected to.",
      ],
    };
  }

  // -------------------------------------------------------------
  // PRACTICAL PROJECTS (SECTION 8)
  // -------------------------------------------------------------
  if (
    sectionIndex === 7 ||
    norm.includes("practical") ||
    norm.includes("project") ||
    norm.includes("system") ||
    norm.includes("platform") ||
    norm.includes("website")
  ) {
    const projectDomain = norm.includes("student")
      ? "Student Information System"
      : norm.includes("learning")
        ? "Online Learning Management Platform"
        : norm.includes("e-commerce")
          ? "E-Commerce Product & Inventory System"
          : norm.includes("blog")
            ? "High-Traffic Publishing Blog"
            : norm.includes("inventory")
              ? "Warehouse Inventory & Asset Tracking System"
              : norm.includes("announcement")
                ? "Campus-Wide Emergency Announcement System"
                : norm.includes("library")
                  ? "Library Catalog & Loan Management System"
                  : "Interactive Creative Portfolio & Case Study System";

    return {
      introduction: `Synthesizing your knowledge of ${platform} into a complete, production-grade ${projectDomain} cements architectural mastery by connecting data models, security rules, and user interfaces into a cohesive digital product.`,
      definition: `This comprehensive capstone project combines relational collection design, role-based security policies, automated workflow triggers, and client-side presentation into a real-world ${projectDomain}.`,
      concepts: [
        `${projectDomain} Domain Architecture`,
        "Normalized Relational Data Modeling",
        "Multi-Tier Role Security (Admin, Staff, End-User)",
        "Automated Business Logic Workflows",
        "Production Deployment & Verification",
      ],
      howItWorks: [
        `Core business entities are modeled with appropriate primary keys, indexes, and relational foreign keys.`,
        `Role permissions enforce strict boundaries ensuring end-users only access their respective records.`,
        `Event-driven workflows automate transactional emails, status updates, and audit logging.`,
        `A decoupled frontend client consumes the generated APIs, rendering responsive, accessible user interfaces.`,
      ],
      tutorial: [
        `Design the complete Entity-Relationship Diagram (ERD) mapping all collections and foreign keys for the ${projectDomain}.`,
        `Create the collections and fields in ${platform}, configuring validation rules and required constraints.`,
        `Set up dedicated user roles and test permission boundaries with separate test user logins.`,
        `Implement a frontend application or test harness demonstrating complete end-to-end CRUD workflows.`,
      ],
      example: `// Capstone Implementation: End-to-End Workflow for ${projectDomain}\nasync function runProjectWorkflow() {\n  console.log('--- Initializing ${projectDomain} Workflow ---');\n  \n  // 1. Submit new record\n  const record = await fetch('http://localhost:8055/items/${slugify(projectDomain).slice(0, 12)}', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.API_TOKEN },\n    body: JSON.stringify({\n      name: 'Test Record',\n      status: 'active',\n      created_at: new Date().toISOString()\n    })\n  }).then(r => r.json());\n  \n  console.log('Record created successfully:', record.data);\n  console.log('Automated workflow triggered and verified.');\n}\nrunProjectWorkflow();`,
      expected: `--- Initializing ${projectDomain} Workflow ---\nRecord created successfully with generated ID.\nRole permissions verified: Public access denied, Authenticated user approved.\nAutomated notification dispatched.`,
      application: `Deploying the ${projectDomain} to production on cloud infrastructure, serving hundreds of daily active users with sub-second response times and 99.9% uptime.`,
      considerations: [
        "Plan your database relationships carefully before loading large datasets to avoid expensive live table migrations.",
        "Always implement automated test suites verifying that permission boundaries cannot be circumvented.",
        "Configure automated database backup snapshots and monitoring alerts before launching to real users.",
      ],
      summary: `Building a complete ${projectDomain} proves your capability to design, secure, automate, and deploy enterprise-grade applications powered by ${platform}.`,
      questions: [
        `What are the core entity collections required to build this ${projectDomain}?`,
        `How do role permissions protect sensitive records in this specific business domain?`,
        `What automated workflow adds the most operational value to this project?`,
      ],
      answers: [
        `The primary entity collections representing the domain actors, transactions, and historical activity logs.`,
        `By applying least-privilege policies that restrict end-users strictly to their own rows while granting administrators oversight.`,
        `Automated status transitions and instant email/webhook notifications that eliminate manual human intervention.`,
      ],
    };
  }

  // -------------------------------------------------------------
  // FALLBACK FOR ANY OTHER UNIQUE TOPIC
  // -------------------------------------------------------------
  return {
    introduction: `Mastering ${topic} unlocks greater efficiency, performance, and reliability when building applications on ${platform}.`,
    definition: `${topic} addresses specific engineering challenges in ${platform}, optimizing data flow, system configuration, or developer productivity.`,
    concepts: [
      `${topic} Core Principles`,
      "Runtime Configuration & Execution",
      "Data Integrity Assurance",
      "System Scalability",
      "Best Practice Standards",
    ],
    howItWorks: [
      `The system initializes the relevant component during application boot.`,
      `Incoming operations are processed and validated against predefined schemas.`,
      `The runtime executes the logic and updates the underlying state.`,
      `Results are logged and returned to the calling client or interface.`,
    ],
    tutorial: [
      `Review current project configuration relating to ${topic}.`,
      `Apply recommended settings or code structures in your development workspace.`,
      `Execute test requests or commands to observe system behavior.`,
      `Verify logs and outputs to ensure operational compliance.`,
    ],
    example: `// Example implementation for ${topic}\nconsole.log('Configuring ${topic} in ${platform}...');\nconst config = {\n  feature: '${topic}',\n  platform: '${platform}',\n  enabled: true,\n  timestamp: new Date().toISOString()\n};\nconsole.table(config);`,
    expected: `Feature '${topic}' successfully initialized and verified in ${platform}.`,
    application: `Applied in enterprise production environments to ensure consistent behavior, high availability, and developer efficiency.`,
    considerations: [
      "Ensure all dependencies and prerequisites are satisfied prior to deployment.",
      "Monitor application performance metrics after enabling this capability in production.",
      "Maintain clear documentation so team members can reproduce the configuration.",
    ],
    summary: `Understanding and implementing ${topic} provides robust foundation for professional, scalable deployments on ${platform}.`,
    questions: [
      `What primary challenge does ${topic} solve in ${platform}?`,
      `What are the key configuration parameters associated with ${topic}?`,
      `How can you verify that ${topic} is operating correctly?`,
    ],
    answers: [
      `It optimizes performance, simplifies data management, and enforces architectural consistency.`,
      `Environment variables, schema options, and runtime execution flags.`,
      `By inspecting server logs, verifying API responses, and checking admin interface status.`,
    ],
  };
}

// =========================================================================
// DATASET GENERATOR SCRIPT
// =========================================================================
function generatePlatformDataset(sections, platform) {
  let content = `// Generated bespoke content for ${platform}\n`;
  content += `export const ${platform === "Directus" ? "DIRECTUS_CONTENT" : platform === "Payload CMS" ? "PAYLOAD_CONTENT" : "KEYSTONE_CONTENT"} = {\n`;
  const imagePaths =
    platform === "Directus"
      ? DIRECTUS_IMAGE_PATHS
      : platform === "Payload CMS"
        ? PAYLOAD_IMAGE_PATHS
        : KEYSTONE_IMAGE_PATHS;

  sections.forEach(([sectionTitle, topics], sectionIndex) => {
    const sectionPrefix =
      platform === "Directus"
        ? "section"
        : platform === "Payload CMS"
          ? "payload-section"
          : "keystone-section";
    const sectionId = `${sectionPrefix}-${sectionIndex + 1}-${slugify(sectionTitle)}`;

    content += `  "${sectionId}": {\n`;
    content += `    title: "${sectionTitle}",\n`;
    content += `    sectionTitle: "${sectionTitle}",\n`;
    content += `    sectionNumber: ${sectionIndex + 1},\n`;
    if (
      platform === "Directus" ||
      platform === "Payload CMS" ||
      platform === "KeystoneJS"
    ) {
      const sectionImages = buildCourseImagePlaceholders(
        imagePaths,
        sectionTitle,
        sectionTitle,
        sectionIndex + 1,
      );
      if (sectionImages.length) {
        content += `    images: ${JSON.stringify(sectionImages, null, 10)},\n`;
      }
    }
    content += `    subtopics: [\n`;

    topics.forEach((topic, topicIndex) => {
      const data = buildTopicData(
        topic,
        sectionTitle,
        sectionIndex,
        topicIndex + 1,
        platform,
      );
      const subtopicId = slugify(topic);

      content += `      {\n`;
      content += `        id: "${subtopicId}",\n`;
      content += `        title: "${topic}",\n`;
      content += `        sectionTitle: "${sectionTitle}",\n`;
      content += `        topicIndex: ${topicIndex + 1},\n`;
      if (
        platform === "Directus" ||
        platform === "Payload CMS" ||
        platform === "KeystoneJS"
      ) {
        const topicImages = buildCourseImagePlaceholders(
          imagePaths,
          sectionTitle,
          topic,
          sectionIndex + 1,
          topicIndex + 1,
        );
        if (topicImages.length) {
          content += `        images: ${JSON.stringify(topicImages, null, 10)},\n`;
        }
      }
      content += `        introduction: \`${escapeCode(data.introduction)}\`,\n`;
      content += `        definition: \`${escapeCode(data.definition)}\`,\n`;
      content += `        concepts: ${JSON.stringify(data.concepts, null, 10)},\n`;
      content += `        howItWorks: ${JSON.stringify(data.howItWorks, null, 10)},\n`;
      content += `        tutorial: ${JSON.stringify(data.tutorial, null, 10)},\n`;
      content += `        example: \`${escapeCode(data.example)}\`,\n`;
      content += `        expected: \`${escapeCode(data.expected)}\`,\n`;
      content += `        application: \`${escapeCode(data.application)}\`,\n`;
      content += `        considerations: ${JSON.stringify(data.considerations, null, 10)},\n`;
      content += `        summary: \`${escapeCode(data.summary)}\`,\n`;
      content += `        questions: ${JSON.stringify(data.questions, null, 10)},\n`;
      content += `        answers: ${JSON.stringify(data.answers, null, 10)}\n`;
      content += `      }${topicIndex < topics.length - 1 ? "," : ""}\n`;
    });

    content += `    ]\n`;
    content += `  }${sectionIndex < sections.length - 1 ? "," : ""}\n`;
  });

  content += `};\n`;
  return content;
}

// Generate files
console.log("Generating Directus content...");
const directusContent = generatePlatformDataset(DIRECTUS_SECTIONS, "Directus");
fs.writeFileSync(
  path.join(targetDir, "directusContent.js"),
  directusContent,
  "utf-8",
);

if (process.env.DIRECTUS_ONLY === "1") {
  console.log(
    "Directus content generated. Skipping Payload and Keystone files.",
  );
  process.exit(0);
}

console.log("Generating Payload CMS content...");
const payloadContent = generatePlatformDataset(PAYLOAD_SECTIONS, "Payload CMS");
fs.writeFileSync(
  path.join(targetDir, "payloadContent.js"),
  payloadContent,
  "utf-8",
);

console.log("Generating KeystoneJS content...");
const keystoneContent = generatePlatformDataset(
  KEYSTONE_SECTIONS,
  "KeystoneJS",
);
fs.writeFileSync(
  path.join(targetDir, "keystoneContent.js"),
  keystoneContent,
  "utf-8",
);

console.log(
  "All course content modules generated successfully in src/lib/courseData/!",
);
