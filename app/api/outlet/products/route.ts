import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import Employee from "../../../../models/Employee";

export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;

    // Verify employee session
    if (!session || session.user?.role !== "employee") {
      return NextResponse.json(
        { message: "Unauthorized - employee access required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get employee info to get outlet
    const employee = await Employee.findOne({ email: session.user.email }).lean();
    if (!employee || !employee.outlet) {
      return NextResponse.json(
        { message: "Employee outlet information not found" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(100, Number(url.searchParams.get("limit") || 50));

    // Build query
    const query: any = {
      outlet: employee.outlet,
      isActive: true,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select("name brand category price stock images")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}
