import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { getSessionUser, requireUser } from "../../../../lib/server-utils";
import { createEsewaSignature, getEsewaFormUrl, getEsewaMerchantCode, getEsewaSecretKey } from "../../../../lib/esewa";

export async function POST(req: Request) {
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const orderId = typeof body.orderId === "string" ? body.orderId : undefined;
  if (!orderId) {
    return NextResponse.json({ message: "orderId is required" }, { status: 400 });
  }

  await connectToDatabase();
  const order = await Order.findById(orderId).lean();
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  if (String(order.user) !== String(user.id)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  if (order.paymentMethod !== "esewa") {
    return NextResponse.json({ message: "Order is not an eSewa payment" }, { status: 400 });
  }

  const merchantCode = getEsewaMerchantCode();
  const secretKey = getEsewaSecretKey();
  const endpoint = getEsewaFormUrl();

  if (!merchantCode) {
    return NextResponse.json({ message: "eSewa merchant code is not configured" }, { status: 500 });
  }
  if (!secretKey) {
    return NextResponse.json({ message: "eSewa secret key is not configured" }, { status: 500 });
  }

  const totalAmount = Number(order.totalAmount || 0).toFixed(2);
  const transactionUuid = String(order._id);
  const productCode = merchantCode;
  const { signature, signedFieldNames } = createEsewaSignature(totalAmount, transactionUuid, productCode, secretKey);

  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  return NextResponse.json({
    endpoint,
    fields: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${origin}/esewa/return?status=success`,
      failure_url: `${origin}/esewa/return?status=failure`,
      signed_field_names: signedFieldNames,
      signature,
    },
  });
}
