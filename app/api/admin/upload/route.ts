import { NextResponse } from "next/server";
import { Readable } from "stream";
import { uploadImageFromBuffer, uploadVideoFromBuffer } from "../../../../lib/cloudinary";
import cloudinary from "../../../../lib/cloudinary";
import { getSessionUser } from "../../../../lib/server-utils";
import { hasPermission } from "../../../../lib/permissions";

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export async function POST(req: Request) {
  try {
    // Defense-in-depth: middleware also guards /api/admin/*, but never rely on it alone.
    const user = await getSessionUser();
    if (!user || (!hasPermission(user, "products:write") && !hasPermission(user, "news:write"))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let result: any = null;

    // Raw binary video upload — client sends video bytes directly (no multipart).
    // This avoids req.formData() which can fail on large bodies in Next.js App Router.
    if (req.headers.get("x-upload-type") === "video") {
      const mimeType = contentType.split(";")[0].trim();
      if (mimeType && !ALLOWED_VIDEO_MIME.has(mimeType)) {
        return NextResponse.json({ message: "Unsupported video type. Use MP4, WebM, MOV, or OGG." }, { status: 415 });
      }
      const folder = (req.headers.get("x-upload-folder") || "gallery").trim();
      if (!req.body) {
        return NextResponse.json({ message: "No body" }, { status: 400 });
      }
      const declaredLength = Number(req.headers.get("content-length") || 0);
      if (declaredLength > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json({ message: "Video too large (max 100 MB)" }, { status: 413 });
      }
      result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "video" },
          (err, res) => {
            if (err || !res) reject(err ?? new Error("Cloudinary upload failed"));
            else resolve(res);
          }
        );
        // Guard against the request stream ending early: piping alone swallows
        // errors and Cloudinary would store the partial bytes as a complete
        // video (this truncated large gallery uploads to a few seconds).
        const nodeStream = Readable.fromWeb(req.body as any);
        let received = 0;
        nodeStream.on("data", (chunk: Buffer) => {
          received += chunk.length;
        });
        nodeStream.on("error", (err) => {
          uploadStream.destroy(err);
          reject(err);
        });
        nodeStream.on("end", () => {
          if (declaredLength > 0 && received !== declaredLength) {
            const err = new Error(`Upload incomplete: received ${received} of ${declaredLength} bytes`);
            uploadStream.destroy(err);
            reject(err);
          }
        });
        nodeStream.pipe(uploadStream);
      });
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as any;
      const folder = (form.get("folder") || "").toString().trim() || "ecom_products";
      const resourceType = (form.get("resource_type") || "image").toString().trim();
      const isVideo = resourceType === "video";

      if (!file || typeof file.arrayBuffer !== "function") {
        return NextResponse.json({ message: "file required" }, { status: 400 });
      }
      if (isVideo) {
        if (file.type && !ALLOWED_VIDEO_MIME.has(file.type)) {
          return NextResponse.json({ message: "Unsupported video type. Use MP4, WebM, MOV, or OGG." }, { status: 415 });
        }
        if (typeof file.size === "number" && file.size > MAX_VIDEO_SIZE_BYTES) {
          return NextResponse.json({ message: "Video too large (max 100 MB)" }, { status: 413 });
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        result = await uploadVideoFromBuffer(buffer, { folder });
      } else {
        if (file.type && !ALLOWED_IMAGE_MIME.has(file.type)) {
          return NextResponse.json({ message: "Unsupported file type" }, { status: 415 });
        }
        if (typeof file.size === "number" && file.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: "File too large (max 5 MB)" }, { status: 413 });
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: "File too large (max 5 MB)" }, { status: 413 });
        }
        result = await uploadImageFromBuffer(buffer, { folder });
      }
    } else {
      const body = await req.json().catch(() => ({}));
      const folder = (body.folder || "").toString().trim() || "ecom_products";
      if (body.dataUrl) {
        const matches = body.dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return NextResponse.json({ message: "Invalid dataUrl" }, { status: 400 });
        const mime = matches[1];
        if (!ALLOWED_IMAGE_MIME.has(mime)) {
          return NextResponse.json({ message: "Unsupported file type" }, { status: 415 });
        }
        const b = Buffer.from(matches[2], "base64");
        if (b.length > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: "File too large (max 5 MB)" }, { status: 413 });
        }
        result = await uploadImageFromBuffer(b, { folder });
      } else {
        return NextResponse.json({ message: "No file or dataUrl provided" }, { status: 400 });
      }
    }

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Upload failed" }, { status: 500 });
  }
}
