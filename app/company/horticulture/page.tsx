import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../../components/AnimatedClient";

export const metadata = {
  title: "Horticulture",
  description: "Fruits, flowers & vegetable production programs. Explore our horticulture solutions for modern Nepali agriculture.",
};

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  microscope: "M9 3h6M10 3v5.2L5 18h14l-5-9.8V3",
  droplet: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  thermometer: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  check: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
};

const segments = [
  { name: "Fruit Orchards", desc: "Apple, citrus, kiwi & stone fruit cultivation across diverse altitudes.", img: "https://images.unsplash.com/photo-1474564862106-1f23d10b9d72?auto=format&fit=crop&q=80&w=400" },
  { name: "Floriculture", desc: "Commercial flower farming — roses, gladiolus, marigold & orchids for domestic and export markets.", img: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&q=80&w=400" },
  { name: "Vegetable Farming", desc: "Year-round vegetable production through open-field and protected cultivation technologies.", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400" },
];

const techniques = [
  { title: "Protected Cultivation", desc: "Polyhouse, greenhouse, and shade-net structures for climate-controlled, high-value crop production year-round.", icon: icons.layers },
  { title: "Tissue Culture", desc: "Virus-free planting material produced in certified laboratories for superior crop health and uniformity.", icon: icons.microscope },
  { title: "Drip Fertigation", desc: "Precision delivery of water and nutrients directly to the root zone, improving efficiency by up to 60%.", icon: icons.droplet },
  { title: "Cold Storage Network", desc: "Multi-chamber cold stores maintaining optimal temperature and humidity for extended shelf life.", icon: icons.thermometer },
  { title: "Organic Certification", desc: "Support for obtaining organic and GAP certifications to access premium domestic and international markets.", icon: icons.check },
  { title: "Export Packaging", desc: "Modified atmosphere packaging and grading lines ensuring produce meets international quality standards.", icon: icons.package },
];

const stats = [
  { value: "2.8K", label: "Grower Network", sub: "Active Horticulturists" },
  { value: "18", label: "Crop Varieties", sub: "High-Value Focus" },
  { value: "65%", label: "Waste Reduction", sub: "Post-Harvest Tech" },
  { value: "7", label: "Export Markets", sub: "International Reach" },
];

export default function HorticulturePage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-green-100">
      <SubHeroSection
        title="Horticulture"
        description="Cultivating Nepal's horticultural potential — high-value fruits, flowers, and vegetables through science-backed growing practices."
        image="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000"
        tag="Fruits, Flowers & Vegetables"
        stats={[
          { value: "2.8K", label: "Grower Network" },
          { value: "18", label: "Crop Varieties" },
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

        {/* Segments — Visual Cards */}
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
                Our Verticals
              </span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Horticultural Segments</h2>
            </div>
            <Link href="/shop" className="text-sm font-bold text-[#0891b2] hover:text-[#0e7490] transition-colors flex items-center gap-1.5 shrink-0">
              View All Products <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {segments.map((seg, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[28px] mb-6 aspect-square bg-slate-100">
                  <img src={seg.img} alt={seg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-[#0a1628]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-5 left-5 right-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                      Explore <span>→</span>
                    </span>
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-1.5 group-hover:text-[#0891b2] transition-colors duration-300">{seg.name}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        <div className="mt-16 w-full h-px bg-slate-100" />

        {/* Techniques Grid */}
        <AnimatedDiv
          className="mt-12 sm:mt-14 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/20 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-5 bg-[#0891b2]/5">
              Advanced Techniques
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Growing Technologies</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
              Modern horticultural practices that maximize quality, yield, and market value.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techniques.map((tech, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-slate-100 hover:border-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0891b2]/10 flex items-center justify-center mb-5 group-hover:bg-[#0891b2]/15 transition-colors text-[#0891b2]">
                  <Icon d={tech.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#0891b2] transition-colors">{tech.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedDiv>

        {/* Seasonal Calendar — Dark */}
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
                <img src="https://images.unsplash.com/photo-1585500830955-1e0ea4d0b071?auto=format&fit=crop&q=80&w=800" alt="Modern greenhouse interior" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#0a1628]/40" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#0891b2] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-[2px]">Year-Round Production</span>
                  </div>
                </div>
              </div>
              <div className="text-white">
                <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-6 bg-[#0891b2]/10">
                  Planning
                </span>
                <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight leading-tight">Seasonal Crop Calendar</h2>
                <p className="text-white/50 mb-10 leading-relaxed text-[15px]">
                  Our agronomists plan cultivation schedules that ensure continuous production and market availability throughout the year.
                </p>
                <div className="space-y-5">
                  {[
                    { season: "Spring", crops: "Tomato, Capsicum, Cucumber, Beans" },
                    { season: "Summer", crops: "Mango, Litchi, Watermelon, Okra" },
                    { season: "Autumn", crops: "Apple, Cauliflower, Carrot, Radish" },
                    { season: "Winter", crops: "Strawberry, Peas, Broccoli, Leafy Greens" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-[#0891b2]/10 border border-[#0891b2]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0891b2]/20 transition-colors">
                        <span className="text-[#0891b2] text-xs font-black">{item.season[0]}</span>
                      </div>
                      <div>
                        <span className="font-bold text-white/90 text-sm block">{item.season}</span>
                        <span className="text-white/40 text-xs">{item.crops}</span>
                      </div>
                    </div>
                  ))}
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
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0891b2]/15 blur-[120px] rounded-full -ml-40 -mb-40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#0891b2]/30 text-[#0891b2] text-[11px] font-bold tracking-[3px] uppercase mb-8 bg-[#0891b2]/10">
              Grow With Us
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white tracking-tight">
              Cultivate Premium Produce
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Access advanced horticultural inputs, expert guidance, and premium market channels for your farm.
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
