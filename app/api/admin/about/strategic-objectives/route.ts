import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import StrategicObjectivesSettings, { STRATEGIC_OBJECTIVES_DEFAULTS } from "../../../../../models/StrategicObjectivesSettings";

function serialize(s: any) {
  return {
    badgeText: s?.badgeText ?? STRATEGIC_OBJECTIVES_DEFAULTS.badgeText,
    heading: s?.heading ?? STRATEGIC_OBJECTIVES_DEFAULTS.heading,
    description: s?.description ?? STRATEGIC_OBJECTIVES_DEFAULTS.description,
    objectives: Array.isArray(s?.objectives) && s.objectives.length > 0
      ? s.objectives
      : STRATEGIC_OBJECTIVES_DEFAULTS.objectives,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await StrategicObjectivesSettings.findOne({ singletonKey: "strategic-objectives" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();

  const badgeText = (body.badgeText || "").toString().trim() || STRATEGIC_OBJECTIVES_DEFAULTS.badgeText;
  const heading = (body.heading || "").toString().trim() || STRATEGIC_OBJECTIVES_DEFAULTS.heading;
  const description = (body.description || "").toString().trim();
  const objectives = Array.isArray(body.objectives)
    ? body.objectives
        .filter((o: any) => o && typeof o.name === "string" && o.name.trim())
        .map((o: any) => ({
          name: o.name.toString().trim(),
          desc: (o.desc || "").toString().trim(),
          icon: (o.icon || "cog").toString().trim(),
        }))
    : STRATEGIC_OBJECTIVES_DEFAULTS.objectives;

  const doc = await StrategicObjectivesSettings.findOneAndUpdate(
    { singletonKey: "strategic-objectives" },
    { $set: { singletonKey: "strategic-objectives", badgeText, heading, description, objectives } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
