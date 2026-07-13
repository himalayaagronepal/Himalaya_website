// components/FilterSidebar.tsx
import Link from 'next/link';

const CATEGORIES = ["Electronics", "Clothing", "Home", "Accessories"];

export default function FilterSidebar() {
  return (
    <div className="space-y-8 sticky top-24">
      <div>
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Category</h3>
        <div className="mt-4 space-y-2">
          <Link href="/shop" className="block text-sm text-gray-600 hover:text-blue-600">All Categories</Link>
          {CATEGORIES.map(cat => (
            <Link key={cat} href={`/shop?category=${cat.toLowerCase()}`} className="block text-sm text-gray-600 hover:text-blue-600">
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Price Range</h3>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/shop?minPrice=0&maxPrice=50" className="text-sm text-gray-600 hover:text-blue-600">Under ₹50</Link>
          <Link href="/shop?minPrice=50&maxPrice=200" className="text-sm text-gray-600 hover:text-blue-600">₹50 to ₹200</Link>
          <Link href="/shop?minPrice=200" className="text-sm text-gray-600 hover:text-blue-600">Over ₹200</Link>
        </div>
      </div>
    </div>
  );
}