"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const benefits = [
  { title: "Shop the full catalogue", desc: "Browse and buy any product online" },
  { title: "Fast eSewa checkout", desc: "Secure payments via eSewa" },
  { title: "Track your orders", desc: "Receipts and real-time delivery updates" },
];

export default function RegisterClient({ from }: { from: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Unable to create account.");

      toast.success("Account created! Signing you in…");

      // Log the new customer straight in so they can keep shopping.
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (signInRes?.error) {
        // Account exists but auto sign-in failed — send them to login.
        toast.info("Account created. Please sign in to continue.");
        router.push(`/login?from=${encodeURIComponent(from || "/")}`);
        return;
      }

      router.push(from || "/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to create account.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 lg:pb-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#0e7490]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#0e7490]/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 items-stretch"
      >
        {/* Left — brand panel (desktop only) */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex flex-col justify-between p-10 lg:p-12 rounded-l-3xl relative overflow-hidden bg-[#0f2a4a]"
        >
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-6">Himalaya Agro</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">Create your<br />account</h2>
            <p className="mt-4 text-white/80 text-sm leading-relaxed max-w-xs">
              Sign up in seconds to shop our products and check out securely with eSewa.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{b.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-10 flex items-center gap-2 text-white/50 text-xs">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            256-bit SSL encrypted
          </div>
        </motion.div>

        {/* Right — form card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl md:rounded-l-none md:rounded-r-3xl shadow-2xl shadow-gray-200/60 p-8 sm:p-10 lg:p-12 text-slate-900 relative"
        >
          <div className="max-w-sm mx-auto">
            <div className="md:hidden mb-8 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 rounded-t-3xl bg-[#0f2a4a] px-6 py-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">Himalaya Agro</p>
              <h2 className="text-2xl font-extrabold text-white leading-tight">Create your account</h2>
              <p className="mt-2 text-sm text-white/70 max-w-xs mx-auto">Sign up to shop and check out with eSewa.</p>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">Create an account</h1>
              <p className="mt-2 text-sm text-gray-600">It only takes a moment</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Full name
                </label>
                <input
                  id="reg-name"
                  className="w-full rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0e7490] focus:outline-none px-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  id="reg-email"
                  className="w-full rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0e7490] focus:outline-none px-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Phone number
                </label>
                <input
                  id="reg-phone"
                  className="w-full rounded-xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#0e7490] focus:outline-none px-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 transition-colors"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="98XXXXXXXX"
                  required
                  autoComplete="tel"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-xl border-2 border-gray-100 hover:border-gray-200 focus-within:border-[#0e7490] transition-colors">
                  <input
                    id="reg-password"
                    className="w-full bg-transparent pl-4 pr-12 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-300 hover:text-[#0e7490] hover:bg-[#0e7490]/5 transition-all"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div role="alert" className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5 text-red-400 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-sm text-red-600 font-medium">{error}</span>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-white text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#0e7490] hover:bg-[#0b5e74] mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </motion.button>

              {/* Sign in link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href={`/login?from=${encodeURIComponent(from || "/")}`} className="text-[#0e7490] font-semibold hover:text-[#0b5e74] transition-colors">
                    Sign in
                  </a>
                </p>
              </div>

              {/* Distributor link */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Want a distributor account?{" "}
                  <a href="/register/distributor" className="text-[#0e7490] font-medium hover:text-[#0b5e74] transition-colors">
                    Apply here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
