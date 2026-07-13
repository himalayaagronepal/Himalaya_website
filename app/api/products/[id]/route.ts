import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectToDatabase from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import { getSessionUser } from "../../../../lib/server-utils";
import { hasPermission } from "../../../../lib/permissions";

export async function GET(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  await connectToDatabase();
  const product = await Product.findById(id).lean();
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  const body = await req.json();
  await connectToDatabase();

  const existing = await Product.findById(id).lean();
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // allow if user has global products write permission
  let allowed = hasPermission(user, "products:write");
  // allow outlet-admins to manage products that belong to their outlet
  if (!allowed && user && user.role === 'outlet-admin' && user.outletId) {
    if (existing.outlet && String(existing.outlet) === String(user.outletId)) {
      allowed = true;
    }
  }

  // shopkeepers can only manage products belonging to their outlet
  if (allowed && user && user.role === "employee" && user.outletId) {
    const belongsToOutlet = existing.outlet && String(existing.outlet) === String(user.outletId || "");
    if (!belongsToOutlet) {
      allowed = false;
    }
  }

  if (!allowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Build the update using explicit MongoDB operators ($set / $unset).
  // Mongoose 9 does NOT automatically wrap plain objects in $set for
  // findByIdAndUpdate, so passing { farmCategory: "Buffalo" } without an
  // operator can silently replace (or fail to update) the document.
  // Explicit operators make the intent unambiguous across all Mongoose versions.
  const VALID_FARM = ["Poultry", "Buffalo", "Fish", "Goat"] as const;
  const mongoUpdate: Record<string, any> = {};

  if ("farmCategory" in body) {
    const { farmCategory, ...rest } = body;
    if (VALID_FARM.includes(farmCategory)) {
      // Assign to a farm + update any other fields in the same request
      mongoUpdate.$set = { farmCategory, ...rest };
    } else {
      // Remove farm assignment; still update any co-sent fields
      mongoUpdate.$unset = { farmCategory: "" };
      if (Object.keys(rest).length > 0) mongoUpdate.$set = rest;
    }
  } else {
    // No farmCategory key — standard partial update
    mongoUpdate.$set = body;
  }

  const updated = await Product.findByIdAndUpdate(id, mongoUpdate, {
    new: true,
    runValidators: true,
  }).lean();
  if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // Invalidate ISR cache on all farm pages so newly-tagged (or hidden) products
  // surface immediately rather than waiting for the 60-second revalidation window.
  // farmCategory changes which farm a product belongs to; isActive changes whether
  // it is shown at all — both affect the "Products From This Farm" listing.
  if ("farmCategory" in body || "isActive" in body) {
    for (const path of ["/farms/poultry", "/farms/buffalo", "/farms/fish", "/farms/goat"]) {
      revalidatePath(path);
    }
  }

  // Sync category membership ONLY when the category is part of this update.
  // Partial updates such as farm assignment ({ farmCategory }) or status toggles
  // ({ isActive }) must not touch category membership — otherwise tagging a farm
  // would silently pull the product out of its category listing.
  if ("category" in body) {
    try {
      const Category = (await import('../../../../models/Category')).default;
      const oldCatName = existing.category;
      const newCategory = body.category;

      // resolve new category doc (id or name)
      let newCatDoc = null;
      if (newCategory) {
        const asStr = String(newCategory);
        if (/^[0-9a-fA-F]{24}$/.test(asStr)) newCatDoc = await Category.findById(asStr);
        else newCatDoc = await Category.findOne({ name: asStr });
      }

      if (oldCatName && (!newCatDoc || newCatDoc.name !== oldCatName)) {
        // remove from old category.products
        await Category.updateOne({ name: oldCatName }, { $pull: { products: updated._id } });
      }
      if (newCatDoc) {
        // ensure product.category is the category's name and add to products array
        await Product.findByIdAndUpdate(updated._id, { $set: { category: newCatDoc.name } });
        await Category.updateOne({ _id: newCatDoc._id }, { $addToSet: { products: updated._id } });
      }
    } catch (err) {
      console.warn('category sync failed', err);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: any) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;
  const user = await getSessionUser();
  await connectToDatabase();

  const existing = await Product.findById(id).lean();
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // allow if user has global products write permission
  let allowed = hasPermission(user, "products:write");
  // allow outlet-admins to delete products that belong to their outlet
  if (!allowed && user && user.role === 'outlet-admin' && user.outletId) {
    if (existing.outlet && String(existing.outlet) === String(user.outletId)) {
      allowed = true;
    }
  }

  // shopkeepers can only delete products belonging to their outlet
  if (allowed && user && user.role === "employee" && user.outletId) {
    const belongsToOutlet = existing.outlet && String(existing.outlet) === String(user.outletId || "");
    if (!belongsToOutlet) {
      allowed = false;
    }
  }

  if (!allowed) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const deleted = await Product.findByIdAndDelete(id).lean();
  if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // remove product from any category lists
  try {
    const Category = (await import('../../../../models/Category')).default;
    await Category.updateMany({ products: deleted._id }, { $pull: { products: deleted._id } });
  } catch (err) {
    console.warn('failed to remove product from categories', err);
  }

  return NextResponse.json({ success: true });
}