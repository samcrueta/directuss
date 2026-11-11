/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "169.254.*.*",
    ...Array.from({ length: 16 }, (_, index) => `172.${index + 16}.*.*`)
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co"
      }
    ]
  },
  async redirects() {
    return [
      {
        source: "/courses/:courseId/section-7-advanced-directus-topics",
        destination: "/courses/:courseId/advanced",
        permanent: false
      },
      {
        source: "/courses/payload-cms/payload-section-7-advanced-payload-cms-topics",
        destination: "/courses/payload-cms/advanced",
        permanent: false
      },
      {
        source: "/courses/keystonejs/keystone-section-7-advanced-keystonejs-topics",
        destination: "/courses/keystonejs/advanced",
        permanent: false
      },
      {
        source: "/studio",
        destination:
          "/courses/directus-from-beginner-to-advanced/advanced/build-a-button",
        permanent: false
      },
      {
        source: "/courses/directus-from-beginner-to-advanced/level-8",
        destination:
          "/courses/directus-from-beginner-to-advanced/section-8-practical-projects-using-directus#directus-charts",
        permanent: false
      },
      {
        source: "/courses/payload-cms/level-8",
        destination:
          "/courses/payload-cms/payload-section-8-practical-projects-using-payload-cms#payload-charts",
        permanent: false
      },
      {
        source: "/courses/keystonejs/level-8",
        destination:
          "/courses/keystonejs/keystone-section-8-practical-projects-using-keystonejs#keystone-charts",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
