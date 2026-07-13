import React from "react";
import connectToDatabase from "../../lib/mongodb";
import Outlet from "../../models/Outlet";
import SubHeroSection from "../components/SubHeroSection";
import OutletListClient from "../components/OutletListClient";

// This page queries MongoDB. It must not be statically prerendered at build:
// Vercel's build sandbox can't reach Atlas, so a build-time DB connect fails
// the export. force-dynamic makes it render on demand at request time instead.
export const dynamic = "force-dynamic";

export default async function OutletListPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  await connectToDatabase();
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q ? String(resolvedSearchParams.q).trim() : "";
  const filter: any = { isActive: true };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } },
    ];
  }
  const outlets = await Outlet.find(filter).sort({ name: 1 }).limit(200).lean();

  return (
    <main className="bg-white text-gray-900">
      <SubHeroSection
        title="Outlets"
        description="Find our outlets across Nepal. Filter by district or search by product availability."
        tag="Find an outlet"
        image="https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&q=80&w=2000"
        overlay="light"
      />

      <section className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Serialize server objects to plain JSON for the client component */}
        <OutletListClient initialOutlets={JSON.parse(JSON.stringify(outlets || []))} />
      </section>
    </main>
  );
}
