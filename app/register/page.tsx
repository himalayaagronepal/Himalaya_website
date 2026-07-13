import RegisterClient from "../components/RegisterClient";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage({ searchParams }: { searchParams?: { from?: string } | Promise<{ from?: string } | undefined> }) {
  // `searchParams` may be a Promise in the App Router — unwrap it safely (matches /login)
  const sp = (searchParams && typeof (searchParams as any)?.then === "function") ? await searchParams : (searchParams || {});
  const from = (sp as any).from || "/";

  const session = await getServerSession(authOptions as any);
  if (session) return redirect(from);

  return (
    <div className="min-h-screen bg-white">
      <RegisterClient from={from} />
    </div>
  );
}
