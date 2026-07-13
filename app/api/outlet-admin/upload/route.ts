import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { uploadImageFromBuffer } from "../../../../lib/cloudinary";

async function requireOutletAdminOrShopkeeper() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return null;
  const user = session.user;
  if (user?.role === "outlet-admin") return session;
  if (user?.role === "employee" && user?.outletId) {
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    // Any section that involves uploading images (products or outlet info) may upload.
    if (perms.includes("products:write") || perms.includes("outlet:write")) return session;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await requireOutletAdminOrShopkeeper();
    if (!session) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let result: any = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as any;
      const folder = (form.get("folder") || "outlet_assets").toString().trim() || "outlet_assets";
      if (!file) return NextResponse.json({ message: "file required" }, { status: 400 });
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      result = await uploadImageFromBuffer(buffer, { folder });
    } else {
      const body = await req.json().catch(() => ({}));
      const folder = (body.folder || "outlet_assets").toString().trim() || "outlet_assets";
      if (body.dataUrl) {
        const matches = body.dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return NextResponse.json({ message: "Invalid dataUrl" }, { status: 400 });
        const b = Buffer.from(matches[2], "base64");
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