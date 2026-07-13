import Link from "next/link";
import SubHeroSection from "../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../components/AnimatedClient";

export const metadata = {
  title: "Investor Relations",
  description:
    "Explore investment opportunities, financial performance, and shareholder information for Himalaya Nepal Agriculture.",
};

const highlights = [
  { metric: "24.09%", label: "GDP Contribution", description: "Agriculture's share of Nepal's national GDP" },
  { metric: "156K", label: "Hectares Monitored", description: "Precision-managed farmland under our network" },
  { metric: "340+", label: "Partner Farms", description: "Across 12 countries and growing" },
  { metric: "45%", label: "Water Savings", description: "Compared to traditional farming methods" },
];

const financials = [
  { year: "FY 2025", revenue: "NPR 1.2B", growth: "+34%", ebitda: "NPR 180M" },
  { year: "FY 2024", revenue: "NPR 890M", growth: "+28%", ebitda: "NPR 125M" },
  { year: "FY 2023", revenue: "NPR 695M", growth: "+22%", ebitda: "NPR 92M" },
];

const whyInvest = [
  {
    title: "Massive Market Opportunity",
    description:
      "Nepal's agricultural sector supports 57.3% of the population yet remains under-digitized for large-scale growth.",
    icon: "01",
  },
  {
    title: "Government-Backed Strategy",
    description:
      "Aligned with the Agriculture Development Strategy (2015-2035) and national priorities for land reform.",
    icon: "02",
  },
  {
    title: "Technology-First Approach",
    description:
      "IoT sensors, AI-driven yield optimization, and digital logistics create defensible advantages.",
    icon: "03",
  },
  {
    title: "Export-Ready Infrastructure",
    description:
      "Cold-chain logistics, quality testing labs, and global shipping partnerships enable premium pricing.",
    icon: "04",
  },
];

const investors = [
  {
    name: "Himalaya Growth Partners",
    type: "Growth Equity",
    focus: "Agri-tech, supply chain",
    ticket: "NPR 120M - 240M",
    location: "Kathmandu, NP",
    since: "2022",
    logo:
      "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Peak Ridge Capital",
    type: "Institutional",
    focus: "Sustainable food systems",
    ticket: "NPR 200M - 480M",
    location: "Singapore",
    since: "2023",
    logo:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Terai Impact Fund",
    type: "Impact Fund",
    focus: "Smallholder enablement",
    ticket: "NPR 60M - 120M",
    location: "Biratnagar, NP",
    since: "2021",
    logo:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Summit Ridge Ventures",
    type: "Venture",
    focus: "AI + IoT agriculture",
    ticket: "NPR 40M - 90M",
    location: "Bengaluru, IN",
    since: "2024",
    logo:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Himalaya Cooperative Bank",
    type: "Strategic",
    focus: "Rural finance",
    ticket: "NPR 80M - 150M",
    location: "Pokhara, NP",
    since: "2020",
    logo:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Riverstone Climate Capital",
    type: "Climate",
    focus: "Water + soil health",
    ticket: "NPR 100M - 210M",
    location: "London, UK",
    since: "2024",
    logo:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200",
  },
];

const team = [
  {
    name: "Anita Sharma",
    role: "Chief Executive Officer",
    focus: "Strategy, partnerships",
    since: "2018",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Ravi Karki",
    role: "Chief Financial Officer",
    focus: "Capital planning, reporting",
    since: "2020",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Meera Adhikari",
    role: "VP, Operations",
    focus: "Supply chain, QA",
    since: "2019",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sanjay Bista",
    role: "VP, Technology",
    focus: "IoT, data platform",
    since: "2021",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=800",
  },
];

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
  viewport: { once: true, amount: 0.2 },
};

const gridMotion = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
  viewport: { once: true, amount: 0.2 },
};

