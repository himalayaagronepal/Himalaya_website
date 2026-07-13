import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../../components/AnimatedClient";

export const metadata = {
  title: "Agri-Tech Solutions",
  description: "IoT sensors, smart farming tools, and AI-driven agricultural technology for precision agriculture in Nepal.",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  radio: "M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 012.28-1.49M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  cloud: "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
  cpu: "M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  bot: "M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v1H3v-1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM16.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3 18h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z",
  monitor: "M2 3h20v14H2zM8 21h8M12 17v4",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  signal: "M12 20h.01M8.53 16.11a6 6 0 016.95 0M5.06 12.65a10 10 0 0113.87 0M1.59 9.19a14 14 0 0120.82 0",
  server: "M2 4h20v6H2zM2 14h20v6H2zM6 7h.01M6 17h.01",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  smartphone: "M5 2h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zM12 18h.01",
};

const solutions = [
  { title: "IoT Soil Sensors", desc: "Real-time monitoring of soil moisture, pH, temperature, and nutrient levels with wireless data transmission to your dashboard.", icon: icons.radio },
  { title: "Weather Stations", desc: "Hyper-local weather monitoring and forecasting for micro-climate aware farming decisions and risk mitigation.", icon: icons.cloud },
  { title: "Drone Surveying", desc: "Aerial crop health assessment, NDVI mapping, and precision spraying using commercial-grade agricultural drones.", icon: icons.mapPin },
  { title: "AI Yield Prediction", desc: "Machine learning models that analyze historical and real-time data to forecast yields and optimize input application.", icon: icons.bot },
  { title: "Farm Management Software", desc: "Cloud-based platform for planning, recording, and analyzing all farm operations from planting to harvest.", icon: icons.monitor },
  { title: "GPS-Guided Equipment", desc: "Precision guidance systems for tractors and implements ensuring accurate row spacing, seeding, and application.", icon: icons.mapPin },
];

const techStack = [
  { name: "Sensors & IoT", icon: icons.signal, desc: "Field-deployed sensors transmitting real-time soil and environmental data." },
  { name: "Cloud Platform", icon: icons.server, desc: "Scalable cloud infrastructure processing millions of data points daily." },
  { name: "AI & Analytics", icon: icons.activity, desc: "Machine learning models generating actionable insights and predictions." },
  { name: "Mobile Apps", icon: icons.smartphone, desc: "Farmer-facing applications delivering alerts, recommendations, and market data." },
];

const stats = [
  { value: "15K+", label: "IoT Devices", sub: "Deployed in Field" },
  { value: "98.5%", label: "Uptime", sub: "System Reliability" },
  { value: "2M+", label: "Data Points", sub: "Processed Daily" },
  { value: "25%", label: "Cost Reduction", sub: "Input Optimization" },
];

const useCases = [
  { title: "Precision Irrigation", desc: "Soil moisture sensors trigger automated irrigation only when needed, eliminating waste and overwatering.", result: "60% water savings" },
  { title: "Early Disease Detection", desc: "Computer vision and drone imagery identify crop diseases days before visible symptoms appear.", result: "85% detection accuracy" },
  { title: "Supply Chain Tracking", desc: "RFID and GPS tracking from farm gate to retail shelf ensures quality compliance and traceability.", result: "100% traceability" },
  { title: "Market Price Intelligence", desc: "Real-time price data aggregation from domestic and international markets for informed selling decisions.", result: "15% revenue increase" },
];

