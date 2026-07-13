import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import { getSessionUser } from "../../../lib/server-utils";
import User from "../../../models/User";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  await connectToDatabase();

  if (sessionUser.id && mongoose.Types.ObjectId.isValid(String(sessionUser.id))) {
    const user = await User.findById(String(sessionUser.id)).lean();
    if (user) {
      return NextResponse.json({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        distributorStatus: user.distributorStatus || "none",
        creditLimitNpr: Number(user.creditLimitNpr || 0),
        creditUsedNpr: Number(user.creditUsedNpr || 0),
      });
    }
  }

  return NextResponse.json({
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    role: sessionUser.role,
    distributorStatus: sessionUser.distributorStatus || "none",
    creditLimitNpr: Number(sessionUser.creditLimitNpr || 0),
    creditUsedNpr: Number(sessionUser.creditUsedNpr || 0),
  });
}
