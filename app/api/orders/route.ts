import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import Cart from "../../../models/Cart";
import { getSessionUser, requireUser, requireAdmin } from "../../../lib/server-utils";
import User from "../../../models/User";
import { validateApprovedDistributor, availableDistributorCredit } from "../../../lib/distributor";

export async function GET(req: Request) {
  const user = await getSessionUser();
  await connectToDatabase();

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Number(url.searchParams.get("limit") || 20));

  if (user?.role === "admin") {
    const [items, total] = await Promise.all([
      Order.find({}).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments({}),
    ]);
    return NextResponse.json({ items, meta: { total, page, limit } });
  }

  const denied = requireUser(user);
  if (denied) return denied;
  if (!mongoose.Types.ObjectId.isValid(user.id)) {
    return NextResponse.json({ items: [], meta: { total: 0, page, limit } });
  }
  const [items, total] = await Promise.all([
    Order.find({ user: user.id }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments({ user: user.id }),
  ]);
  return NextResponse.json({ items, meta: { total, page, limit } });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;
  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];
  const checkoutMode = body.checkoutMode === 'buyNow' ? 'buyNow' : 'cart';
  if (!items.length) return NextResponse.json({ message: "No items" }, { status: 400 });

  await connectToDatabase();
  // Normal customers (role "user") buy directly; distributors keep their existing
  // approval gate completely unchanged.
  if (user.role !== "user") {
    const distributorCheck = await validateApprovedDistributor(user);
    if (!distributorCheck.ok) {
      return NextResponse.json({ message: distributorCheck.message }, { status: distributorCheck.status });
    }
  }

  const products = await Product.find({ _id: { $in: items.map((item: any) => item.productId) } }).lean();
  const productMap: Record<string, any> = {};
  for (const product of products) productMap[String(product._id)] = product;

  try {
    let total = 0;
    const orderItems = [];
    for (const it of items) {
      const pid = String(it.productId);
      const qty = Number(it.quantity) || 0;
      const prod = productMap[pid];
      if (!prod || !prod.isActive) throw new Error(`Product ${pid} not available`);
      if (!Number.isInteger(qty) || qty < 1) throw new Error(`Invalid quantity for ${prod.name}`);
      if (Number(prod.stock || 0) < qty) throw new Error(`Insufficient stock for ${prod.name}`);

      orderItems.push({
        product: pid,
        name: prod.name,
        quantity: qty,
        price: prod.price,
        image: Array.isArray(prod.images) ? String(prod.images[0] || "") : "",
        brand: prod.brand || "",
        category: prod.category || "",
      });
      total += prod.price * qty;
    }
    const totalRounded = Math.round(total * 100) / 100;

    // Normal customers can ONLY pay via eSewa (no credit, no COD). Distributors keep
    // the full set (COD/credit/eSewa) exactly as before.
    const paymentMethod = user.role === 'user'
      ? 'esewa'
      : body.paymentMethod === 'esewa' ? 'esewa' : body.paymentMethod === 'credit' ? 'credit' : 'cod';
    const shipping = body.shippingAddress && typeof body.shippingAddress === 'object' ? body.shippingAddress : undefined;

    // basic validation for COD and eSewa: require name and line1 and phone
    if (paymentMethod === 'cod' || paymentMethod === 'esewa') {
      if (!shipping || !shipping.name || !shipping.line1 || !shipping.phone) {
        throw new Error('Shipping name, address line1 and phone are required for this payment method');
      }
    }

    // determine a proper user _id for the order (session user may be a minimal object)
    let userIdForOrder: any = user.id;
    if (!/^[0-9a-fA-F]{24}$/.test(String(userIdForOrder || ""))) {
      // try to resolve by email to a real user _id
      const found = await User.findOne({ email: user.email }).lean();
      if (found && found._id) userIdForOrder = found._id;
      else throw new Error('Unable to resolve user for order');
    }

    const distributor = await User.findById(userIdForOrder).lean();
    if (!distributor) throw new Error('Unable to resolve distributor for order');

    if (paymentMethod === 'credit') {
      const available = availableDistributorCredit(distributor);
      if (available < totalRounded) {
        throw new Error(
          `Credit limit exceeded. Available credit: NPR ${available.toFixed(2)}. Please reduce outstanding credit before placing this order.`
        );
      }
    }

    const orderData: any = {
      user: userIdForOrder,
      items: orderItems,
      totalAmount: totalRounded,
      outlet: (() => {
        const outletIds = Array.from(new Set(products.map((product: any) => String(product.outlet || "")).filter(Boolean)));
        return outletIds.length === 1 ? outletIds[0] : undefined;
      })(),
      paymentMethod,
      shippingAddress: shipping,
      paymentStatus: "pending",
      orderStatus: "pending",
      inventoryApplied: false,
    };

    if (paymentMethod === 'credit') {
      orderData.distributorCreditApplied = true;
      orderData.distributorCreditAmount = totalRounded;
    }

    const order = await Order.create(orderData);

    if (checkoutMode !== 'buyNow') {
      await Cart.deleteOne({ user: userIdForOrder });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Order failed" }, { status: 400 });
  }
}
