"use client";

import { useState } from "react";
import { toast } from "react-toastify";

type ContactFormProps = {
  mapEmbedUrl?: string;
  infoCompanyLabel?: string;
  infoHeading?: string;
  infoSubheading?: string;
  phones?: string[];
  contactEmail?: string;
  addressLines?: string[];
  supportEmail?: string;
  openHours?: string;
  formHeading?: string;
  formSubheading?: string;
};

export default function ContactForm({
  mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d938.4845275782392!2d83.97552017100725!3d28.223913589483583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6987177b13ca1cdd%3A0x6cd4dd3f132d685d!2sHimalaya%20Nepal%20Krishi%20Company%20Limited!5e1!3m2!1sen!2snp!4v1777634380714!5m2!1sen!2snp",
  infoCompanyLabel = "Himalaya Nepal Krishi Company Limited",
  infoHeading = "Let's talk",
  infoSubheading = "Share your needs and our team will reach out within 24 hours.",
  phones = ["+977-9851227052", "+977-9851312052", "01-061-587586"],
  contactEmail = "info@himalayaagronepal.com",
  addressLines = ["Dharapani Marga (Road)", "Pokhara 33700"],
  supportEmail = "info@himalayaagronepal.com",
  openHours = "Mon - Fri",
  formHeading = "Send us a message",
  formSubheading = "We will get back to you shortly.",
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error((data && data.message) || "Failed to send message");
        setLoading(false);
        return;
      }

      setShowSuccess(true);
      toast.success("Message sent successfully!");
    } catch (err) {
      console.error("Contact form submit error:", err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  const fieldWrap = (field: string) =>
    `relative rounded-xl border-2 transition-all duration-300 ${
      focusedField === field
        ? "border-[#0e7490] shadow-[0_0_0_3px_rgba(45,168,218,0.08)]"
        : "border-gray-100 hover:border-gray-200"
    }`;

  return (
    <div className="w-full relative">
      {/* Full-width Map Section */}
      <div className="w-full h-64 md:h-80 overflow-hidden">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="location"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-[2fr_3fr] items-stretch bg-white rounded-b-3xl shadow-2xl shadow-gray-200/60 overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-10 lg:p-12 relative overflow-hidden bg-[#0f2a4a] text-white">
          <div className="absolute -top-32 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-6">{infoCompanyLabel}</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">{infoHeading}</h2>
            <p className="mt-4 text-white/80 text-sm leading-relaxed max-w-xs">
              {infoSubheading}
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-6">
            {/* PHONE */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a1.125 1.125 0 01-1.21.38A12.035 12.035 0 017.68 13.27a1.125 1.125 0 01.38-1.21l1.293-.97c.363-.272.527-.734.417-1.173L8.664 5.494a1.125 1.125 0 00-1.09-.852H6.75A2.25 2.25 0 004.5 6.75v0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-white mb-2">Phone</p>
                <div className="text-sm text-white/70 space-y-1.5">
                  {phones.map((ph, i) => <p key={i}>{ph}</p>)}
                </div>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-white mb-2">Email</p>
                <p className="text-sm text-white/70">{contactEmail}</p>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-white mb-2">Address</p>
                <div className="text-sm text-white/70 space-y-1.5">
                  {addressLines.map((ln, i) => <p key={i}>{ln}</p>)}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 text-xs text-white/60">
            <div>Support: {supportEmail}</div>
            <div className="mt-2">Open: {openHours}</div>
          </div>
        </div>

        <div className="bg-white p-0 text-slate-900 relative overflow-hidden">
          <div className="p-8 sm:p-10 lg:p-12">
          <div className="max-w-xl mx-auto">
            <div className="md:hidden mb-8 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 rounded-t-3xl bg-[#0f2a4a] px-6 py-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">Himalaya Agro</p>
              <h2 className="text-2xl font-extrabold text-white leading-tight">{infoHeading}</h2>
              <p className="mt-2 text-sm text-white/70 max-w-xs mx-auto">{infoSubheading}</p>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">{formHeading}</h1>
              <p className="mt-2 text-sm text-gray-600">{formSubheading}</p>
            </div>

            <form
              onSubmit={onSubmit}
              className={`${showSuccess ? "opacity-0 pointer-events-none" : "opacity-100"} transition-all duration-300 space-y-5`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full name</label>
                  <div className={fieldWrap("name")}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
                      </svg>
                    </div>
                    <input
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Your name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email address</label>
                  <div className={fieldWrap("email")}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                  <div className={fieldWrap("subject")}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h9m-9 4.5h9m-9 4.5h5.25M4.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5z" />
                      </svg>
                    </div>
                    <input
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="General inquiry"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                  <div className={fieldWrap("phone")}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a1.125 1.125 0 01-1.21.38A12.035 12.035 0 017.68 13.27a1.125 1.125 0 01.38-1.21l1.293-.97c.363-.272.527-.734.417-1.173L8.664 5.494a1.125 1.125 0 00-1.09-.852H6.75A2.25 2.25 0 004.5 6.75v0z" />
                      </svg>
                    </div>
                    <input
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      type="tel"
                      placeholder="+1 (000) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your message</label>
                <div className={fieldWrap("message")}>
                  <div className="absolute left-4 top-4 text-black pointer-events-none">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h10.5M6.75 12h7.5m-7.5 4.5h4.5m-6-12.75h12a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-12A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25z" />
                    </svg>
                  </div>
                  <textarea
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-xl resize-none min-h-[140px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    rows={5}
                    placeholder="How can we help you today?"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-white text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-[#0e7490] hover:bg-[#0b5e74]"
                style={loading ? { backgroundColor: "#9ca3af" } : undefined}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <div
            className={`${showSuccess ? "flex" : "hidden"} absolute inset-0 bg-white flex-col items-center justify-center text-center p-12 animate-[fadeIn_0.4s_ease-out]`}
          >
            <div className="mb-6 w-16 h-16 bg-green-50 text-[#0e7490] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Message sent</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Expect a response within 24 hours.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-8 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Back to form
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}