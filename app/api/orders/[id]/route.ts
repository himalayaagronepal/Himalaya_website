import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
import ProductLog from "../../../../models/ProductLog";
import User from "../../../../models/User";
import { getSessionUser, requireAdmin, requireUser } from "../../../../lib/server-utils";
import { orderBelongsToOutlet } from "../../../../lib/order-access";
import { hasPermission } from "../../../../lib/permissions";

const ALLOWED_ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const ALLOWED_PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

export async function GET(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  await connectToDatabase();
  const order = await Order.findById(id).populate("user", "email name").lean();
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  // admin can view any order; outlet-admins can view orders containing their products; employees with orders:read can view their outlet orders; users can view only their own
  if (user?.role === "admin") return NextResponse.json(order);
  if (user?.role === "outlet-admin" && user.outletId) {
    const allowed = await orderBelongsToOutlet(order, String(user.outletId));
    if (allowed) return NextResponse.json(order);
  }
  if (user?.role === "employee" && user.outletId) {
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    if (permissions.includes("orders:read")) {
      const allowed = await orderBelongsToOutlet(order, String(user.outletId));
      if (allowed) return NextResponse.json(order);
    }
  }
  const denied = requireUser(user);
  if (denied) return denied;
  if (String(order.user?._id || order.user) !== String(user.id)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  return NextResponse.json(order);
}

export async function PATCH(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  if (
    !user ||
    (user.role !== "admin" &&
      user.role !== "outlet-admin" &&
      user.role !== "employee" &&
      user.role !== "admin-employee")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  // Outlet "employee" accounts and "admin-employee" accounts both need an
  // explicit orders:write grant (hasPermission bridges the colon-style and
  // plain-section permission shapes between the two account types).
  if ((user.role === "employee" || user.role === "admin-employee") && !hasPermission(user, "orders:write")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: any = {};

  if (Object.prototype.hasOwnProperty.call(body, "orderStatus")) {
    if (!ALLOWED_ORDER_STATUSES.includes(body.orderStatus)) {
      return NextResponse.json({ message: "Invalid orderStatus" }, { status: 400 });
    }
    updates.orderStatus = body.orderStatus;
  }
  if (Object.prototype.hasOwnProperty.call(body, "paymentStatus")) {
    if (!ALLOWED_PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return NextResponse.json({ message: "Invalid paymentStatus" }, { status: 400 });
    }
    updates.paymentStatus = body.paymentStatus;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await Order.findById(id).lean();
  if (!existing) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  if (user.role === "outlet-admin" && user.outletId) {
    const allowed = await orderBelongsToOutlet(existing, String(user.outletId));
    if (!allowed) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    if (Object.prototype.hasOwnProperty.call(updates, "paymentStatus")) {
      delete updates.paymentStatus;
    }
  }

  if (user.role === "employee" && user.outletId) {
    const allowed = await orderBelongsToOutlet(existing, String(user.outletId));
    if (!allowed) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    if (Object.prototype.hasOwnProperty.call(updates, "paymentStatus")) {
      delete updates.paymentStatus;
    }
  }

  if (user.role !== "admin" && !Object.prototype.hasOwnProperty.call(updates, "orderStatus")) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  const shouldApplyInventory = updates.orderStatus === "delivered" && existing.orderStatus !== "delivered" && !existing.inventoryApplied;

  if (shouldApplyInventory) {
    const opsDone: Array<{ id: string; qty: number }> = [];
    try {
      for (const item of existing.items || []) {
        const productId = String(item.product);
        const quantity = Number(item.quantity) || 0;
        const product = await Product.findById(productId).lean();
        if (!product) {
          throw new Error(`Product not found for order item ${productId}`);
        }
        if (Number(product.stock || 0) < quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true }
        ).lean();
        if (!updatedProduct) {
          throw new Error(`Unable to apply stock for ${product.name}`);
        }

        opsDone.push({ id: productId, qty: quantity });

        await ProductLog.create({
          product: product._id,
          outlet: product.outlet || undefined,
          type: "sale",
          quantity,
          before: Number(product.stock || 0),
          after: Number(product.stock || 0) - quantity,
          note: `Sold ${quantity} ${product.unit || "units"}`,
          actorId: user?.id || undefined,
          actorName: user?.name || undefined,
        });
      }

      updates.inventoryApplied = true;
      updates.inventoryAppliedAt = new Date();
    } catch (err: any) {
      if (opsDone.length) {
        await Promise.all(opsDone.map((o) => Product.findByIdAndUpdate(o.id, { $inc: { stock: o.qty } }))); 
      }
      return NextResponse.json({ message: err.message || "Unable to deliver order" }, { status: 400 });
    }
  }

  const updated = await Order.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();
  if (!updated) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  if (
    updates.orderStatus === "delivered" &&
    existing.orderStatus !== "delivered" &&
    existing.distributorCreditApplied &&
    Number(existing.distributorCreditAmount || 0) > 0
  ) {
    await User.findByIdAndUpdate(existing.user, {
      $inc: { creditUsedNpr: Number(existing.distributorCreditAmount || 0) },
    });
  }

  // emit webhook / email notification for order status changes (best-effort)
  try {
    const { notifyOrderStatusChange } = await import("../../../../lib/notifications");
    notifyOrderStatusChange(updated).catch(() => undefined);
  } catch (err) {
    console.warn("notifications helper unavailable", err);
  }

  return NextResponse.json(updated);
}