import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Category from "../../../models/Category";

export async function GET(req: Request) {
  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 }).lean();
  const publicCats = categories.map((c) => ({ _id: c._id, name: c.name, productsCount: (c.products || []).length }));
  return NextResponse.json({ categories: publicCats });
}
