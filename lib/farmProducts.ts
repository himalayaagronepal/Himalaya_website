import connectToDatabase from "./mongodb";
import Product, { type FarmCategory } from "../models/Product";
import { serializeMany } from "./serialize";

/**
 * Fetches active products linked to a given farm (via the `farmCategory` field)
 * for the "Products From This Farm" section of the Explore Our Farms pages.
 *
 * Returns plain, serialisable objects safe to pass from a Server Component into
 * the client `ProductCard`. On any DB error it resolves to an empty array so the
 * page still renders its empty state rather than crashing.
 */
export async function getFarmProducts(farmCategory: FarmCategory, limit = 8): Promise<any[]> {
  try {
    await connectToDatabase();
    const items = await Product.find({ isActive: true, farmCategory })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return serializeMany(items as any[]);
  } catch {
    return [];
  }
}

export default getFarmProducts;
