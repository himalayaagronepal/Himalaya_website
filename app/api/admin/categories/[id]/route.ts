import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/mongodb";
import Category from "../../../../../models/Category";
import Product from "../../../../../models/Product";
import { getSessionUser } from "../../../../../lib/server-utils";
import { hasPermission } from "../../../../../lib/permissions";

export async function PATCH(req: Request, context: any) {
  const user = await getSessionUser();
  if (!hasPermission(user, "categories:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const body = await req.json();
  await connectToDatabase();

  const updated = await Category.findByIdAndUpdate(id, { $set: { name: body.name, slug: body.slug } }, { new: true, runValidators: true }).lean();
  if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // keep product.category (string) in sync for products that referenced this category name
  if (body.name) {
    await Product.updateMany({ _id: { $in: updated.products } }, { $set: { category: body.name } });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: any) {
  const user = await getSessionUser();
  if (!hasPermission(user, "categories:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  await connectToDatabase();

  const cat = await Category.findById(id).lean();
  if (!cat) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // unset category field on products that were in this category
  await Product.updateMany({ _id: { $in: cat.products } }, { $unset: { category: "" } });
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
