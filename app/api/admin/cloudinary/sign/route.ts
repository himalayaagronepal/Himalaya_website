import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionUser } from "../../../../../lib/server-utils";
import { VIDEO_TRANSFORMATION } from "../../../../../lib/videoDelivery";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user as any).role === "user" || (user as any).role === "distributor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const folder = (body.folder || "gallery").toString().trim();

    const timestamp = Math.round(Date.now() / 1000);
    // `eager` pre-generates the browser-safe H.264 rendition at upload time
    // (async), so the public gallery never hits a cold/unprocessed transform.
    // It is part of the signature, so the client cannot alter it.
    const paramsToSign: Record<string, string | number | boolean> = {
      eager: VIDEO_TRANSFORMATION,
      eager_async: true,
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      eager: VIDEO_TRANSFORMATION,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err: any) {
    console.error("[cloudinary/sign]", err);
    return NextResponse.json({ message: err.message || "Signature generation failed" }, { status: 500 });
  }
}
