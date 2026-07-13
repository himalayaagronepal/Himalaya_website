import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import authOptions from "../../../../../../lib/auth";
import connectToDatabase from "../../../../../../lib/mongodb";
import User from "../../../../../../models/User";

export async function POST(req: Request, context: any) {
  const params = await Promise.resolve(context?.params) as { id?: string } | undefined;
  const distributorId = params?.id || "";
  if (!mongoose.Types.ObjectId.isValid(distributorId)) {
    return NextResponse.json({ message: "Invalid distributor id" }, { status: 400 });
  }

  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user;
  const perms = Array.isArray(user?.permissions) ? user.permissions : [];
  if (!session || user?.role !== "employee" || !perms.includes("orders:write")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount || 0);
  const note = (body.note || "").toString().trim();
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "Payment amount must be greater than zero" }, { status: 400 });
  }

  await connectToDatabase();
  const distributor = await User.findOne({ _id: distributorId, role: "distributor" });
  if (!distributor) {
    return NextResponse.json({ message: "Distributor not found" }, { status: 404 });
  }
  if (distributor.distributorStatus !== "approved") {
    return NextResponse.json({ message: "Distributor is not approved" }, { status: 400 });
  }

  const currentUsed = Number(distributor.creditUsedNpr || 0);
  const nextUsed = Math.max(0, currentUsed - amount);
  const receivedAmount = Math.min(amount, currentUsed);
  distributor.creditUsedNpr = nextUsed;
  await distributor.save();

  return NextResponse.json({
    message: receivedAmount < amount
      ? `Payment recorded. Credit used reduced to NPR ${nextUsed.toFixed(2)}.`
      : `Payment recorded. Credit used reduced by NPR ${receivedAmount.toFixed(2)}.`,
    distributor: {
      id: String(distributor._id),
      name: distributor.name,
      email: distributor.email,
      businessName: (distributor as any).businessName,
      creditLimitNpr: Number(distributor.creditLimitNpr || 0),
      creditUsedNpr: nextUsed,
      availableCreditNpr: Math.max(0, Number(distributor.creditLimitNpr || 0) - nextUsed),
    },
    payment: {
      amount: receivedAmount,
      note: note || undefined,
      recordedBy: session.user?.email || undefined,
    },
  });
}
