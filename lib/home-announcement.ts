import connectToDatabase from "./mongodb";
import Notice from "../models/Notice";
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

    // Bundled publications are real notices too. Older database uploads must not
    // hide a newer bundled notice, while later admin publications still win.
    if (!notice || new Date(notice.publishedAt || notice.createdAt).getTime() < new Date(latest.publishedAt).getTime()) {
      return bundledAnnouncement;
    }

    if (notice) {
      const uploadedUrl = publicUrl(notice.fileUrl);
      // Registered source URLs identify the same document after an admin upload.
      // In particular, Cloudinary raw PDFs can have no extension and cannot be
      // decoded as images. Use the document's page previews and original PDF.
      const bundledNotice = currentNotices.notices.find((item) =>
        uploadedUrl && (item.fileUrl === uploadedUrl || item.sourceUrls?.includes(uploadedUrl))
      );
      const href = bundledNotice?.fileUrl || uploadedUrl;
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

    return bundledAnnouncement;
  } catch (error) {
    console.error("Unable to load the homepage announcement:", error);
    return bundledAnnouncement;
  }
}
