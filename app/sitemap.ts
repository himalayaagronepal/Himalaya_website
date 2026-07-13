import type { MetadataRoute } from "next";
import connectToDatabase from "../lib/mongodb";
import Product from "../models/Product";
import News from "../models/News";

export const revalidate = 3600;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.himalayaagronepal.com").replace(/\/$/, "");

// Public, crawlable routes (admin / auth / checkout / account routes are excluded — see robots.ts).
const STATIC_PATHS = [
  "/",
  "/about-us/who-we-are",
  "/about-us/investor-relations",
  "/about-us/board-of-directors",
  "/about-us/executive-team",
  "/about-us/expert-team",
  "/about-us/hear-from-md",
  "/managing-director",
  "/company/organic-farming",
  "/company/dairy-livestock",
  "/company/horticulture",
  "/company/irrigation-water",
  "/company/agri-tech",
  "/company/crop-cultivation",
  "/farms",
  "/farms/poultry",
  "/farms/buffalo",
  "/farms/fish",
  "/farms/goat",
  "/knowledge-centre/success-stories",
  "/knowledge-centre/farmer-friendly-articles",
  "/knowledge-centre/publications-documents",
  "/knowledge-centre/training-resources",
  "/gallery",
  "/contact",
  "/shop",
  "/outlet",
  "/news",
  "/news-and-notices",
  "/notices",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  // Dynamic content is best-effort: if the DB is unreachable (e.g. at build time)
  // we still emit a valid sitemap of the static routes rather than failing the route.
  const dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();

    const products = await Product.find({ isActive: true }).select("_id updatedAt").lean();
    for (const p of products as any[]) {
      dynamicEntries.push({
        url: `${BASE}/product/${String(p._id)}`,
        lastModified: p.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    const news = await News.find({ status: "published" }).select("slug updatedAt publishedAt").lean();
    for (const n of news as any[]) {
      if (!n.slug) continue;
      dynamicEntries.push({
        url: `${BASE}/news/${n.slug}`,
        lastModified: n.updatedAt || n.publishedAt || now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // swallow — static entries are still returned
  }

  return [...staticEntries, ...dynamicEntries];
}
