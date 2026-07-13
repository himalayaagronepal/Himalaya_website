import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../../components/AnimatedClient";

export const metadata = {
  title: "Crop Cultivation",
  description: "Seeds, fertilizers & crop care solutions for modern Nepali agriculture. Explore our full-cycle crop cultivation programs.",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  wheat: "M12 2v20M9 7l3-3 3 3M7 12l5-5 5 5M5 17l7-7 7 7",
  cash: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  sun: "M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41M12 8a4 4 0 100 8 4 4 0 000-8z",
  seed: "M12 22c-4-4-8-7.5-8-12a8 8 0 1116 0c0 4.5-4 8-8 12z",
  sprout: "M7 20h10M10 20c0-4.4 3.6-8 8-8M6 12a6 6 0 0112 0M12 12V4",
  flask: "M9 3h6M10 3v5.2L5 18h14l-5-9.8V3",
  shield: "M12 2l8 4v6c0 5.5-3.8 10-8 12-4.2-2-8-6.5-8-12V6l8-4z",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6M9 14h6M9 10h6",
  box: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  handshake: "M11 17l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z",
};

const cropCategories = [
  { name: "Cereal Crops", icon: icons.wheat, desc: "Rice, wheat, maize & millet varieties optimized for Nepali terrain." },
  { name: "Cash Crops", icon: icons.cash, desc: "Ginger, turmeric, cardamom & high-value spice production." },
  { name: "Oilseed Crops", icon: icons.sun, desc: "Mustard, sunflower & soybean for domestic and export markets." },
  { name: "Pulse Crops", icon: icons.seed, desc: "Lentils, chickpeas & beans ensuring food security and soil health." },
];

const services = [
  { title: "Premium Seed Supply", desc: "Certified, high-yield seed varieties developed through rigorous R&D and field trials across multiple agro-climatic zones.", icon: icons.sprout },
  { title: "Soil Health Management", desc: "Comprehensive soil testing, nutrient mapping, and customized fertilizer recommendations for optimal crop performance.", icon: icons.flask },
  { title: "Integrated Pest Management", desc: "Bio-control agents, pheromone traps, and targeted pesticide application to minimize chemical usage while maximizing protection.", icon: icons.shield },
  { title: "Crop Advisory Services", desc: "Season-specific planting calendars, weather alerts, and real-time agronomic guidance from certified crop specialists.", icon: icons.clipboard },
  { title: "Post-Harvest Technology", desc: "Modern drying, grading, and storage solutions to reduce post-harvest losses and maintain product quality.", icon: icons.box },
  { title: "Market Linkage", desc: "Direct connections to domestic and international buyers with fair pricing mechanisms and quality certification.", icon: icons.handshake },
];

const stats = [
  { value: "45+", label: "Seed Varieties", sub: "Certified & Tested" },
  { value: "12K", label: "Hectares Covered", sub: "Under Active Program" },
  { value: "98%", label: "Germination Rate", sub: "Quality Standard" },
  { value: "340+", label: "Partner Farms", sub: "Nationwide Network" },
];

export default function CropCultivationPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-emerald-100">
      <SubHeroSection
        title="Crop Cultivation"
        description="From seed selection to harvest management — delivering end-to-end crop solutions that transform Nepal's agricultural productivity."
        image="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2000"
        tag="Seeds, Fertilizers & Crop Care"
        stats={[
          { value: "45+", label: "Seed Varieties" },
          { value: "12K", label: "Hectares Covered" },
        ]}
        btnText="Explore Products"
        btnHref="/shop"
      />

      <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 xl:px-10 mb-14 sm:mb-16 lg:mb-20">

        {/* Stats Bar */}
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

        {/* Crop Categories */}
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
                Our Focus Areas
              </span>
              <h2 className="text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-6">
                Crop Categories
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                We specialize in four major crop verticals, each backed by research-driven agronomy and market intelligence.
              </p>
              <div className="space-y-4">
                {cropCategories.map((cat, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-[#0891b2]/20 hover:bg-[#0891b2]/2 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-[#0891b2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                      <Icon d={cat.icon} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-[#0891b2] transition-colors">{cat.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{cat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-4xl overflow-hidden border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1595841696677-6589b54f82a5?auto=format&fit=crop&q=80&w=800"
                  alt="Rice paddy terraces in Nepal"
                  className="w-full aspect-4/5 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-10">
                <div className="text-[10px] font-bold text-[#0891b2] uppercase tracking-[2px] mb-1">Yield Improvement</div>
                <div className="text-2xl font-black">+38%</div>
                <div className="text-[10px] text-slate-400">Average Increase</div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-16 w-full h-px bg-slate-100" />

        {/* Services Grid */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
              What We Offer
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Cultivation Services</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
              End-to-end support for every stage of the crop lifecycle.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-slate-100 hover:border-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 flex items-center justify-center mb-5 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                  <Icon d={svc.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#0891b2] transition-colors">{svc.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        {/* Process Section */}
        <AnimatedSection
          className="mt-16 p-2 rounded-[48px] bg-[#0a1628] overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-10 lg:p-16 rounded-[40px] border border-white/6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-white">
                <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 bg-[#0891b2]/10">
                  Our Process
                </span>
                <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight leading-tight">From Seed to Market</h2>
                <p className="text-white/50 mb-10 leading-relaxed text-[15px]">
                  Our integrated approach ensures quality at every step — from certified seed distribution through expert-guided cultivation to guaranteed market access.
                </p>
                <div className="space-y-5">
                  {["Soil Analysis & Seed Selection", "Precision Planting & Nutrient Management", "Growth Monitoring & Pest Control", "Harvest, Quality Testing & Market Access"].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 border border-[#0891b2]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/20 transition-colors">
                        <span className="text-[#0891b2] text-sm font-black">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <span className="font-medium text-white/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative rounded-3xl overflow-hidden aspect-4/3">
                <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800" alt="Wheat harvest in golden light" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#0a1628]/40" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#0891b2] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-[2px]">Full Crop Lifecycle</span>
                  </div>
                </div>
              </div>
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
              Get Started
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white tracking-tight">
              Ready to Transform Your Yield?
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with our crop specialists and discover the right cultivation solutions for your farm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="px-10 py-4 bg-[#0891b2] text-white rounded-full font-bold text-sm hover:bg-[#0e7490] transition-colors duration-300">
                Browse Products
              </Link>
              <Link href="/contact" className="px-10 py-4 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
