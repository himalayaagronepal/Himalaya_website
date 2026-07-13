import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../../lib/auth";
import connectToDatabase from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Order";
import Product from "../../../../../../models/Product";
import ProductLog from "../../../../../../models/ProductLog";
import Employee from "../../../../../../models/Employee";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    // Verify employee session AND the orders:write permission. Previously this only
    // checked role==="employee", so a shopkeeper (products/categories perms) could
    // mutate order status. Align with /api/orders/[id] which requires orders:write.
    const perms = Array.isArray(session?.user?.permissions) ? session.user.permissions : [];
    if (!session || session.user?.role !== "employee" || !perms.includes("orders:write")) {
      return NextResponse.json(
        { message: "Unauthorized - orders:write permission required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { newStatus } = body;

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get employee info
    const employee = await Employee.findOne({ email: session.user.email }).lean();
    if (!employee || !employee.outlet) {
      return NextResponse.json(
        { message: "Employee outlet information not found" },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to employee's outlet
    if (String(order.outlet) !== String(employee.outlet)) {
      return NextResponse.json(
        { message: "Order does not belong to your outlet" },
        { status: 403 }
      );
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus;
    await order.save();

    // If status changed to 'delivered', create ProductLog entries for each item
    if (newStatus === "delivered" && oldStatus !== "delivered") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const before = product.stock + item.quantity; // We already deducted, so add back to show before
          const after = product.stock;

          await ProductLog.create({
            product: item.product,
            outlet: employee.outlet,
            type: "sale",
            quantity: item.quantity,
            before,
            after,
            note: `Order #${String(order._id).slice(-8)} delivered`,
            actorId: String(employee._id),
            actorName: employee.name || "Staff",
          });
        }
      }
    }

    return NextResponse.json({
      message: `Order status updated to ${newStatus}`,
      order: {
        id: order._id,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 }
    );
  }
}
