import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
import { getSessionUser } from "../../../../lib/server-utils";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "outlet-admin" && user.role !== "employee")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  // Employees need orders:read permission
  if (user.role === "employee") {
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    if (!permissions.includes("orders:read")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
  }

  if (!user.outletId) {
    return NextResponse.json({ message: "No outlet associated" }, { status: 400 });
  }

  await connectToDatabase();

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));

  // This outlet's product ids — used both to scope the query (DB-side, so we never
  // load other outlets' orders) and to restrict which line items are returned.
  const ownProducts = await Product.find({ outlet: user.outletId }).select("_id").lean();
  const ownProductIds = ownProducts.map((p: any) => p._id);
  const ownIds = new Set(ownProducts.map((p: any) => String(p._id)));

  // An order belongs to this outlet if it is tagged to the outlet OR it contains one
  // of the outlet's products (mirrors filterOrdersForOutlet, but enforced in Mongo).
  const scope = {
    $or: [{ outlet: user.outletId }, { "items.product": { $in: ownProductIds } }],
  };

  const [outletOrders, total] = await Promise.all([
    Order.find(scope)
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(scope),
  ]);

  // Restrict each order to THIS outlet's line items so one outlet cannot see another
  // outlet's products/prices on a shared (multi-outlet) order. The customer is kept
  // (needed to fulfil this outlet's portion); `outletItemsTotal` is this outlet's share.
  const safe = outletOrders.map((o: any) => {
    const ownItems = (o.items || []).filter((i: any) => ownIds.has(String(i.product || "")));
    const outletItemsTotal = ownItems.reduce(
      (sum: number, i: any) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );
    return {
      _id: String(o._id),
      user: o.user,
      items: ownItems,
      outletItemsTotal: Math.round(outletItemsTotal * 100) / 100,
      totalAmount: o.totalAmount,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  });

  return NextResponse.json({ items: safe, meta: { total, page, limit } });
}
