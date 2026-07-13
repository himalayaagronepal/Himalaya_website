import SearchClient from "../components/SearchClient";
import ForceBodyClassClient from "../components/ForceBodyClassClient";

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const sp = (searchParams && typeof (searchParams as any)?.then === "function") ? await searchParams : (searchParams || {});
  const q = (sp as any).q || "";

  return (
    <div>
      {/* force the document root to use the white page theme so the entire viewport (behind navbar, etc.) is white */}
      <ForceBodyClassClient className="page-white-theme" />

      <div className="page-white-theme">
        <div className="max-w-[1650px] mx-auto px-4 pt-28 pb-10 min-h-[calc(100vh-6rem)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-black">Search products</h1>
            <p className="text-sm text-gray-600 mt-1">Find products across the catalog — recommendations appear as you type.</p>
          </div>

          <SearchClient initialQuery={q} />
        </div>
      </div>
    </div>
  );
}
