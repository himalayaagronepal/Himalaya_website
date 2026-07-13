import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../../components/AnimatedClient";

export const metadata = {
  title: "Dairy & Livestock",
  description: "Animal husbandry products, veterinary care, and livestock management solutions for sustainable dairy and meat production.",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",
  feather: "M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5zM16 8L2 22M17.5 15H9",
  mountain: "M8 21l4-10 4 10M12 11V3M3 21h18",
  target: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6a6 6 0 100 12 6 6 0 000-12zM12 10a2 2 0 100 4 2 2 0 000-4z",
  droplet: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  hexagon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  medkit: "M3 7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM8 5V3a2 2 0 012-2h4a2 2 0 012 2v2M12 11v4M10 13h4",
  leaf: "M11 20A7 7 0 019.8 6.9C15.5 2.5 21 4 21 4s1.5 5.5-2.8 11.2A7 7 0 0111 20zM6.5 12.5L11 20",
  dna: "M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6M9 3v18M15 3v18",
  snowflake: "M12 2v20M17 7l-5 5-5-5M7 17l5-5 5 5M2 12h20M7 7l-5 5 5 5M17 7l5 5-5 5",
};

const livestockSegments = [
  { name: "Dairy Farming", icon: icons.droplet, desc: "High-yield dairy breeds, feed supplements, and milk processing technology." },
  { name: "Poultry Production", icon: icons.feather, desc: "Broiler and layer farming solutions with biosecurity-first management." },
  { name: "Goat & Sheep", icon: icons.mountain, desc: "Breed improvement programs and pasture management for hill farming." },
  { name: "Cattle Rearing", icon: icons.heart, desc: "Nutritional plans, breeding services, and health monitoring systems." },
  { name: "Fisheries", icon: icons.target, desc: "Freshwater aquaculture, pond management, and fingerling supply." },
  { name: "Bee Keeping", icon: icons.hexagon, desc: "Apiary management, honey processing, and pollination services." },
];

const services = [
  { title: "Veterinary Care Network", desc: "24/7 access to certified veterinarians through our mobile clinic network spanning all 7 provinces.", icon: icons.medkit },
  { title: "Feed & Nutrition", desc: "Scientifically formulated animal feed with balanced macro and micronutrients for optimal growth and production.", icon: icons.leaf },
  { title: "Breed Improvement", desc: "Artificial insemination services and genetic counseling for progressive breed enhancement and disease resistance.", icon: icons.dna },
  { title: "Cold Chain & Processing", desc: "Chilling centers, pasteurization units, and packaging facilities ensuring farm-fresh quality reaches consumers.", icon: icons.snowflake },
];

const stats = [
  { value: "8.5K", label: "Dairy Farmers", sub: "Active Network" },
  { value: "24/7", label: "Vet Support", sub: "Mobile Clinics" },
  { value: "95%", label: "Survival Rate", sub: "Livestock Health" },
  { value: "120+", label: "Collection Points", sub: "Across Nepal" },
];

export default function DairyLivestockPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-amber-100">
      <SubHeroSection
        title="Dairy & Livestock"
        description="Building a resilient animal husbandry ecosystem — from breed selection and veterinary care to processing and market distribution."
        image="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=2000"
        tag="Animal Husbandry Products"
        stats={[
          { value: "8.5K", label: "Dairy Farmers" },
          { value: "120+", label: "Collection Points" },
        ]}
        btnText="View Products"
        btnHref="/shop"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-14 sm:mb-16 lg:mb-20">

        {/* Stats */}
        <AnimatedSection
          className="mt-10 sm:mt-12 lg:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-5 sm:p-6 lg:p-8 border border-slate-100 rounded-2xl sm:rounded-3xl hover:shadow-lg transition-shadow duration-300">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0891b2] mb-2">{stat.value}</p>
                <p className="text-sm font-bold uppercase tracking-tight text-slate-800 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{stat.sub}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Livestock Segments */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
              Livestock Verticals
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight px-2">Our Livestock Programs</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
              Comprehensive support across six major animal husbandry segments.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {livestockSegments.map((seg, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0891b2]/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                  <Icon d={seg.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#0891b2] transition-colors">{seg.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        <div className="mt-16 w-full h-px bg-slate-100" />

        {/* Services Two-Column */}
        <AnimatedSection
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="relative">
              <div className="rounded-4xl overflow-hidden border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800"
                  alt="Cows grazing on green pasture"
                  className="w-full aspect-4/5 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-10">
                <div className="text-[10px] font-bold text-[#0891b2] uppercase tracking-[2px] mb-1">Daily Collection</div>
                <div className="text-2xl font-black">45K L</div>
                <div className="text-[10px] text-slate-400">Milk Per Day</div>
              </div>
            </div>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 bg-[#0891b2]/5">
                Core Services
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight mb-4 sm:mb-6">
                End-to-End Livestock Support
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                From farm-gate veterinary services to cold-chain processing, we cover the full value chain.
              </p>
              <div className="space-y-4">
                {services.map((svc, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-[#0891b2]/20 hover:bg-[#0891b2]/2 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-[#0891b2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                      <Icon d={svc.icon} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-[#0891b2] transition-colors">{svc.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{svc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Value Chain Dark Section */}
        <AnimatedSection
          className="mt-12 sm:mt-14 lg:mt-20 p-1.5 sm:p-2 rounded-3xl sm:rounded-[48px] bg-[#0a1628] overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="p-6 sm:p-10 lg:p-16 rounded-2xl sm:rounded-[40px] border border-white/6">
            <div className="text-center text-white mb-10 sm:mb-14">
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-4 sm:mb-6 bg-[#0891b2]/10">
                Value Chain
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight px-2">Farm to Consumer Pipeline</h2>
              <p className="text-white/40 mt-3 max-w-xl mx-auto text-sm sm:text-[15px] px-2">Quality assurance at every touchpoint in the dairy and livestock supply chain.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "01", title: "Farm Collection", desc: "Daily pickup from registered farms with quality checks." },
                { step: "02", title: "Chilling & Testing", desc: "Rapid chilling and lab-grade quality analysis." },
                { step: "03", title: "Processing", desc: "Pasteurization, packaging, and value-added products." },
                { step: "04", title: "Distribution", desc: "Cold-chain delivery to retail and institutional buyers." },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/3 border border-white/6 hover:bg-white/6 transition-colors duration-300">
                  <span className="text-[#0891b2] text-sm font-black block mb-3">{item.step}</span>
                  <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection
          className="mt-12 sm:mt-14 lg:mt-20 relative text-center py-14 sm:py-20 lg:py-24 rounded-3xl sm:rounded-[48px] overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute inset-0 bg-[#0a1628]" />
          <div className="absolute inset-px rounded-[calc(1.5rem-1px)] sm:rounded-[47px] border border-white/6 pointer-events-none" />
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#0891b2]/15 blur-[120px] rounded-full -ml-40 -mt-40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 sm:mb-8 bg-[#0891b2]/10">
              Partner With Us
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 sm:mb-6 text-white tracking-tight">
              Strengthen Your Livestock Operation
            </h2>
            <p className="text-white/50 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our network of dairy farmers and livestock producers for access to premium inputs, veterinary care, and guaranteed markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/shop" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-[#0891b2] text-white rounded-full font-bold text-sm hover:bg-[#0e7490] transition-colors duration-300">
                Browse Products
              </Link>
              <Link href="/contact" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
