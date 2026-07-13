// components/Pagination.tsx
import Link from 'next/link';

type Props = {
  currentPage: number;
  totalPages: number;
  params?: Record<string, string | number | undefined>;
};

export default function Pagination({ currentPage, totalPages, params }: Props) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const p = Math.max(1, Math.min(page, totalPages));
    const sp = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined) continue;
        sp.set(k, String(v));
      }
    }
    sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/shop?${qs}` : '/shop';
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={hrefFor(currentPage - 1)}
        className={`px-4 py-2 border rounded-md ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}>
        Previous
      </Link>
      
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={hrefFor(currentPage + 1)}
        className={`px-4 py-2 border rounded-md ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}>
        Next
      </Link>
    </div>
  );
}