import connectToDatabase from "./mongodb";
import Notice from "../models/Notice";
import News from "../models/News";
import currentNotices from "./current-notices.json";

export type HomeAnnouncement = {
  id: string;
  kind: "notice" | "news";
  title: string;
  titleNe?: string;
  category: string;
  publishedAt: string;
  excerpt?: string;
  href: string | null;
  imageUrl: string | null;
  previewImages?: string[];
};

const LOCAL_URL_BASE = "https://local.invalid";

function publicUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, LOCAL_URL_BASE);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin === LOCAL_URL_BASE ? `${url.pathname}${url.search}${url.hash}` : url.href;
  } catch {
    return null;
  }
}

export async function getHomeAnnouncement(): Promise<HomeAnnouncement | null> {
  const latest = currentNotices.notices[0];
  const bundledAnnouncement: HomeAnnouncement = {
    id: latest.id,
    kind: "notice",
    title: latest.title,
    titleNe: latest.titleNe,
    category: latest.type,
    publishedAt: latest.publishedAt,
    href: latest.fileUrl,
    imageUrl: latest.previewImages[0] || null,
    previewImages: latest.previewImages,
  };
  if (!process.env.MONGODB_URI) return bundledAnnouncement;

  try {
    await connectToDatabase();

    // The board's sample-data settings do not control real homepage announcements.
    const notice = await Notice.findOne({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
      .select("title titleNe type fileUrl publishedAt createdAt")
      .lean();

    if (notice) {
      const href = publicUrl(notice.fileUrl);
      const bundledNotice = currentNotices.notices.find((item) => item.fileUrl && item.fileUrl === href);
      // Older raw uploads can have extensionless URLs. Try an image preview and
      // let the client fall back to a document card if the browser cannot decode it.
      const isDocument = href && /\.(pdf|docx?|xlsx?|pptx?|txt|zip)$/i.test(new URL(href, LOCAL_URL_BASE).pathname);
      return {
        id: String(notice._id),
        kind: "notice",
        title: notice.title,
        titleNe: notice.titleNe,
        category: notice.type || "Notice",
        publishedAt: new Date(notice.publishedAt || notice.createdAt).toISOString(),
        href,
        imageUrl: href && !isDocument ? href : null,
        previewImages: bundledNotice?.previewImages,
      };
    }

    const news = await News.findOne({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
      .select("title titleNe category publishedAt createdAt excerpt coverImage slug")
      .lean();

    if (!news) return null;
    return {
      id: String(news._id),
      kind: "news",
      title: news.title,
      titleNe: news.titleNe,
      category: news.category || "News",
      publishedAt: new Date(news.publishedAt || news.createdAt).toISOString(),
      excerpt: news.excerpt,
      href: `/news/${encodeURIComponent(news.slug)}`,
      imageUrl: publicUrl(news.coverImage),
    };
  } catch (error) {
    console.error("Unable to load the homepage announcement:", error);
    return bundledAnnouncement;
  }
}
