import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/mongodb";
import Product from "../../../../../models/Product";
import ProductLog from "../../../../../models/ProductLog";
import { getSessionUser } from "../../../../../lib/server-utils";
import { hasPermission } from "../../../../../lib/permissions";

export async function GET(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  await connectToDatabase();

  const product = await Product.findById(id).lean();
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // allow admin, users with products:read, or outlet-admin owning the product
  const allowedRead = (user && (user.role === 'admin' || hasPermission(user, 'products:read') || (user.role === 'outlet-admin' && user.outletId && product.outlet && String(product.outlet) === String(user.outletId))));
  if (!allowedRead) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const logs = await ProductLog.find({ product: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ logs });
}

export async function POST(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  const body = await req.json().catch(() => ({}));
  await connectToDatabase();

  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // allow admin or users with products:write or outlet-admin owning the product
  let allowed = user && (user.role === 'admin' || hasPermission(user, 'products:write'));
  if (!allowed && user && user.role === 'outlet-admin' && user.outletId) {
    if (product.outlet && String(product.outlet) === String(user.outletId)) allowed = true;
  }
  if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const type = String(body.type || "").trim();
  const qty = Number(body.quantity || 0);
  if (!type || !['sale', 'add', 'expiry', 'adjust'].includes(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return NextResponse.json({ message: "Invalid quantity" }, { status: 400 });
  }

  const before = Number(product.stock || 0);
  let after = before;

  if (type === 'add') {
    after = before + qty;
  } else if (type === 'sale' || type === 'expiry' || type === 'adjust') {
    // sale and expiry reduce stock; adjust may be negative or positive but we treat qty as positive and subtract
    if (qty > before) {
      return NextResponse.json({ message: "Insufficient stock" }, { status: 400 });
    }
    after = before - qty;
  }

  // update product stock
  product.stock = after;
  await product.save();

  // create log
  const log = await ProductLog.create({
    product: product._id,
    outlet: product.outlet || undefined,
    type,
    quantity: qty,
    before,
    after,
    note: body.note || undefined,
    actorId: user?.id || undefined,
    actorName: user?.name || undefined,
  });

  return NextResponse.json({ product: product.toObject(), log }, { status: 201 });
}
