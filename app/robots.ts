import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.himalayaagronepal.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep admin, API, account, and transactional routes out of search indexes.
        disallow: [
          "/admin",
          "/api",
          "/employee",
          "/my-orders",
          "/cart",
          "/checkout",
          "/login",
          "/register",
          "/esewa",
          "/search",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
