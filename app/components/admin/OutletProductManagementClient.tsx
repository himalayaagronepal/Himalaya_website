"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  unit?: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface OutletProductManagementClientProps {
  initialProducts: Product[];
  categories: Category[];
  outletSlug: string;
  basePath?: string;
}

export default function OutletProductManagementClient({
  initialProducts,
  categories,
  outletSlug,
  basePath,
}: OutletProductManagementClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const resolvedBasePath = basePath || `/admin/outlet-${outletSlug}/products`;

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category._id, category.name]));
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      outOfStock: products.filter((p) => p.stock <= 0).length,
    }),
    [products]
  );

  async function removeProduct(productId: string) {
    if (!confirm("Delete this product? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete product");

      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product");
    }
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Products</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or brand..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">{products.length === 0 ? "No products found." : "No products match your filters."}</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    {product.isActive ? (
                      <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {product.brand && <p className="text-sm text-slate-600 mt-1">Brand: {product.brand}</p>}
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>Category: {categoryNameById.get(product.category) || product.category || '—'}</span>
                    <span>Price: Rs. {product.price.toFixed(2)}</span>
                    <span>Stock: {product.stock} {product.unit || "units"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`${resolvedBasePath}/${product._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-sm font-medium transition-colors"
                  >
                    View
                  </Link>
                  <a
                    href={`${resolvedBasePath}/${product._id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => removeProduct(product._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
