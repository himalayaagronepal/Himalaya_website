import React from "react";

export default function ShopLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] py-12">
      <div className="w-12 h-12 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-lg font-medium">Loading...</p>
    </div>
  );
}
