import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { getSessionUser, requireUser } from "../../../../lib/server-utils";
import { getEsewaStatusUrl } from "../../../../lib/esewa";

export async function POST(req: Request) {
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const pid = typeof body.pid === "string" ? body.pid : undefined;
  const productCode =
    typeof body.scd === "string"
      ? body.scd
      : process.env.ESEWA_MERCHANT_CODE || process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || "";

  if (!pid) {
    return NextResponse.json({ message: "Missing pid" }, { status: 400 });
  }
  if (!productCode) {
    return NextResponse.json({ message: "Missing eSewa product code" }, { status: 500 });
  }

  await connectToDatabase();
  const order = await Order.findById(pid).lean();
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
  if (String(order.user) !== String(user.id)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  if (order.paymentMethod !== "esewa") {
    return NextResponse.json({ message: "Order is not an eSewa payment" }, { status: 400 });
  }

  // SECURITY: verification uses the order's OWN amount (server-trusted), never a
  // client-supplied amount, and only eSewa's status API decides success. A
  // client-provided "responseData" is intentionally ignored to prevent forged
  // "COMPLETE" callbacks from marking an order paid without real payment.
  const verificationParams = new URLSearchParams({
    product_code: productCode,
    total_amount: String(order.totalAmount),
    transaction_uuid: pid,
  });

  let success = false;
  let verificationUnavailable = false;
  let apiResponseData: any = null;
  try {
    const verifyUrl = getEsewaStatusUrl();
    const sep = verifyUrl.includes("?") ? "&" : "?";
    const verifyRes = await fetch(verifyUrl + sep + verificationParams.toString(), { method: "GET" });
    const text = await verifyRes.text();
    try {
      apiResponseData = JSON.parse(text);
    } catch {
      apiResponseData = null;
    }

    success = Boolean(
      apiResponseData &&
        apiResponseData.status === "COMPLETE" &&
        String(apiResponseData.total_amount ?? "") === String(order.totalAmount)
    );

    if (!success && verifyRes.status >= 500) {
      verificationUnavailable = true;
    }
  } catch {
    verificationUnavailable = true;
  }

  // Never assume success when eSewa can't be reached — keep the order pending so it
  // can be re-verified. This is the safe failure mode for a payment flow.
  if (verificationUnavailable) {
    return NextResponse.json(
      {
        paymentStatus: "pending",
        orderStatus: order.orderStatus,
        message: "eSewa verification service is currently unavailable. Your order remains pending and will be re-checked.",
      },
      { status: 202 }
    );
  }

  const updates: any = {};
  if (success) {
    updates.paymentStatus = "paid";
    if (order.orderStatus === "pending") updates.orderStatus = "processing";
  } else {
    updates.paymentStatus = "pending";
    updates.orderStatus = order.orderStatus;
  }

  const updated = await Order.findByIdAndUpdate(pid, { $set: updates }, { new: true, runValidators: true }).lean();
  if (!updated) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    paymentStatus: updated.paymentStatus,
    orderStatus: updated.orderStatus,
    message: success
      ? "eSewa payment verified successfully."
      : "eSewa verification did not confirm payment. Order remains pending.",
  });
}
