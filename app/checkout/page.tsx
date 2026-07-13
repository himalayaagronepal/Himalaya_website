import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";
import CheckoutClient from "../components/CheckoutClient";

export default async function CheckoutPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign In Required</h1>
            <p className="text-slate-600">Please sign in to your account to proceed with checkout.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/login?from=/checkout" className="px-6 py-3 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors">
              Sign In
            </Link>
            <Link href="/" className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const role = session?.user?.role;
  const distributorStatus = session?.user?.distributorStatus;

  // Normal customers (role "user") may check out directly; approved distributors keep
  // their existing access. Everyone else is sent to the outlet / distributor flow.
  const isCustomer = role === "user";
  const isApprovedDistributor = role === "distributor" && distributorStatus === "approved";

  if (!isCustomer && !isApprovedDistributor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-3xl p-4 sm:p-8 lg:p-12">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 sm:p-8 lg:p-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-200">
                  <span className="text-xl">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-2">
                  Online ordering is only for approved distributors
                </h1>
                <p className="text-amber-800 mb-6">
                  If you are a normal customer, please visit your nearest outlet and buy directly. Alternatively, you can apply to become a distributor.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href="/outlet" 
                    className="inline-flex rounded-lg bg-amber-700 hover:bg-amber-800 px-6 py-3 text-sm font-semibold text-white transition-colors"
                  >
                    🏪 Visit Outlet
                  </Link>
                  <Link 
                    href="/register/distributor" 
                    className="inline-flex rounded-lg border-2 border-amber-300 bg-amber-100 hover:bg-amber-200 px-6 py-3 text-sm font-semibold text-amber-900 transition-colors"
                  >
                    📝 Become a Distributor
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <nav className="text-xs sm:text-sm" aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-slate-600">
              <li>
                <Link href="/" className="hover:text-[#0891b2] transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li className="text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#0891b2] transition-colors font-medium">
                  Cart
                </Link>
              </li>
              <li className="text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-slate-900 font-bold">Checkout</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl pt-6 sm:pt-8 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0891b2]/10 text-[#0891b2] text-xs font-semibold mb-3 sm:mb-4 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#0891b2]" />
            Secure Checkout
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-3">Complete Your Order</h1>
          <p className="text-base sm:text-lg text-slate-600">Review your items, enter shipping details, and choose your payment method.</p>
        </div>

        {/* Checkout Form */}
        <div className="mt-8">
          <CheckoutClient />
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-slate-600 font-medium">SSL Encrypted</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-xs text-slate-600 font-medium">Secure Payments</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📞</div>
            <p className="text-xs text-slate-600 font-medium">24/7 Support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">↩️</div>
            <p className="text-xs text-slate-600 font-medium">Easy Returns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
