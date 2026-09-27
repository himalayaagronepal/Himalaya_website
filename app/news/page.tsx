import Link from "next/link";
import SubHeroSection from "../components/SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "../components/AnimatedClient";
import { agmNews, agmNewsHref } from "../../lib/agm-notice";
export const metadata = {
  title: "News",
  description:
    "Latest news, updates, and announcements from Himalaya Nepal Agriculture.",
    };

const featuredArticle = {
  title: agmNews.title,
  date: new Date(agmNews.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
  category: agmNews.category,
  excerpt: agmNews.excerpt,
  image: agmNews.coverImage,
};

const previousFeaturedArticle = {
  title: "Himalaya Nepal Agriculture Expands Precision Farming to 12 New Districts",
  date: "February 10, 2026",
  category: "Expansion",
  excerpt:
    "Our IoT sensor network now covers over 156,000 hectares across Nepal, bringing real-time soil health monitoring and AI-driven crop recommendations to thousands of smallholder farmers in previously underserved regions.",
  image:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200",
};

const articles = [
  previousFeaturedArticle,
  {
    title: "Partnership With Global Organic Certification Body Announced",
    date: "January 28, 2026",
    category: "Partnership",
    excerpt:
      "A new partnership will streamline organic certification for our partner farms, opening doors to premium European and North American markets.",
    image:
      "https://images.unsplash.com/photo-1589923188651-268a9765e432?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "FY 2025 Revenue Surpasses NPR 1.2 Billion Mark",
    date: "January 15, 2026",
    category: "Financial",
    excerpt:
      "Strong demand for export-grade large cardamom and orthodox tea drove a 34% year-over-year revenue increase.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "New Cold-Chain Logistics Hub Opens in Biratnagar",
    date: "December 20, 2025",
    category: "Infrastructure",
    excerpt:
      "The state-of-the-art facility reduces post-harvest losses by up to 40% and supports year-round export operations.",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Farmer Welfare Fund Distributes NPR 50M in Crop Insurance Payouts",
    date: "December 5, 2025",
    category: "Community",
    excerpt:
      "Over 2,000 smallholder farmers received insurance payouts following unseasonal rainfall, safeguarding their livelihoods.",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "AI-Driven Yield Prediction Model Achieves 98% Accuracy",
    date: "November 18, 2025",
    category: "Technology",
    excerpt:
      "Our machine learning models now predict crop yields with near-perfect accuracy, enabling better resource planning for the upcoming season.",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Himalaya Nepal Agriculture Wins National Innovation Award",
    date: "November 2, 2025",
    category: "Awards",
    excerpt:
      "Recognized by the Ministry of Agriculture for pioneering digital logistics and traceability systems in Nepal's agri-export sector.",
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=600",
  },
];

const categoryColors: Record<string, string> = {
  Expansion: "bg-sky-100 text-sky-700",
  Partnership: "bg-emerald-100 text-emerald-700",
  Financial: "bg-amber-100 text-amber-700",
  Infrastructure: "bg-violet-100 text-violet-700",
  Community: "bg-rose-100 text-rose-700",
  Technology: "bg-cyan-100 text-cyan-700",
  Awards: "bg-yellow-100 text-yellow-700",
};
export default function NewsPage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-sky-100">
      <SubHeroSection
        title="News & Updates"
        description="Stay up to date with the latest developments, milestones, and stories from Himalaya Nepal Agriculture."
        image="https://images.unsplash.com/photo-1586339949216-35c2747cc36d?auto=format&fit=crop&q=80&w=2000"
        tag="Latest From HNA"
        stats={[
          { value: "340+", label: "Partner Farms" },
          { value: "156K", label: "Hectares" },
        ]}
      />

      <div className="max-w-[1650px] mx-auto px-6 pb-20">
        {/* Featured Article */}
        <AnimatedSection className="mt-16">
          <span className="text-sky-600 font-bold tracking-widest text-xs uppercase mb-4 block">
            Featured Story
          </span>
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-slate-50/50 border border-slate-100 rounded-[40px] overflow-hidden">
            <Link href={agmNewsHref} className="flex h-80 items-center justify-center overflow-hidden bg-white p-3 lg:h-full lg:max-h-[600px]">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-contain"
              />
            </Link>
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${categoryColors[featuredArticle.category] || "bg-slate-100 text-slate-600"}`}
                >
                  {featuredArticle.category}
                </span>
                <span className="text-xs text-slate-400">
                  {featuredArticle.date}
                </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black leading-tight mb-4">
                {featuredArticle.title}
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                {featuredArticle.excerpt}
              </p>
              <Link href={agmNewsHref} className="text-sm font-bold text-[#0891b2] hover:underline">
                Read Full Notice →
              </Link>
            </div>
          </div>
          </AnimatedSection>

        {/* All Articles Grid */}
        <AnimatedSection className="mt-16">
          <h2 className="text-3xl font-black mb-12">Latest News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <AnimatedDiv key={i}>
                <article className="group cursor-pointer h-full flex flex-col border border-slate-100 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${categoryColors[article.category] || "bg-slate-100 text-slate-600"}`}
                      >
                        {article.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {article.date}
                      </span>
                         </div>
                          <h3 className="text-lg font-bold leading-snug mb-3 group-hover:text-[#0891b2] transition-colors duration-200">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed flex-1">
                      {article.excerpt}
                    </p>
                    <span className="text-sm font-bold text-[#0891b2] mt-4 inline-block">
                      Read More →
                    </span>
                  </div>
                </article>
              </AnimatedDiv>
            ))}
          </div>
          </AnimatedSection>

        {/* Newsletter CTA */}
        <AnimatedSection className="mt-16 text-center py-16 px-8 bg-slate-900 rounded-[60px] text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full -ml-32 -mt-32" />
          <h2 className="text-4xl sm:text-5xl font-black mb-6 relative z-10">
            Stay Informed
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
            Subscribe to receive the latest updates, reports, and announcements
            directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-400 transition-colors"
            />
            <button className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-sky-500 hover:text-white transition-all">
              Subscribe
            </button>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