export default function InvestorPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-sky-100">
      <SubHeroSection
        title="Investor Relations"
        description="Transparent growth. Strategic vision. Join us in transforming Nepal's agricultural future."
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
        tag="Growth & Opportunity"
        stats={[
          { value: "NPR 1.2B", label: "FY 2025 Revenue" },
          { value: "+34%", label: "YoY Growth" },
        ]}
        btnText="Contact IR Team"
        btnHref="/contact"
      />

      <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 xl:px-10 mb-14 sm:mb-16 lg:mb-20">
        <AnimatedSection className="mt-10 sm:mt-12 lg:mt-16" {...sectionMotion}>
          <span className="text-sky-600 font-bold tracking-widest text-xs uppercase mb-4 block">
            At a Glance
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-8 sm:mb-12">Investment Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {highlights.map((item) => (
              <AnimatedDiv
                key={item.label}
                {...gridMotion}
                className="p-8 border border-slate-100 rounded-3xl bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0891b2] mb-2">{item.metric}</p>
                <p className="text-sm font-bold uppercase tracking-tight text-slate-800 mb-1">
                  {item.label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </AnimatedDiv>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-16" {...sectionMotion}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <span className="text-sky-600 font-bold tracking-widest text-xs uppercase mb-3 block">
                Investor Network
              </span>
              <h2 className="text-3xl font-black">Featured Investors</h2>
              <p className="text-sm text-slate-500 mt-3 max-w-2xl">
                A mix of institutional, strategic, and impact partners backing long-term agricultural transformation.
              </p>
            </div>
            <div className="text-xs text-slate-400">Dummy profiles for layout only</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((investor) => (
              <AnimatedDiv
                key={investor.name}
                {...gridMotion}
                className="group p-6 rounded-3xl border border-slate-100 bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
                  <img
                    src="/logo.jpeg"
                    alt="Photo not found"
                    className="w-full h-full object-cover opacity-25"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Photo not found
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{investor.name}</h3>
                  <span className="text-[11px] uppercase tracking-widest text-slate-400">Since {investor.since}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {investor.type} · {investor.location}
                </p>
                <div className="mt-4 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Focus</span>
                    <span className="font-semibold text-slate-700">{investor.focus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ticket size</span>
                    <span className="font-semibold text-slate-700">{investor.ticket}</span>
                  </div>
                </div>
                <div className="mt-5 text-xs text-slate-400">Strategic partner</div>
              </AnimatedDiv>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-16" {...sectionMotion}>
          <div className="relative overflow-hidden rounded-[48px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-10 lg:p-16">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-200/40 blur-[90px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-200/30 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              <div className="max-w-xl">
                <span className="text-sky-600 font-bold tracking-widest text-xs uppercase mb-3 block">
                  Why Invest
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
                  A disciplined growth engine for Nepal's next agri export cycle.
                </h2>
                <p className="text-sm text-slate-500 mt-4">
                  We combine reliable supply chains, climate-smart operations, and brand-ready exports to deliver
                  resilient growth.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {whyInvest.map((item) => (
                  <AnimatedDiv
                    key={item.title}
                    {...gridMotion}
                    className="flex gap-4 p-5 bg-white/80 border border-white rounded-2xl shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold tracking-wide">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                    </div>
                  </AnimatedDiv>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-16" {...sectionMotion}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <span className="text-sky-600 font-bold tracking-widest text-xs uppercase mb-3 block">
                Leadership
              </span>
              <h2 className="text-3xl font-black">Our Team</h2>
              <p className="text-sm text-slate-500 mt-3 max-w-2xl">
                Experienced operators and builders focused on resilient growth and disciplined execution.
              </p>
            </div>
            <div className="text-xs text-slate-400">Investor relations leads</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <AnimatedDiv
                key={member.name}
                {...gridMotion}
                className="p-6 rounded-3xl border border-slate-100 bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
                  <img
                    src="/logo.jpeg"
                    alt="Photo not found"
                    className="w-full h-full object-cover opacity-25"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Photo not found
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{member.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{member.role}</p>
                <div className="mt-4 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Focus</span>
                    <span className="font-semibold text-slate-700">{member.focus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Since</span>
                    <span className="font-semibold text-slate-700">{member.since}</span>
                  </div>
                </div>
              </AnimatedDiv>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-16" {...sectionMotion}>
          <span className="text-sky-600 font-bold tracking-widest text-xs uppercase mb-4 block">
            Financial Performance
          </span>
          <h2 className="text-3xl font-black mb-10">Revenue & Growth</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {financials.map((row) => (
              <AnimatedDiv
                key={row.year}
                {...gridMotion}
                className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="text-xs uppercase tracking-widest text-slate-400">{row.year}</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{row.revenue}</div>
                <div className="mt-2 text-sm text-emerald-600 font-semibold">{row.growth} YoY</div>
                <div className="mt-4 text-xs text-slate-400">EBITDA</div>
                <div className="text-sm font-semibold text-slate-700">{row.ebitda}</div>
              </AnimatedDiv>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-16" {...sectionMotion}>
          <div className="p-12 lg:p-20 border border-slate-100 rounded-[60px] text-center bg-white">
            <h2 className="text-3xl font-black mb-4">Ownership Structure</h2>
            <p className="text-slate-500 mb-12 max-w-xl mx-auto">
              A transparent governance model that balances founder vision with public accountability.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-16">
              <AnimatedDiv
                {...gridMotion}
                className="w-48 h-48 rounded-full border-[10px] border-slate-900 flex items-center justify-center relative"
              >
                <span className="text-2xl font-black">80%</span>
                <span className="absolute -bottom-8 text-xs font-bold text-slate-400 uppercase">Founders</span>
              </AnimatedDiv>
              <AnimatedDiv
                {...gridMotion}
                className="w-48 h-48 rounded-full border-[10px] border-sky-400 flex items-center justify-center relative"
              >
                <span className="text-2xl font-black">20%</span>
                <span className="absolute -bottom-8 text-xs font-bold text-slate-400 uppercase">Public</span>
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection
          className="mt-16 text-center py-16 bg-slate-900 rounded-[60px] text-white overflow-hidden relative"
          {...sectionMotion}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-6 sm:mb-8 relative z-10 px-2">Ready to Grow With Us?</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Connect with our investor relations team to learn more about partnership opportunities and upcoming funding
            rounds.
          </p>
          <Link
            href="/contact"
            className="px-12 py-5 bg-white text-slate-900 rounded-full font-bold hover:bg-sky-500 hover:text-white transition-all relative z-10"
          >
            Contact Investor Relations
          </Link>
        </AnimatedSection>
      </div>
    </main>
  );
}
