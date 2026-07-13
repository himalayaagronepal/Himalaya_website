import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Category from "../../../../models/Category";
import Product from "../../../../models/Product";
import { getSessionUser } from "../../../../lib/server-utils";
import { hasPermission } from "../../../../lib/permissions";

export async function GET() {
  const user = await getSessionUser();
  if (!hasPermission(user, "categories:read")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!hasPermission(user, "categories:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  await connectToDatabase();

  const payload: any = {
    name: String(body.name).trim(),
    slug: body.slug ? String(body.slug).trim() : undefined,
    products: Array.isArray(body.products) ? body.products : [],
  };

  const cat = await Category.findOneAndUpdate({ name: payload.name }, { $set: payload }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
  return NextResponse.json(cat, { status: 201 });
}

