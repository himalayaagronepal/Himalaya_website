import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";
import Product from "../../../../models/Product";
import Order from "../../../../models/Order";
import { serialize } from "../../../../lib/serialize";
import { AlertCircle, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default async function OutletAdminRolePage({
  params,
}: {
  params: { slug: string; role: string } | Promise<{ slug: string; role: string }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, role } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "outlet-admin") {
    return redirect("/login");
  }

  // Verify the outlet slug matches the session
  if (session.user?.outletSlug !== slug) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) {
    return notFound();
  }

  // Determine what to display based on role
  let roleTitle = "Manager";
  let roleDescription = "Manage outlet operations";
  let roleContent = null;

  if (role === "manager") {
    roleTitle = "Manager";
    roleDescription = "Overview and management of outlet operations";

    // Get outlet stats
    const [totalProducts, activeProducts, outOfStock, totalOrders, pendingOrders] = await Promise.all([
      Product.countDocuments({ outlet: outlet._id }),
      Product.countDocuments({ outlet: outlet._id, isActive: true }),
      Product.countDocuments({ outlet: outlet._id, stock: { $lte: 0 } }),
      Order.countDocuments({ outlet: outlet._id }),
      Order.countDocuments({ outlet: outlet._id, orderStatus: "pending" }),
    ]);

    roleContent = (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Products</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalProducts}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{activeProducts}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{outOfStock}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{pendingOrders}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={`/admin/${slug}/products`}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-[#0891b2] hover:bg-[#0891b2]/5 transition-all group"
            >
              <Package className="w-8 h-8 text-[#0891b2] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900">Manage Products</h3>
              <p className="text-sm text-slate-600 mt-1">Add, edit, or remove products</p>
            </Link>

            <Link
              href={`/admin/${slug}/orders`}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-[#0891b2] hover:bg-[#0891b2]/5 transition-all group"
            >
              <ShoppingCart className="w-8 h-8 text-[#0891b2] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900">View Orders</h3>
              <p className="text-sm text-slate-600 mt-1">Track and manage orders</p>
            </Link>

            <Link
              href={`/admin/${slug}/outlet-info`}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-[#0891b2] hover:bg-[#0891b2]/5 transition-all group"
            >
              <Users className="w-8 h-8 text-[#0891b2] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900">Outlet Settings</h3>
              <p className="text-sm text-slate-600 mt-1">Edit outlet information</p>
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (role === "sales") {
    roleTitle = "Sales Representative";
    roleDescription = "Track sales performance and customer orders";

    const recentOrders = await Order.find({ outlet: outlet._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean();

    roleContent = (
      <div className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Orders</h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{String(order._id).slice(-8)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{(order.user as any)?.name || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.orderStatus === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-900">NPR {order.totalAmount?.toFixed(2) || "0.00"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No recent orders</p>
          )}
        </div>
      </div>
    );
  } else if (role === "accountant") {
    roleTitle = "Accountant";
    roleDescription = "View financial reports and payment details";

    const totalRevenue = await Order.aggregate([
      { $match: { outlet: outlet._id, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    roleContent = (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-600 rounded-xl p-8 text-white">
          <p className="text-sm font-medium opacity-90">Total Revenue</p>
          <p className="text-4xl font-bold mt-2">NPR {totalRevenue[0]?.total?.toFixed(2) || "0.00"}</p>
          <p className="text-sm opacity-75 mt-2">From completed orders</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-500 uppercase">Paid Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {totalRevenue[0]?.total ? "✓" : "0"}
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-500 uppercase">Contact Finance</p>
              <p className="text-sm text-slate-600 mt-2">For detailed financial reports</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/outlet-${slug}`}
            className="inline-flex items-center text-[#0891b2] hover:text-[#0b78be] text-sm font-medium mb-4 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{roleTitle}</h1>
            <p className="text-slate-600 mt-2">{roleDescription}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-[#0891b2]/10 text-[#0891b2] text-xs font-semibold rounded-full">
              {outlet.name}
            </div>
          </div>
        </div>

        {/* Content */}
        {roleContent || (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Role Not Found</h2>
            <p className="text-slate-600 mt-2">The role "{role}" is not recognized.</p>
            <Link
              href={`/admin/outlet-${slug}`}
              className="inline-flex mt-4 px-6 py-2 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
