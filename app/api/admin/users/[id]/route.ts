import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import mongoose from "mongoose";

async function requireAdmin(): Promise<any> {
  // `getServerSession` can be loosely typed in this workspace — cast to `any` for runtime checks.
  const session = await getServerSession(authOptions as any) as any;
  if (!session || session.user?.role !== 'admin') return null;
  return session;
}

export async function PATCH(req: Request, context: any) {
  // Next.js' types sometimes represent `context.params` as a Promise — handle both safely.
  const params = await Promise.resolve(context?.params) as { id?: string } | undefined;
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid id' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const updates: any = {};
  if (typeof body.role === 'string') {
    updates.role = body.role === 'admin' ? 'admin' : body.role === 'distributor' ? 'distributor' : 'user';
  }
  if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;
  if (typeof body.password === 'string' && body.password.length >= 8) {
    updates.password = body.password;
  }
  if (typeof body.distributorStatus === 'string') {
    if (["none", "pending", "approved", "rejected"].includes(body.distributorStatus)) {
      updates.distributorStatus = body.distributorStatus;
    }
  }
  if (typeof body.creditLimitNpr !== 'undefined') {
    const creditLimitNpr = Number(body.creditLimitNpr);
    if (!Number.isFinite(creditLimitNpr) || creditLimitNpr < 0) {
      return NextResponse.json({ message: 'creditLimitNpr must be a non-negative number' }, { status: 400 });
    }
    updates.creditLimitNpr = creditLimitNpr;
  }
  if (typeof body.creditUsedNpr !== 'undefined') {
    const creditUsedNpr = Number(body.creditUsedNpr);
    if (!Number.isFinite(creditUsedNpr) || creditUsedNpr < 0) {
      return NextResponse.json({ message: 'creditUsedNpr must be a non-negative number' }, { status: 400 });
    }
    updates.creditUsedNpr = creditUsedNpr;
  }
  if (typeof body.businessName === 'string') {
    updates.businessName = body.businessName.trim() || undefined;
  }
  if (typeof body.phoneNumber === 'string') {
    updates.phoneNumber = body.phoneNumber.trim() || undefined;
  }

  await connectToDatabase();
  const target = await User.findById(id);
  if (!target) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  // Guard: prevent removing the last admin
  if (updates.role && updates.role !== 'admin') {
    const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: target._id } });
    if (target.role === 'admin' && otherAdmins < 1) {
      return NextResponse.json({ message: 'Cannot remove the last admin' }, { status: 400 });
    }
  }

  // Apply updates
  if (updates.role && updates.role !== 'distributor') {
    if (!Object.prototype.hasOwnProperty.call(updates, 'distributorStatus')) updates.distributorStatus = 'none';
    if (!Object.prototype.hasOwnProperty.call(updates, 'creditLimitNpr')) updates.creditLimitNpr = 0;
    if (!Object.prototype.hasOwnProperty.call(updates, 'creditUsedNpr')) updates.creditUsedNpr = 0;
  }
  if ((updates.role === 'distributor' || target.role === 'distributor') && typeof updates.creditLimitNpr === 'number') {
    const nextUsed = typeof updates.creditUsedNpr === 'number' ? updates.creditUsedNpr : Number((target as any).creditUsedNpr || 0);
    if (nextUsed > updates.creditLimitNpr) {
      return NextResponse.json({ message: 'creditUsedNpr cannot exceed creditLimitNpr' }, { status: 400 });
    }
  }
  Object.assign(target, updates);
  await target.save();

  const safe = {
    _id: target._id,
    name: target.name,
    email: target.email,
    role: target.role,
    distributorStatus: (target as any).distributorStatus,
    businessName: (target as any).businessName,
    phoneNumber: (target as any).phoneNumber,
    creditLimitNpr: Number((target as any).creditLimitNpr || 0),
    creditUsedNpr: Number((target as any).creditUsedNpr || 0),
    isActive: target.isActive,
  };
  return NextResponse.json({ user: safe, message: 'Updated' });
}

export async function DELETE(req: Request, context: any) {
  const params = await Promise.resolve(context?.params) as { id?: string } | undefined;
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid id' }, { status: 400 });

  await connectToDatabase();
  const target = await User.findById(id);
  if (!target) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  // Prevent deleting the last admin
  if (target.role === 'admin') {
    const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: target._id } });
    if (otherAdmins < 1) return NextResponse.json({ message: 'Cannot delete the last admin' }, { status: 400 });
  }

  await target.deleteOne();
  return NextResponse.json({ message: 'Deleted' });
}
