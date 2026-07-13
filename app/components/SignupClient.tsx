"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Personalised experience",
    desc: "Tailored recommendations for you",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    title: "Faster checkout & reorder",
    desc: "Save time on every purchase",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Secure & private",
    desc: "Your data stays protected",
  },
];

export default function SignupClient({ from }: { from?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Signup failed");

      const signInRes = await signIn("credentials", { redirect: false, email, password });
      // @ts-ignore
      if (signInRes?.error) {
        toast.success("Account created — please sign in");
        router.push("/login");
      } else {
        toast.success("Signed in");
        router.push((from as string) || "/");
      }
    } catch (err: any) {
      const msg = err.message || "Unable to create account";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-36 pb-24 sm:pt-40 sm:pb-28 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#2da8da]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2da8da]/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 items-stretch"
      >
        {/* Left — brand panel (desktop only) */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex flex-col justify-between p-10 lg:p-12 rounded-l-3xl relative overflow-hidden bg-[#0f2a4a]"
        >
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6"
            >
              Himalaya Agro
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl lg:text-4xl font-extrabold text-white leading-tight"
            >
              Get<br />started
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-white/80 text-sm leading-relaxed max-w-xs"
            >
              Create an account to save orders, track shipments and access buyer‑only pricing. It takes under a minute.
            </motion.p>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3 group"
              >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 group-hover:bg-white/25 transition-colors duration-300">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="relative z-10 mt-10 flex items-center gap-2 text-white/50 text-xs"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            256-bit SSL encrypted
          </motion.div>
        </motion.div>

        {/* Right — form card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl md:rounded-l-none md:rounded-r-3xl shadow-2xl shadow-gray-200/60 p-8 sm:p-10 lg:p-12 text-slate-900 relative"
        >
          <div className="max-w-sm mx-auto">
            {/* Mobile brand header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="md:hidden mb-8 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 rounded-t-3xl bg-[#0f2a4a] px-6 py-8 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Himalaya Agro</p>
              <h2 className="text-2xl font-extrabold text-white leading-tight">Get started</h2>
              <p className="mt-2 text-sm text-white/70 max-w-xs mx-auto">Create an account to save orders, track shipments and access buyer-only pricing.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Join the marketplace in under a minute
              </p>
            </motion.div>

            <form onSubmit={onSubmit} className="space-y-5" aria-describedby={error ? "signup-error" : undefined}>
              {/* Name */}
              <motion.div variants={itemVariants}>
                <label htmlFor="signup-name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Full name
                </label>
                <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                  focusedField === "name"
                    ? "border-[#2da8da] shadow-[0_0_0_3px_rgba(45,168,218,0.08)]"
                    : "border-gray-100 hover:border-gray-200"
                }`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input
                    id="signup-name"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label htmlFor="signup-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                  focusedField === "email"
                    ? "border-[#2da8da] shadow-[0_0_0_3px_rgba(45,168,218,0.08)]"
                    : "border-gray-100 hover:border-gray-200"
                }`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    id="signup-email"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    type="email"
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="signup-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-300">Min 8 characters</span>
                </div>
                <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                  focusedField === "password"
                    ? "border-[#2da8da] shadow-[0_0_0_3px_rgba(45,168,218,0.08)]"
                    : "border-gray-100 hover:border-gray-200"
                }`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <input
                    id="signup-password"
                    className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-300 hover:text-[#2da8da] hover:bg-[#2da8da]/5 transition-all duration-200"
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
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    id="signup-error"
                    role="alert"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100"
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5 text-red-400 shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span className="text-sm text-red-600 font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: "0 8px 30px -6px rgba(45,168,218,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-white text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-[#2da8da] hover:bg-[#1e8bb8]"
                  style={loading ? { backgroundColor: "#9ca3af" } : undefined}
                  disabled={loading}
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
                    <>
                      Create account
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-gray-300 font-medium">or</span>
                </div>
              </motion.div>

              {/* Sign in link */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <a href="/login" className="text-[#2da8da] font-semibold hover:text-[#1e8bb8] transition-colors duration-200 relative group">
                    Sign in
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-[#2da8da] group-hover:w-full transition-all duration-300" />
                  </a>
                </p>
              </motion.div>

              {/* Trust footer */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-4 pt-4 text-[11px] text-gray-300"
              >
                <span className="flex items-center gap-1">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Secure
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <span className="flex items-center gap-1">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Encrypted
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <span className="flex items-center gap-1">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Fast
                </span>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}