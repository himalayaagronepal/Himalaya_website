import { NextResponse } from "next/server";
import { uploadRawFromBuffer } from "../../../../../lib/cloudinary";
import { getSessionUser } from "../../../../../lib/server-utils";
import { hasPermission } from "../../../../../lib/permissions";

// Notice attachments are documents (mostly PDFs) plus the occasional image. They
// are stored as Cloudinary `raw` assets so the link opens the original file.
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    // Defense-in-depth: middleware also guards /api/admin/*, but never rely on it alone.
    const user = await getSessionUser();
    if (!user || !hasPermission(user, "news:write")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ message: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file") as any;
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "file required" }, { status: 400 });
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ message: "Unsupported file type (PDF or image only)" }, { status: 415 });
    }
    if (typeof file.size === "number" && file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: "File too large (max 10MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: "File too large (max 10MB)" }, { status: 413 });
    }

    // Keep the original filename (Cloudinary `raw` assets keep their extension via
    // use_filename + unique suffix), so the downloaded file is named sensibly.
    const result = await uploadRawFromBuffer(buffer, {
      folder: "ecom_notices",
      use_filename: true,
      unique_filename: true,
    });

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Upload failed" }, { status: 500 });
  }
}
