import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import { getSessionUser, requireUser } from "../../../../../lib/server-utils";
import { notifyOrderStatusChange } from "../../../../../lib/notifications";

export async function POST(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;
  await connectToDatabase();

  const order = await Order.findById(id).lean();
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  if (String(order.user) !== String(user.id)) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  // business rule: allow cancellation only if not shipped/delivered/cancelled
  const nonCancellable = ["shipped", "delivered", "cancelled"];
  if (nonCancellable.includes(order.orderStatus)) {
    return NextResponse.json({ message: "Order cannot be cancelled at this stage" }, { status: 400 });
  }

  const updated = await Order.findByIdAndUpdate(id, { $set: { orderStatus: "cancelled", paymentStatus: "failed" } }, { new: true }).lean();
  if (updated) {
    // notify (best-effort)
    notifyOrderStatusChange(updated).catch(() => undefined);
  }

  return NextResponse.json(updated || { message: "Unable to cancel" });
}