"use client";

import React from "react";

export default function UserRow({ user }: { user: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div>
        <div className="font-medium">{user.name || "—"}</div>
        <div className="text-sm text-slate-500">{user.email}</div>
      </div>
      <div className="text-sm text-slate-500">{user.role}</div>
      <div className="flex items-center gap-4">
        <a
          className="text-sm text-sky-600"
          href={`/admin`}
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              window.location.href = `/admin`;
            }
          }}
        >
          View
        </a>

        <button
          className="text-sm rounded px-2 py-1 bg-slate-100 text-slate-800"
          onClick={(e) => {
            e.preventDefault();
            alert('User management is currently disabled');
          }}
        >
          Promote
        </button>
      </div>
    </div>
  );
}
