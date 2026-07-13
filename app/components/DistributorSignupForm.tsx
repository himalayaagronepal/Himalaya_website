"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "../../lib/cloudinary-upload";

export default function DistributorSignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [citizenshipFrontUrl, setCitizenshipFrontUrl] = useState<string>("");
  const [citizenshipBackUrl, setCitizenshipBackUrl] = useState<string>("");
  const [panCertificateUrl, setPanCertificateUrl] = useState<string>("");
  const [frontInputKey, setFrontInputKey] = useState(0);
  const [backInputKey, setBackInputKey] = useState(0);
  const [panInputKey, setPanInputKey] = useState(0);

  async function handleFileUpload(file: File | null, fileType: "front" | "back" | "pan") {
    if (!file) return;

    setUploadingFile(fileType);
    try {
      const url = await uploadToCloudinary(file, 200);
      if (fileType === "front") setCitizenshipFrontUrl(url);
      else if (fileType === "back") setCitizenshipBackUrl(url);
      else if (fileType === "pan") setPanCertificateUrl(url);
      toast.success(`${fileType === "front" ? "Citizenship Front" : fileType === "back" ? "Citizenship Back" : "PAN Certificate"} uploaded successfully`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload file");
    } finally {
      setUploadingFile(null);
    }
  }

  function clearUpload(fileType: "front" | "back" | "pan") {
    if (fileType === "front") {
      setCitizenshipFrontUrl("");
      setFrontInputKey((k) => k + 1);
    }
    if (fileType === "back") {
      setCitizenshipBackUrl("");
      setBackInputKey((k) => k + 1);
    }
    if (fileType === "pan") {
      setPanCertificateUrl("");
      setPanInputKey((k) => k + 1);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate that all documents are uploaded
    if (!citizenshipFrontUrl || !citizenshipBackUrl || !panCertificateUrl) {
      toast.error("Please upload all required documents (Citizenship Front, Back, and PAN Certificate)");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      businessName: String(formData.get("businessName") || "").trim(),
      phoneNumber: String(formData.get("phoneNumber") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      citizenshipFront: citizenshipFrontUrl,
      citizenshipBack: citizenshipBackUrl,
      panCertificate: panCertificateUrl,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/distributors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to submit distributor application");
      toast.success(json?.message || "Distributor application submitted");
      e.currentTarget.reset();
      setCitizenshipFrontUrl("");
      setCitizenshipBackUrl("");
      setPanCertificateUrl("");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.message || "Unable to submit distributor application");
    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={onSubmit} className="h-full space-y-4 rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-100">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Apply as a distributor</h2>
        <p className="mt-2 text-sm text-slate-500">Your account will be reviewed by the super admin before buying online.</p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Full name</span>
        <input name="name" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Business name</span>
        <input name="businessName" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Phone number</span>
        <input name="phoneNumber" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
        <input type="email" name="email" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</span>
        <input type="password" name="password" minLength={8} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" />
      </label>

      {/* Document Upload Section */}
      <div className="pt-4 border-t border-slate-200">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Upload documents (Max 200KB each)</p>
        
        <label className="block mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Citizenship Front
              {citizenshipFrontUrl && <span className="text-green-600 text-[10px] font-bold">✓ Uploaded</span>}
            </span>
            {citizenshipFrontUrl && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearUpload("front"); }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                aria-label="Remove citizenship front"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
          <input
            key={frontInputKey}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.currentTarget.files?.[0] || null, "front")}
            disabled={uploadingFile !== null}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none disabled:opacity-50"
          />
          {uploadingFile === "front" && <p className="mt-1 text-xs text-cyan-600">Uploading...</p>}
        </label>

        <label className="block mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Citizenship Back
              {citizenshipBackUrl && <span className="text-green-600 text-[10px] font-bold">✓ Uploaded</span>}
            </span>
            {citizenshipBackUrl && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearUpload("back"); }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                aria-label="Remove citizenship back"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
          <input
            key={backInputKey}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.currentTarget.files?.[0] || null, "back")}
            disabled={uploadingFile !== null}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none disabled:opacity-50"
          />
          {uploadingFile === "back" && <p className="mt-1 text-xs text-cyan-600">Uploading...</p>}
        </label>

        <label className="block mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              PAN Certificate
              {panCertificateUrl && <span className="text-green-600 text-[10px] font-bold">✓ Uploaded</span>}
            </span>
            {panCertificateUrl && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearUpload("pan"); }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                aria-label="Remove PAN certificate"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
          <input
            key={panInputKey}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.currentTarget.files?.[0] || null, "pan")}
            disabled={uploadingFile !== null}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none disabled:opacity-50"
          />
          {uploadingFile === "pan" && <p className="mt-1 text-xs text-cyan-600">Uploading...</p>}
        </label>
      </div>

      <button type="submit" disabled={loading || !citizenshipFrontUrl || !citizenshipBackUrl || !panCertificateUrl} className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "Submitting…" : "Submit distributor application"}
      </button>

      <p className="text-xs text-slate-400 leading-5">
        Only approved distributors can place online orders. Normal customers should visit the outlet to buy directly.
      </p>
    </form>
  );
}
