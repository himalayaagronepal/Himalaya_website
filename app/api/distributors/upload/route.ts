import { NextResponse } from "next/server";
import { uploadImageFromBuffer } from "../../../../lib/cloudinary";

const MAX_FILE_SIZE_BYTES = 200 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export const runtime = "nodejs";

// NOTE: This endpoint is intentionally public (used during distributor registration,
// before an account exists). It is constrained to small image uploads only. It still
// needs abuse protection (rate limiting / one-time token) — tracked in the audit as H-3.
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Invalid multipart form data" }, { status: 400 });
  }

  try {
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "file required" }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ message: "Only JPG, PNG, or WEBP images are allowed" }, { status: 415 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: "File size must be 200KB or less" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageFromBuffer(buffer, {
      folder: "distributor_documents",
    });

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}