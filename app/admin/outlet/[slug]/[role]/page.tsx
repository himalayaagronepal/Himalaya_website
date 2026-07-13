import React from "react";
import { redirect } from "next/navigation";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "./_utils";

export default async function OutletEmployeeLandingPage({ params }: { params: { slug: string; role: string } } | { params: Promise<{ slug: string; role: string }> }) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;
  const basePath = outletEmployeeBasePath(slug, role);

  const cards = role === "accountant"
    ? [
        { href: `${basePath}/order`, title: "Order management", desc: "Review, filter, and update outlet orders." },
        { href: `${basePath}/revenue/payment`, title: "Receive payment", desc: "Reduce distributor credit after payment is received." },
      ]
    : [
        { href: `${basePath}/product`, title: "Product management", desc: "Create, update, and log products for this outlet." },
        { href: `${basePath}/categories`, title: "Categories", desc: "Manage the outlet category catalog." },
      ];

  return (
    <main className="pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">Outlet workspace</p>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{outlet.name}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Signed in as {role}. Choose the area you need to manage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 group-hover:text-cyan-700 transition-colors">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{card.desc}</p>
                </div>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">Open</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
