import React from "react";
import Link from "next/link";
import connectToDatabase from "../../lib/mongodb";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";
import CartClient from "../components/CartClient";

export default async function CartPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) {
    // rely on middleware too, but present a friendly message
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Please sign in</h2>
        <p className="mt-4 text-gray-600">You must be signed in to view your cart.</p>
      </div>
    );
  }

  await connectToDatabase();
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="bg-[#f8faf9] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm" aria-label="breadcrumb">
            <ol className="flex items-center gap-1.5 text-gray-500">
              <li><Link href="/" className="hover:text-[#059669] transition-colors">Home</Link></li>
              <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
              <li className="text-gray-900 font-medium">Cart</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#0891b2] uppercase tracking-widest mb-1">Shopping Bag</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Your Cart</h1>
          <p className="mt-2 text-sm text-gray-600">Review your items and proceed securely to checkout.</p>
        </div>
        <CartClient />
      </div>
    </div>
  );
}