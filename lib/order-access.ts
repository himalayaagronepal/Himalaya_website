import Product from "../models/Product";

export async function orderBelongsToOutlet(order: any, outletId: string) {
  if (!order || !outletId) return false;
  if (order.outlet && String(order.outlet) === String(outletId)) return true;

  const itemProductIds = (order.items || [])
    .map((item: any) => String(item.product || ""))
    .filter(Boolean);

  if (itemProductIds.length === 0) return false;

  const matchingProducts = await Product.find({
    _id: { $in: itemProductIds },
    outlet: outletId,
  })
    .select("_id")
    .lean();

  return matchingProducts.length > 0;
}

export async function filterOrdersForOutlet(orders: any[], outletId: string) {
  if (!Array.isArray(orders) || !outletId) return [];

  const orderMap = new Map<string, any>();
  const itemProductIds = new Set<string>();

  for (const order of orders) {
    orderMap.set(String(order._id), order);
    for (const item of order.items || []) {
      const productId = String(item.product || "");
      if (productId) itemProductIds.add(productId);
    }
  }

  const matchingProducts = await Product.find({
    _id: { $in: Array.from(itemProductIds) },
    outlet: outletId,
  })
    .select("_id")
    .lean();

  const matchingProductIds = new Set(matchingProducts.map((product: any) => String(product._id)));

  return orders.filter((order) => {
    if (order.outlet && String(order.outlet) === String(outletId)) return true;
    return (order.items || []).some((item: any) => matchingProductIds.has(String(item.product || "")));
  });
}
