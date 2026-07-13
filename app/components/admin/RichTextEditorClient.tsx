"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function RichTextEditorClient({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "ecom_news");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      exec("insertImage", json.url);
      toast.success("Image inserted");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-slate-50 px-3 py-2 text-sm">
        <button type="button" className="px-2 py-1 rounded hover:bg-white" onClick={() => exec("formatBlock", "h2")}>H2</button>
        <button type="button" className="px-2 py-1 rounded hover:bg-white" onClick={() => exec("formatBlock", "h3")}>H3</button>
        <button type="button" className="px-2 py-1 rounded hover:bg-white font-semibold" onClick={() => exec("bold")}>B</button>
        <button type="button" className="px-2 py-1 rounded hover:bg-white italic" onClick={() => exec("italic")}>I</button>
        <button type="button" className="px-2 py-1 rounded hover:bg-white underline" onClick={() => exec("underline")}>U</button>
        <button type="button" className="px-2 py-1 rounded hover:bg-white" onClick={() => exec("insertUnorderedList")}>Bullets</button>
        <button type="button" className="px-2 py-1 rounded hover:bg-white" onClick={() => exec("formatBlock", "blockquote")}>Quote</button>
        <button
          type="button"
          className="px-2 py-1 rounded hover:bg-white"
          onClick={() => {
            const url = prompt("Enter link URL:");
            if (!url) return;
            exec("createLink", url);
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded hover:bg-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageUpload(file);
            if (e.currentTarget) e.currentTarget.value = "";
          }}
        />
      </div>

      <div
        ref={editorRef}
        className="min-h-[320px] p-4 text-sm text-slate-800 outline-none"
        contentEditable
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        suppressContentEditableWarning
      />
    </div>
  );
}
