import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../../components/AnimatedClient";

export const metadata = {
  title: "Organic Farming",
  description: "Certified organic supplies, bio-inputs, and sustainable farming practices for chemical-free agriculture.",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  award: "M12 15l-3.5 2 1-4L6 10l4-.5L12 6l2 3.5 4 .5-3.5 3 1 4z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  scale: "M12 3v18M3 7l9 4 9-4M3 7v4l9 4M21 7v4l-9 4",
  recycle: "M7 19H4.815a1.83 1.83 0 01-1.57-.881 1.785 1.785 0 01-.004-1.784L7.196 9.5M11.5 3l3.178 5.5M14.267 15.5H20.19a1.83 1.83 0 001.57-.886 1.785 1.785 0 00.004-1.784L19.806 9.5M8.5 21l3.178-5.5M4.935 14l1.58 2.5M18.477 9.5L16.9 12",
  leaf: "M11 20A7 7 0 019.8 6.9C15.5 2.5 21 4 21 4s1.5 5.5-2.8 11.2A7 7 0 0111 20zM6.5 12.5L11 20",
  clover: "M12 8a4 4 0 100-8 4 4 0 000 8zM8 12a4 4 0 10-8 0 4 4 0 008 0zM16 12a4 4 0 108 0 4 4 0 00-8 0zM12 16a4 4 0 100 8 4 4 0 000-8z",
  refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M22.99 14.01A9 9 0 0118.36 18.36L23 14",
  flask: "M9 3h6M10 3v5.2L5 18h14l-5-9.8V3",
  scroll: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
};

const certifications = [
  { name: "USDA Organic", icon: icons.globe, desc: "Compliance with United States Department of Agriculture organic standards." },
  { name: "EU Organic", icon: icons.award, desc: "European Union organic certification for export-grade produce." },
  { name: "Nepal Organic", icon: icons.flag, desc: "National organic certification through Nepal's accredited bodies." },
  { name: "Fair Trade", icon: icons.scale, desc: "Ethical sourcing and fair pricing standards for farmer welfare." },
];

const practices = [
  { title: "Composting & Vermicompost", desc: "On-farm organic matter recycling using aerobic composting and vermiculture for nutrient-rich soil amendments.", icon: icons.recycle },
  { title: "Bio-Pesticides", desc: "Neem-based, microbial, and botanical pesticide formulations that protect crops without synthetic chemicals.", icon: icons.leaf },
  { title: "Green Manuring", desc: "Cover crop rotation with leguminous species to fix atmospheric nitrogen and improve soil structure naturally.", icon: icons.clover },
  { title: "Crop Rotation Planning", desc: "Scientific rotation schedules that break pest cycles, balance soil nutrients, and maintain biodiversity.", icon: icons.refresh },
  { title: "Bio-Fertilizers", desc: "Rhizobium, Azotobacter, and mycorrhizal inoculants that enhance nutrient availability and root health.", icon: icons.flask },
  { title: "Organic Certification Support", desc: "End-to-end assistance with documentation, field inspections, and compliance for organic certification.", icon: icons.scroll },
];

const stats = [
  { value: "4.2K", label: "Organic Farmers", sub: "Certified Network" },
  { value: "100%", label: "Chemical Free", sub: "Zero Synthetics" },
  { value: "35%", label: "Price Premium", sub: "Market Advantage" },
  { value: "5", label: "Certifications", sub: "Global Standards" },
];

const organicProducts = [
  { title: "Organic Tea", img: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&q=80&w=400", desc: "High-altitude orthodox tea grown without synthetic inputs." },
  { title: "Organic Coffee", img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=400", desc: "Shade-grown arabica beans with full organic traceability." },
  { title: "Organic Spices", img: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=400", desc: "Cardamom, turmeric & ginger certified for global markets." },
];

export default function OrganicFarmingPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-emerald-100">
      <SubHeroSection
        title="Organic Farming"
        description="Championing chemical-free agriculture — certified organic inputs, sustainable practices, and premium market access for Nepali farmers."
        image="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=2000"
        tag="Certified Organic Supplies"
        stats={[
          { value: "4.2K", label: "Organic Farmers" },
          { value: "100%", label: "Chemical Free" },
        ]}
        btnText="Shop Organic"
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

        {/* Certifications */}
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
                Global Standards
              </span>
              <h2 className="text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-6">
                Certifications We Support
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                Our farmers gain access to the world&apos;s most recognized organic certifications, unlocking premium pricing and global market entry.
              </p>
              <div className="space-y-4">
                {certifications.map((cert, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-[#0891b2]/20 hover:bg-[#0891b2]/2 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-[#0891b2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                      <Icon d={cert.icon} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-[#0891b2] transition-colors">{cert.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{cert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-4xl overflow-hidden border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=800"
                  alt="Organic vegetable farm rows"
                  className="w-full aspect-4/5 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-10">
                <div className="text-[10px] font-bold text-[#0891b2] uppercase tracking-[2px] mb-1">Market Premium</div>
                <div className="text-2xl font-black">+35%</div>
                <div className="text-[10px] text-slate-400">Over Conventional</div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-16 w-full h-px bg-slate-100" />

        {/* Practices Grid */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
              Sustainable Methods
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Organic Practices</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
              Science-backed organic methods that nurture soil health and deliver premium produce.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((p, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-slate-100 hover:border-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 flex items-center justify-center mb-5 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                  <Icon d={p.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#0891b2] transition-colors">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        {/* Featured Organic Products */}
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
                Featured
              </span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Organic Product Lines</h2>
            </div>
            <Link href="/shop" className="text-sm font-bold text-[#0891b2] hover:text-[#0e7490] transition-colors flex items-center gap-1.5 shrink-0">
              View All Products <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {organicProducts.map((prod, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[28px] mb-6 aspect-square bg-slate-100">
                  <img src={prod.img} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-[#0a1628]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Certified Organic
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                      Explore <span>→</span>
                    </span>
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-1.5 group-hover:text-[#0891b2] transition-colors duration-300">{prod.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{prod.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        {/* Soil Health Dark Section */}
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
                  Our Philosophy
                </span>
                <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight leading-tight">Soil First. Always.</h2>
                <p className="text-white/50 mb-10 leading-relaxed text-[15px]">
                  Healthy soil is the foundation of organic agriculture. Our programs focus on rebuilding soil biology, increasing organic matter, and creating self-sustaining farm ecosystems.
                </p>
                <div className="space-y-5">
                  {[
                    { metric: "2.5x", label: "Soil microbial activity increase in year one" },
                    { metric: "40%", label: "Reduction in water usage through improved soil structure" },
                    { metric: "60%", label: "Lower input costs after three-year transition" },
                    { metric: "100%", label: "Traceability from farm to consumer" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-14 h-10 rounded-lg bg-[#0891b2]/10 border border-[#0891b2]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/20 transition-colors">
                        <span className="text-[#0891b2] text-xs font-black">{item.metric}</span>
                      </div>
                      <span className="text-white/70 text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative rounded-3xl overflow-hidden aspect-4/3">
                <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800" alt="Rich organic soil in hands" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#0a1628]/40" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-[2px]">Living Soil Program</span>
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
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-8 bg-[#0891b2]/10">
              Go Organic
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white tracking-tight">
              Start Your Organic Journey
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether transitioning from conventional farming or scaling an existing organic operation, we provide the inputs, expertise, and market access you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="px-10 py-4 bg-[#0891b2] text-white rounded-full font-bold text-sm hover:bg-[#0e7490] transition-colors duration-300">
                Shop Organic Supplies
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
