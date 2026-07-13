"use client";

import React, { useState } from "react";

interface OutletOrderActionsClientProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate?: () => void;
}

export default function OutletOrderActionsClient({
  orderId,
  currentStatus,
  onStatusUpdate,
}: OutletOrderActionsClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const availableStatuses = statuses.filter((s) => s !== currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/outlet/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update order status");
        setLoading(false);
        return;
      }

      setSuccess(`Order status updated to ${newStatus}`);
      setShowDropdown(false);
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  function statusColor(s: string) {
    if (s === "delivered") return "bg-emerald-50 text-emerald-700";
    if (s === "processing") return "bg-amber-50 text-amber-700";
    if (s === "shipped") return "bg-sky-50 text-sky-700";
    if (s === "cancelled") return "bg-red-50 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded text-red-700 text-sm p-2">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-sm p-2">
          {success}
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading}
          className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-colors ${statusColor(
            currentStatus
          )} hover:opacity-80 disabled:opacity-50`}
        >
          {currentStatus === "processing"
            ? "Processing"
            : currentStatus === "shipped"
            ? "Shipped"
            : currentStatus === "delivered"
            ? "Delivered"
            : currentStatus === "cancelled"
            ? "Cancelled"
            : "Pending"}
          <span className="ml-1">▼</span>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loading}
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors disabled:opacity-50 ${statusColor(
                  status
                )} text-sm font-medium`}
              >
                {status === "processing"
                  ? "Mark as Processing"
                  : status === "shipped"
                  ? "Mark as Shipped"
                  : status === "delivered"
                  ? "Mark as Delivered"
                  : status === "cancelled"
                  ? "Cancel Order"
                  : "Mark as Pending"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
