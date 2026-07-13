import LoginClient from "../components/LoginClient";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams?: { from?: string; error?: string } | Promise<{ from?: string; error?: string } | undefined> }) {
  // `searchParams` may be a Promise in the App Router — unwrap it safely
  const sp = (searchParams && typeof (searchParams as any)?.then === "function") ? await searchParams : (searchParams || {});
  const from = (sp as any).from || "/";
  const rawError = (sp as any).error as string | undefined;

  const session = await getServerSession(authOptions as any);
  if (session) return redirect(from);

  return (
    <div className="min-h-screen bg-white">
      <LoginClient from={from} serverError={rawError} />
    </div>
  );
}