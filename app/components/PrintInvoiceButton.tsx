"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

export default function PrintInvoiceButton({ invoiceContainerId, fileName }: { invoiceContainerId: string; fileName?: string }) {
  const [format, setFormat] = useState<"pdf" | "image">("pdf");
  const [busy, setBusy] = useState(false);
  const safeFileName = (fileName || "invoice").replace(/[\\/:*?"<>|]/g, "-");

  function saveBlob(blob: Blob, extension: "pdf" | "png") {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${safeFileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  async function waitForImages(root: HTMLElement) {
    const images = Array.from(root.querySelectorAll("img"));
    if (!images.length) return;

    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (!img.getAttribute("src")) {
              resolve();
              return;
            }

            img.loading = "eager";

            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }

            const done = () => {
              img.removeEventListener("load", done);
              img.removeEventListener("error", done);
              resolve();
            };

            img.addEventListener("load", done);
            img.addEventListener("error", done);
          })
      )
    );
  }

  async function renderInvoiceCanvas() {
    const { default: html2canvas } = await import("html2canvas");
    const container = document.getElementById(invoiceContainerId);
    if (!container) throw new Error("Invoice content is unavailable");

    const clone = container.cloneNode(true) as HTMLElement;
    clone.classList.remove("hidden");
    clone.style.display = "block";
    clone.style.visibility = "visible";
    clone.style.position = "static";

    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "0";
    host.style.width = "1100px";
    host.style.background = "#ffffff";
    host.style.padding = "20px";
    host.style.zIndex = "-1";
    host.appendChild(clone);
    document.body.appendChild(host);

    try {
      await waitForImages(clone);
      if (typeof document !== "undefined" && (document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }

      return await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
    } finally {
      document.body.removeChild(host);
    }
  }

  async function downloadInvoice() {
    if (busy) return;
    setBusy(true);
    try {
      const canvas = await renderInvoiceCanvas();

      if (format === "image") {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
        if (!blob) throw new Error("Could not generate image");
        saveBlob(blob, "png");
        toast.success("Invoice downloaded as image");
        return;
      }

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      const imageData = canvas.toDataURL("image/png", 1);
      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      const blob = pdf.output("blob");
      saveBlob(blob, "pdf");
      toast.success("Invoice downloaded as PDF");
    } catch (err: any) {
      toast.error(err?.message || "Unable to download invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
      <select
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white"
        value={format}
        onChange={(e) => setFormat(e.target.value as "pdf" | "image")}
        aria-label="Choose invoice download format"
        disabled={busy}
      >
        <option value="pdf">PDF (.pdf)</option>
        <option value="image">Image (.png)</option>
      </select>

      <button
        type="button"
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#059669] hover:text-[#059669] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={downloadInvoice}
        aria-label="Download invoice"
        disabled={busy}
      >
        {busy ? "Preparing..." : "Download"}
      </button>
    </div>
  );
}
