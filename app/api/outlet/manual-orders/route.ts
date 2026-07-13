import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
import User from "../../../../models/User";
import Employee from "../../../../models/Employee";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    
    // Verify employee session AND orders:write (previously any employee, incl. a
    // shopkeeper without order permissions, could create POS orders + deduct stock).
    const perms = Array.isArray(session?.user?.permissions) ? session.user.permissions : [];
    if (!session || session.user?.role !== "employee" || !perms.includes("orders:write")) {
      return NextResponse.json(
        { message: "Unauthorized - orders:write permission required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customerName, customerPhone, items, paymentMethod = "cod" } = body;

    // Validate required fields
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { message: "Customer name and phone are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "At least one item is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get employee info to verify they belong to an outlet
    const employee = await Employee.findOne({ email: session.user.email }).lean();
    if (!employee || !employee.outlet) {
      return NextResponse.json(
        { message: "Employee outlet information not found" },
        { status: 400 }
      );
    }

    // Fetch all products for validation
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      outlet: employee.outlet,
      isActive: true,
    }).lean();

    const productMap: Record<string, any> = {};
    for (const product of products) {
      productMap[String(product._id)] = product;
    }

    // Build order items and calculate total
    let total = 0;
    const orderItems = [];
    const inventoryUpdates: { id: string; quantity: number }[] = [];

    for (const item of items) {
      const productId = String(item.productId);
      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) {
        return NextResponse.json(
          { message: `Invalid quantity for product ${productId}` },
          { status: 400 }
        );
      }

      const product = productMap[productId];
      if (!product) {
        return NextResponse.json(
          { message: `Product ${productId} not found or not available` },
          { status: 400 }
        );
      }

      // Check stock
      if (product.stock < quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        );
      }

      orderItems.push({
        product: productId,
        name: product.name,
        quantity,
        price: product.price,
        image: Array.isArray(product.images) ? String(product.images[0] || "") : "",
        brand: product.brand || "",
        category: product.category || "",
      });

      total += product.price * quantity;
      inventoryUpdates.push({ id: productId, quantity });
    }

    // Create or get user for this order (use phone as identifier for offline customers).
    // Only reuse a prior OFFLINE account (created by this POS flow). Matching any user by
    // phone could attach the order to a real distributor/admin who shares the number.
    let user = await User.findOne({ phoneNumber: customerPhone, role: "user", email: /@outlet\.local$/i }).lean();
    
    if (!user) {
      // Create a new user for offline customer
      const newUser = new User({
        email: `offline-${customerPhone}-${Date.now()}@outlet.local`,
        phoneNumber: customerPhone,
        name: customerName,
        role: "user",
        isActive: true,
      });
      user = (await newUser.save()).toObject();
    }

    // Create order
    const order = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount: Math.round(total * 100) / 100,
      outlet: employee.outlet,
      paymentMethod: paymentMethod === "card" ? "card" : "cod",
      shippingAddress: {
        name: customerName,
        phone: customerPhone,
      },
      orderStatus: "processing", // Manual orders start as processing
      paymentStatus: paymentMethod === "card" ? "pending" : "pending",
      isManualOrder: true,
      createdBy: employee._id,
      inventoryApplied: false,
    });

    // Deduct from inventory
    for (const update of inventoryUpdates) {
      await Product.findByIdAndUpdate(
        update.id,
        { $inc: { stock: -update.quantity } },
        { new: true }
      );
    }

    // Mark inventory as applied
    await Order.findByIdAndUpdate(order._id, {
      inventoryApplied: true,
      inventoryAppliedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Manual order created successfully",
        order: {
          id: order._id,
          orderNumber: String(order._id).slice(-8),
          customerName,
          customerPhone,
          totalAmount: order.totalAmount,
          items: orderItems,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Manual order creation error:", error);
    return NextResponse.json(
      { message: "Failed to create manual order" },
      { status: 500 }
    );
  }
}
