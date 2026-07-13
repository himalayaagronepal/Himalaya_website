import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import ContentSettings, { CONTENT_SETTINGS_DEFAULTS } from "../../../../models/ContentSettings";
import { hasPermission } from "../../../../lib/permissions";

function serialize(s: any) {
  return {
    newsDummyEnabled:
      typeof s?.newsDummyEnabled === "boolean" ? s.newsDummyEnabled : CONTENT_SETTINGS_DEFAULTS.newsDummyEnabled,
    noticesDummyEnabled:
      typeof s?.noticesDummyEnabled === "boolean" ? s.noticesDummyEnabled : CONTENT_SETTINGS_DEFAULTS.noticesDummyEnabled,
  };
}

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:read")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await connectToDatabase();
  const doc = await ContentSettings.findOne({ singletonKey: "content" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

// PUT — upsert the dummy-content toggles. Only the booleans that are sent are
// updated, so the two switches can be flipped independently.
export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  const update: Record<string, boolean> = {};
  if (typeof body.newsDummyEnabled === "boolean") update.newsDummyEnabled = body.newsDummyEnabled;
  if (typeof body.noticesDummyEnabled === "boolean") update.noticesDummyEnabled = body.noticesDummyEnabled;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await ContentSettings.findOneAndUpdate(
    { singletonKey: "content" },
    { $set: { singletonKey: "content", ...update } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Settings saved" });
}
