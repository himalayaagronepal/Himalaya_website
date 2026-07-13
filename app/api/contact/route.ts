import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import nodemailer from "nodemailer";

function validateEmail(email: string) {
  return typeof email === "string" && /\S+@\S+\.\S+/.test(email);
}

// Escape user-supplied values before placing them in the HTML email body to
// prevent HTML/script injection into the recipient's mail client.
function escapeHtml(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name || "").trim() || undefined;
  const email = (body.email || "").toLowerCase().trim();
  const subject = (body.subject || "").trim() || undefined;
  const message = (body.message || "").trim();

  if (!validateEmail(email)) return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  if (!message || message.length < 10) return NextResponse.json({ message: "Message must be at least 10 characters" }, { status: 400 });

  const doc: any = { name, email, subject, message, createdAt: new Date().toISOString() };

  // Persist if DB is configured (best-effort)
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const mongoose = await import("mongoose");
      await mongoose.connection.collection("messages").insertOne(doc);
    }
  } catch (err) {
    // don't fail the request if DB write fails — still return success to user,
    // but log for visibility
    console.warn("contact: failed to save message", err);
  }

  // Forward to webhook if configured (best-effort)
  try {
    if (process.env.CONTACT_WEBHOOK && typeof globalThis.fetch === "function") {
      globalThis.fetch(process.env.CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "contact.message", data: doc }),
      }).catch((err: any) => console.warn("contact webhook failed", err));
    }
  } catch (err) {
    console.warn("contact: webhook forward failed", err);
  }

  // Send an email using Nodemailer if SMTP is configured (best-effort)
  try {
    if (process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.SMTP_PASS)) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const from = process.env.CONTACT_FROM || process.env.SMTP_USER || `no-reply@${process.env.NEXT_PUBLIC_APP_HOST || "localhost"}`;
      const to = process.env.CONTACT_TO || process.env.CONTACT_FROM || from;

      await transporter.sendMail({
        from,
        to,
        subject: `[Website Contact] ${subject || "New message"}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${body.phone || "-"}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(body.phone || "-")}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
      });
    }
  } catch (err) {
    console.warn("contact: failed to send email", err);
  }

  return NextResponse.json({ message: "Thanks — message received" }, { status: 201 });
}
