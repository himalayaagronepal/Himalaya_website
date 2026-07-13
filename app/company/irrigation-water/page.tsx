import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../../components/AnimatedClient";

export const metadata = {
  title: "Irrigation & Water",
  description: "Drip irrigation, sprinkler systems & pump solutions for efficient water management in Nepali agriculture.",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  wrench: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  aperture: "M12 2a10 10 0 100 20 10 10 0 000-20zM14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  beaker: "M9 3h6M10 3v5.2L5 18h14l-5-9.8V3",
  clock: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
};

const systems = [
  { name: "Drip Irrigation", desc: "Precision water delivery directly to root zones, reducing consumption by up to 60% while boosting yields.", img: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=400" },
  { name: "Sprinkler Systems", desc: "Overhead irrigation solutions for field crops, orchards, and nurseries with uniform water distribution.", img: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400" },
  { name: "Solar Pumping", desc: "Off-grid solar-powered pumping stations for remote farms with zero recurring energy costs.", img: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400" },
];

const products = [
  { title: "Drip Lines & Emitters", desc: "Inline and online drip systems for row crops, orchards, and polyhouse cultivation with precise flow control.", icon: icons.wrench },
  { title: "Sprinkler Heads", desc: "Impact, micro, and pop-up sprinklers designed for varying pressure zones and crop requirements.", icon: icons.aperture },
  { title: "Submersible Pumps", desc: "High-efficiency borewell and surface pumps with corrosion-resistant construction for long service life.", icon: icons.zap },
  { title: "Filtration Units", desc: "Sand, disc, and screen filters ensuring clean water delivery and preventing emitter clogging.", icon: icons.filter },
  { title: "Fertigation Equipment", desc: "Venturi injectors and dosing pumps for precise nutrient delivery through irrigation systems.", icon: icons.beaker },
  { title: "Automation Controllers", desc: "Timer-based and sensor-driven controllers for fully automated irrigation scheduling.", icon: icons.clock },
];

const stats = [
  { value: "60%", label: "Water Saved", sub: "vs. Flood Irrigation" },
  { value: "3.2K", label: "Installations", sub: "Across 45 Districts" },
  { value: "40%", label: "Yield Increase", sub: "Average Improvement" },
  { value: "24/7", label: "Tech Support", sub: "Service Network" },
];

export default function IrrigationWaterPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-sky-100">
      <SubHeroSection
        title="Irrigation & Water"
        description="Smart water management solutions — drip systems, sprinklers, and solar pumps that maximize every drop for Nepali agriculture."
        image="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=2000"
        tag="Drip, Sprinkler & Pumps"
        stats={[
          { value: "60%", label: "Water Saved" },
          { value: "3.2K", label: "Installations" },
        ]}
        btnText="View Products"
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

        {/* Irrigation Systems — Visual Cards */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
                Our Systems
              </span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Irrigation Solutions</h2>
            </div>
            <Link href="/shop" className="text-sm font-bold text-[#0891b2] hover:text-[#0e7490] transition-colors flex items-center gap-1.5 shrink-0">
              View All Products <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {systems.map((sys, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[28px] mb-6 aspect-square bg-slate-100">
                  <img src={sys.img} alt={sys.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-[#0a1628]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-5 left-5 right-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                      Learn More <span>→</span>
                    </span>
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-1.5 group-hover:text-[#0891b2] transition-colors duration-300">{sys.name}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{sys.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        <div className="mt-16 w-full h-px bg-slate-100" />

        {/* Product Catalog Grid */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
              Product Range
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Equipment & Supplies</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
              Complete irrigation infrastructure — from emitters to automation controllers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-slate-100 hover:border-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 flex items-center justify-center mb-5 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                  <Icon d={prod.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#0891b2] transition-colors">{prod.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{prod.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        {/* Water Management Approach — Dark Section */}
        <AnimatedSection
          className="mt-16 p-2 rounded-[48px] bg-[#0a1628] overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-10 lg:p-16 rounded-[40px] border border-white/6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative rounded-3xl overflow-hidden aspect-4/3">
                <img src="https://images.unsplash.com/photo-1501004318855-b43cf7efd8a4?auto=format&fit=crop&q=80&w=800" alt="Water flowing through irrigation canal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#0a1628]/40" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#0891b2] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-[2px]">Smart Water Management</span>
                  </div>
                </div>
              </div>
              <div className="text-white">
                <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 bg-[#0891b2]/10">
                  Our Approach
                </span>
                <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight leading-tight">Every Drop Counts</h2>
                <p className="text-white/50 mb-10 leading-relaxed text-[15px]">
                  We design complete water management solutions — from source assessment and system design to installation, training, and ongoing maintenance support.
                </p>
                <div className="space-y-5">
                  {[
                    "Site Survey & Water Source Assessment",
                    "Custom System Design & Engineering",
                    "Professional Installation & Commissioning",
                    "Farmer Training & Ongoing Support",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 border border-[#0891b2]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/20 transition-colors">
                        <span className="text-[#0891b2] text-sm font-black">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <span className="font-medium text-white/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Efficiency Comparison */}
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
              Impact Comparison
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Water Efficiency Gains</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-14 text-[15px] leading-relaxed">
              How modern irrigation compares to traditional flood methods across key metrics.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { metric: "60%", label: "Water Savings", desc: "Less water consumption" },
                { metric: "40%", label: "Yield Increase", desc: "Higher crop output" },
                { metric: "50%", label: "Labor Reduction", desc: "Automated systems" },
                { metric: "30%", label: "Fertilizer Savings", desc: "Through fertigation" },
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
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0891b2]/15 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-8 bg-[#0891b2]/10">
              Get a Quote
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white tracking-tight">
              Upgrade Your Water Infrastructure
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              From small-plot drip systems to large-scale sprinkler installations — we design, supply, and support complete irrigation solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="px-10 py-4 bg-[#0891b2] text-white rounded-full font-bold text-sm hover:bg-[#0e7490] transition-colors duration-300">
                Browse Products
              </Link>
              <Link href="/contact" className="px-10 py-4 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors duration-300">
                Request a Survey
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
