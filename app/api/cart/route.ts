import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import Cart from "../../../models/Cart";
import Product from "../../../models/Product";
import { getSessionUser, requireUser } from "../../../lib/server-utils";
import { validateApprovedDistributor } from "../../../lib/distributor";

export async function GET() {
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;
  await connectToDatabase();
  // Normal customers (role "user") shop directly; distributors keep their existing
  // approval gate completely unchanged.
  if (user.role !== "user") {
    const distributorCheck = await validateApprovedDistributor(user);
    if (!distributorCheck.ok) {
      return NextResponse.json({ message: distributorCheck.message }, { status: distributorCheck.status });
    }
  }
  if (!mongoose.Types.ObjectId.isValid(user.id)) return NextResponse.json({ cart: { items: [] } });
  const cart = await Cart.findOne({ user: user.id }).populate("items.product", "name price images stock isActive").lean();
  return NextResponse.json({ cart: cart || { items: [] } });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;
  await connectToDatabase();
  // Normal customers (role "user") shop directly; distributors keep their existing
  // approval gate completely unchanged.
  if (user.role !== "user") {
    const distributorCheck = await validateApprovedDistributor(user);
    if (!distributorCheck.ok) {
      return NextResponse.json({ message: distributorCheck.message }, { status: distributorCheck.status });
    }
  }
  if (!mongoose.Types.ObjectId.isValid(user.id)) return NextResponse.json({ message: "Invalid user ID for cart" }, { status: 400 });
  const body = await req.json();
  const { productId, quantity } = body;
  if (!productId || !quantity) return NextResponse.json({ message: "productId and quantity required" }, { status: 400 });
  const qty = Number(quantity);
  if (qty < 1) return NextResponse.json({ message: "quantity must be >= 1" }, { status: 400 });

  const product = await Product.findById(productId).lean();
  if (!product || !product.isActive) return NextResponse.json({ message: "Product not available" }, { status: 404 });
  if (product.stock < qty) return NextResponse.json({ message: "Insufficient stock" }, { status: 400 });

  const cart = await Cart.findOne({ user: user.id });
  if (!cart) {
    const created = await Cart.create({ user: user.id, items: [{ product: product._id, quantity: qty }] });
    return NextResponse.json(created, { status: 201 });
  }

  const existingIndex = cart.items.findIndex((it) => it.product.toString() === productId);
  if (existingIndex > -1) {
    cart.items[existingIndex].quantity = qty;
  } else {
    cart.items.push({ product: product._id, quantity: qty });
  }
  await cart.save();
  return NextResponse.json(cart);
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  const denied = requireUser(user);
  if (denied) return denied;
  await connectToDatabase();
  // Normal customers (role "user") shop directly; distributors keep their existing
  // approval gate completely unchanged.
  if (user.role !== "user") {
    const distributorCheck = await validateApprovedDistributor(user);
    if (!distributorCheck.ok) {
      return NextResponse.json({ message: distributorCheck.message }, { status: distributorCheck.status });
    }
  }
  if (!mongoose.Types.ObjectId.isValid(user.id)) return NextResponse.json({ success: true });
  const body = await req.json().catch(() => ({}));
  const cart = await Cart.findOne({ user: user.id });
  if (!cart) return NextResponse.json({ success: true });

  if (body.productId) {
    cart.items = cart.items.filter((it) => it.product.toString() !== String(body.productId));
    await cart.save();
    return NextResponse.json(cart);
  }

  // clear cart
  await Cart.deleteOne({ user: user.id });
  return NextResponse.json({ success: true });
}