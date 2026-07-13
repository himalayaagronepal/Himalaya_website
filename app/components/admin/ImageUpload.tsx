"use client";

import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

type ImageUploadProps = {
  images?: string[];
  onChange: (imgs: string[]) => void;
  multiple?: boolean;
  uploadEndpoint?: string;
  label?: string;
  helpText?: string;
};

/**
 * Reusable image-upload zone.
 *
 * Uses a hidden <input type="file"> triggered via a ref so that:
 *  - it works reliably inside modals / overflow-hidden containers
 *  - the same file can be re-selected after a successful upload (input value is reset)
 *  - there are no z-index or pointer-events issues from the old absolute-overlay approach
 */
export default function ImageUpload({
  images = [],
  onChange,
  multiple = true,
  uploadEndpoint = "/api/admin/upload",
  label = "Upload images",
  helpText = "PNG, JPG files supported.",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function openPicker() {
    if (uploading) return;
    // Reset the value first so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Upload failed");
        uploaded.push(json.url);
      }
      const next = multiple ? [...images, ...uploaded] : uploaded.slice(0, 1);
      onChange(next);
      toast.success(uploaded.length === 1 ? "Image uploaded" : `${uploaded.length} images uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // Reset the hidden input so the same file triggers onChange next time
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    const next = images.slice();
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input — triggered programmatically via ref */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept="image/*"
        onChange={onFiles}
        aria-label={label}
        tabIndex={-1}
      />

      {/* Drop-zone / click target */}
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-colors hover:border-cyan-300 hover:bg-cyan-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="h-8 w-8 animate-spin text-cyan-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-slate-500">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{helpText}</p>
            </div>
          </div>
        )}
      </button>

      {/* Preview thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div
              key={src + i}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} className="h-full w-full object-cover" alt={`upload-${i + 1}`} />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition-colors hover:bg-rose-100 hover:text-rose-600"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