export default function AgriTechPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-sky-100">
      <SubHeroSection
        title="Agri-Tech Solutions"
        description="Harnessing IoT, AI, and data analytics to bring precision agriculture to every Nepali farm — smarter inputs, better yields, lower costs."
        image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
        tag="IoT Sensors & Smart Tools"
        stats={[
          { value: "15K+", label: "IoT Devices" },
          { value: "2M+", label: "Data Points/Day" },
        ]}
        btnText="Explore Solutions"
        btnHref="/shop"
      />

      <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 xl:px-10 mb-14 sm:mb-16 lg:mb-20">

        {/* Stats */}
        <AnimatedSection
          className="mt-10 sm:mt-12 lg:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-8 border border-slate-100 rounded-3xl hover:shadow-lg transition-shadow duration-300">
                <p className="text-4xl font-black text-[#0891b2] mb-2">{stat.value}</p>
                <p className="text-sm font-bold uppercase tracking-tight text-slate-800 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{stat.sub}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Solutions Grid */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
              Smart Agriculture
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Our Technology Suite</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
              Integrated hardware and software solutions designed for the unique challenges of Nepali agriculture.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-slate-100 hover:border-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 flex items-center justify-center mb-5 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                  <Icon d={sol.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#0891b2] transition-colors">{sol.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{sol.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        <div className="mt-16 w-full h-px bg-slate-100" />

        {/* Tech Stack Architecture */}
        <AnimatedSection
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 bg-[#0891b2]/5">
                Architecture
              </span>
              <h2 className="text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-6">
                Technology Stack
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                A four-layer architecture that captures field data, processes it in the cloud, generates AI insights, and delivers actionable recommendations to farmers.
              </p>
              <div className="space-y-4">
                {techStack.map((layer, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-[#0891b2]/20 hover:bg-[#0891b2]/2 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-[#0891b2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                      <Icon d={layer.icon} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-[#0891b2] transition-colors">{layer.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{layer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="p-2 rounded-4xl bg-slate-50 border border-slate-200/60">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                  alt="Analytics Dashboard"
                  className="rounded-3xl w-full"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-10">
                <div className="text-[10px] font-bold text-[#0891b2] uppercase tracking-[2px] mb-1">System Uptime</div>
                <div className="text-2xl font-black">98.5%</div>
                <div className="text-[10px] text-slate-400">Reliability Score</div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Use Cases — Dark Section */}
        <AnimatedSection
          className="mt-16 p-2 rounded-[48px] bg-[#0a1628] overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-10 lg:p-16 rounded-[40px] border border-white/6">
            <div className="text-center text-white mb-14">
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 bg-[#0891b2]/10">
                Real-World Impact
              </span>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Use Cases</h2>
              <p className="text-white/40 mt-3 max-w-xl mx-auto text-[15px]">How our technology translates to measurable outcomes on the ground.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {useCases.map((uc, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/3 border border-white/6 hover:bg-white/6 transition-colors duration-300">
                  <h4 className="text-white font-bold text-base mb-3">{uc.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">{uc.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#0891b2] rounded-full" />
                    <span className="text-[#0891b2] text-xs font-bold uppercase tracking-wider">{uc.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Integration Benefits */}
        <AnimatedSection
          className="mt-16 relative py-16 px-8 lg:px-16 rounded-[48px] overflow-hidden text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute inset-0 bg-sky-50/50" />
          <div className="absolute inset-px rounded-[47px] border border-sky-100/60 pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-white">
              Why Agri-Tech
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">The Smart Farming Advantage</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-14 text-[15px] leading-relaxed">
              Quantifiable benefits of adopting precision agriculture technology.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { metric: "25%", label: "Lower Costs", desc: "Optimized input usage" },
                { metric: "30%", label: "Higher Yields", desc: "Data-driven decisions" },
                { metric: "50%", label: "Less Waste", desc: "Precision application" },
                { metric: "3x", label: "Faster ROI", desc: "Technology payback" },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-sky-100/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-3xl font-black text-[#0891b2] mb-2">{item.metric}</p>
                  <p className="font-bold text-sm text-slate-800 mb-1">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection
          className="mt-16 relative text-center py-16 rounded-[48px] overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute inset-0 bg-[#0a1628]" />
          <div className="absolute inset-px rounded-[47px] border border-white/6 pointer-events-none" />
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#0891b2]/15 blur-[120px] rounded-full -ml-40 -mt-40 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full -mr-32 -mb-32 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-8 bg-[#0891b2]/10">
              Get Connected
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white tracking-tight">
              Modernize Your Farm Today
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              From single-sensor deployments to full smart-farm integrations — our team designs solutions that fit your scale and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="px-10 py-4 bg-[#0891b2] text-white rounded-full font-bold text-sm hover:bg-[#0e7490] transition-colors duration-300">
                Browse Tech Products
              </Link>
              <Link href="/contact" className="px-10 py-4 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors duration-300">
                Schedule a Demo
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
