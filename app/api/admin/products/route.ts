import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import { hasPermission } from "../../../../lib/permissions";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "products:read")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const user = session.user as any;
  const isOutletScopedUser = (user?.role === "employee" || user?.role === "outlet-admin");
  if (isOutletScopedUser && !user?.outletId) {
    return NextResponse.json({ message: "Outlet assignment required" }, { status: 403 });
  }

  await connectToDatabase();
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || undefined;
  const category = url.searchParams.get('category') || undefined;
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const perPage = Math.min(200, Number(url.searchParams.get('perPage') || 20));

  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (isOutletScopedUser) filter.outlet = user.outletId;

  const [items, total] = await Promise.all([
    Product.find(filter).skip((page - 1) * perPage).limit(perPage).lean(),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({ items, meta: { total, page, perPage } });
}

// (Optional) create product via admin API — delegates similar validation as public POST
export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "products:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const user = session.user as any;
  const isOutletScopedUser = (user?.role === "employee" || user?.role === "outlet-admin");
  if (isOutletScopedUser && !user?.outletId) {
    return NextResponse.json({ message: "Outlet assignment required" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();

  const payload: any = {
    name: body.name,
    description: body.description || '',
    brand: body.brand || '',
    price: Number(body.price) || 0,
    unit: String(body.unit || '').trim(),
    category: body.category || 'uncategorized',
    images: Array.isArray(body.images) ? body.images : [],
    stock: Number(body.stock) || 0,
    isActive: body.isActive !== false,
  };

  // Optional link to a farm detail page — only set for valid enum values so the
  // schema validator never rejects an empty selection.
  if (["Poultry", "Buffalo", "Fish", "Goat"].includes(body.farmCategory)) {
    payload.farmCategory = body.farmCategory;
  }

  if (isOutletScopedUser) {
    payload.outlet = user.outletId;
  } else if (typeof body.outlet === "string" && body.outlet.trim()) {
    payload.outlet = body.outlet.trim();
  }

  const product = await Product.create(payload);
  return NextResponse.json(product, { status: 201 });
}
