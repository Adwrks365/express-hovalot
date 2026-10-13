import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      { source: "/contact-us", destination: "/%D7%A6%D7%A8%D7%95-%D7%A7%D7%A9%D7%A8/", permanent: true },
      { source: "/contact-us/", destination: "/%D7%A6%D7%A8%D7%95-%D7%A7%D7%A9%D7%A8/", permanent: true },
      {
        source: "/%D7%A4%D7%AA%D7%A8%D7%95%D7%A0%D7%95%D7%AA-%D7%90%D7%97%D7%A1%D7%A0%D7%94",
        destination: "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
        permanent: true,
      },
      {
        source: "/%D7%A4%D7%AA%D7%A8%D7%95%D7%A0%D7%95%D7%AA-%D7%90%D7%97%D7%A1%D7%A0%D7%94/",
        destination: "/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/",
        permanent: true,
      },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap_index.xml/", destination: "/sitemap.xml", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  experimental: {
    optimizePackageImports: ["@/components"],
  },
};

export default nextConfig;
