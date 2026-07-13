import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import authOptions from "../../../lib/auth";
import DistributorSignupForm from "../../components/DistributorSignupForm";

export default async function DistributorRegisterPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (session) {
    if (session?.user?.role === "distributor") return redirect("/");
    if (session?.user?.role === "admin") return redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 pt-32 sm:pt-36 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
        <div className="rounded-[2rem] bg-slate-900 p-8 sm:p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden h-full flex flex-col">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Distributor application</p>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black leading-tight">Buy online with approved distributor credit.</h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-300 leading-7">
            Normal customers cannot register for online buying. Apply as a distributor, wait for super admin approval,
            and then purchase products up to your assigned credit limit in NPR.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Super admin approves your account</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Credit limit is assigned in NPR</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Each order consumes credit</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Accountant can record repayments</div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/outlet" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">Visit outlet</a>
            <a href="/login" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Sign in</a>
          </div>
        </div>

        <DistributorSignupForm />
      </div>
    </div>
  );
}
