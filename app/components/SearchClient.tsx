"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Product = {
  _id: string;
  name: string;
  price: number;
  unit?: string;
  images?: string[];
};

export default function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = initialQuery || (searchParams?.get("q") ?? "");
  const [q, setQ] = useState<string>(initial);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // debounce + fetch suggestions
  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (!q || q.trim().length === 0) {
      setSuggestions([]);
      setResults([]);
      setOpen(false);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    const t = setTimeout(() => {
      const url = `/api/products?q=${encodeURIComponent(q)}&limit=6`;
      fetch(url, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data.items || []);
          setOpen(true);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') console.warn(err);
        })
        .finally(() => setLoading(false));

      // also fetch fuller results for the page below the suggestions
      fetch(`/api/products?q=${encodeURIComponent(q)}&limit=24`).then((r) => r.json()).then((d) => setResults(d.items || [])).catch(() => {});
    }, 220);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // keyboard navigation for suggestions
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min((suggestions.length - 1) || 0, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(-1, i - 1));
      } else if (e.key === 'Enter') {
        if (active >= 0 && suggestions[active]) {
          router.push(`/product/${suggestions[active]._id}`);
        } else if (q.trim()) {
          router.push(`/search?q=${encodeURIComponent(q)}`);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, suggestions, active, q, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
    inputRef.current?.blur();
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={onSubmit} className="relative">
        <label htmlFor="search-input" className="sr-only">Search products</label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              id="search-input"
              ref={inputRef}
              className="w-full px-4 py-3 border rounded-md bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Search products — try 'tea', 'honey' or 'organic'"
              value={q}
              onChange={(ev) => { setQ(ev.target.value); setActive(-1); }}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={open}
              autoFocus={true}
            />
          </div>
          <button
            aria-label="Search"
            className="inline-flex items-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
            type="submit"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <ul id="search-suggestions" role="listbox" className="mt-2 bg-white border rounded-md shadow-sm overflow-hidden z-40">
            {suggestions.map((p, idx) => (
              <li key={p._id} role="option" aria-selected={active === idx} className={`border-b last:border-b-0 ${active === idx ? 'bg-gray-50' : ''}`}>
                <Link href={`/product/${p._id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                    {p.images && p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-300" aria-hidden>
                        <rect x="3" y="3" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 17l4-4 4 4 4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">₹{p.price?.toFixed?.(2) ?? p.price}{p.unit ? ` • ${p.unit}` : ''}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* search results (page-level) */}
      <div className="mt-6">
        {q.trim() === '' ? (
          <div className="text-sm text-gray-500">Type something above to get product recommendations.</div>
        ) : results.length === 0 ? (
          <div className="text-sm text-gray-500">No products found for "{q}".</div>
        ) : (
          <div>
            <h3 className="text-sm text-gray-600 mb-3">Recommendations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((p) => (
                <Link key={p._id} href={`/product/${p._id}`} className="block border rounded-md overflow-hidden hover:shadow-sm bg-white">
                  <div className="w-full h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {p.images && p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-gray-300">No image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                      <div className="text-sm text-gray-600">₹{p.price?.toFixed?.(2) ?? p.price}{p.unit ? ` • ${p.unit}` : ''}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
