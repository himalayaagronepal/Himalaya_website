"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type Settings = {
  newsDummyEnabled: boolean;
  noticesDummyEnabled: boolean;
};

type ToggleKey = keyof Settings;

function Switch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-50 ${
        checked ? "bg-amber-500" : "bg-emerald-500"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function ContentToggleClient({ initialSettings }: { initialSettings: Settings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [savingKey, setSavingKey] = useState<ToggleKey | null>(null);

  async function toggle(key: ToggleKey) {
    if (savingKey) return;
    const next = !settings[key];
    setSavingKey(key);
    // Optimistic update so the switch reacts instantly.
    setSettings((prev) => ({ ...prev, [key]: next }));
    try {
      const res = await fetch("/api/admin/content-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save");
      setSettings(json.settings);
      const label = key === "newsDummyEnabled" ? "News" : "Notices";
      toast.success(next ? `${label}: showing sample data` : `${label}: showing published content`);
      router.refresh();
    } catch (err: any) {
      // Roll back on failure.
      setSettings((prev) => ({ ...prev, [key]: !next }));
      toast.error(err?.message || "Failed to save");
    } finally {
      setSavingKey(null);
    }
  }

  const rows: {
    key: ToggleKey;
    title: string;
    on: string;
    off: string;
  }[] = [
    {
      key: "newsDummyEnabled",
      title: "News dummy data",
      on: "The News column on /news-and-notices shows the built-in sample articles.",
      off: "The News column shows the articles you publish in News → Add news.",
    },
    {
      key: "noticesDummyEnabled",
      title: "Notices dummy data",
      on: "The Notices board on /news-and-notices shows the built-in sample notices.",
      off: "The Notices board shows the notices you publish in “Manage notices” below.",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-900">Public content source</h2>
        <a
          href="/news-and-notices"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
        >
          View public page →
        </a>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Turn a toggle <span className="font-semibold text-amber-600">on</span> to show the built-in sample
        (dummy) data, or <span className="font-semibold text-emerald-600">off</span> to show your own
        published content on the public News &amp; Notices page.
      </p>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
        {rows.map((row) => {
          const checked = settings[row.key];
          return (
            <div key={row.key} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{row.title}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                      checked ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {checked ? "Sample data" : "Live content"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{checked ? row.on : row.off}</p>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                {savingKey === row.key && <span className="text-[11px] text-slate-400">Saving…</span>}
                <Switch
                  checked={checked}
                  disabled={savingKey !== null}
                  onChange={() => toggle(row.key)}
                  label={`Toggle ${row.title}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
