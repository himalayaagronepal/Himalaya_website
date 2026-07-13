import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Product from "../../../models/Product";
import { getSessionUser } from "../../../lib/server-utils";
import { hasPermission } from "../../../lib/permissions";

export async function GET(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const farmCategory = url.searchParams.get("farmCategory") || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Number(url.searchParams.get("limit") || 12));

  const filter: any = { isActive: true };
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (farmCategory) filter.farmCategory = farmCategory;

  const [items, total] = await Promise.all([
    Product.find(filter).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({ items, meta: { total, page, limit } });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!hasPermission(user, "products:write")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  await connectToDatabase();

  const payload = {
    name: body.name,
    description: body.description || "",
    brand: body.brand || "",
    price: Number(body.price) || 0,
    unit: String(body.unit || "").trim(),
    category: body.category || "uncategorized",
    images: Array.isArray(body.images) ? body.images : [],
    stock: Number(body.stock) || 0,
    isActive: body.isActive !== false,
  } as any;

  // Optional link to a farm detail page — only set when a valid value is provided
  // so the enum validator never rejects an empty selection.
  if (["Poultry", "Buffalo", "Fish", "Goat"].includes(body.farmCategory)) {
    payload.farmCategory = body.farmCategory;
  }

  // Keep ownership scoped for outlet product workflows.
  if (user?.role === "outlet-admin" && user?.outletId) {
    payload.outlet = user.outletId;
  }

  if (user?.role === "employee" && hasPermission(user, "products:write")) {
    if (!user?.outletId) {
      return NextResponse.json({ message: "Outlet context missing for employee" }, { status: 400 });
    }
    payload.outlet = user.outletId;
  }

  const product = await Product.create(payload);

  // if a category id or name was provided, keep Category.products in sync
  try {
    const Category = (await import('../../../models/Category')).default;
    let categoryDoc = null;
    // body.category may be an ObjectId string (selected from admin UI) or a plain name
    if (body.category) {
      const catIdLike = String(body.category);
      if (/^[0-9a-fA-F]{24}$/.test(catIdLike)) {
        categoryDoc = await Category.findById(catIdLike);
      } else {
        categoryDoc = await Category.findOne({ name: catIdLike });
      }
    }
    if (categoryDoc) {
      // ensure product.category is the category's name
      await Product.findByIdAndUpdate(product._id, { $set: { category: categoryDoc.name } });
      await Category.updateOne({ _id: categoryDoc._id }, { $addToSet: { products: product._id } });
    }
  } catch (err) {
    // non-fatal — category syncing is best-effort
    console.warn('category sync failed', err);
  }

  return NextResponse.json(product, { status: 201 });
}