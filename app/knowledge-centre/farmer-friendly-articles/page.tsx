import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';

const articles = [
  {
    title: 'How to Plan a Healthy Seedbed',
    topic: 'Crop Establishment',
    readTime: '5 min read',
    summary: 'A simple walkthrough for preparing seedbeds with the right moisture, spacing, and early care.',
  },
  {
    title: 'Best Practices for Compost Use',
    topic: 'Soil Health',
    readTime: '7 min read',
    summary: 'Learn how to prepare, store, and apply compost for stronger soil structure and better yields.',
  },
  {
    title: 'Protecting Crops During Rainy Season',
    topic: 'Risk Management',
    readTime: '6 min read',
    summary: 'Field-friendly advice on drainage, disease monitoring, and low-cost protection methods during heavy rain.',
  },
  {
    title: 'Simple Record-Keeping for Small Farms',
    topic: 'Farm Business',
    readTime: '4 min read',
    summary: 'Track expenses, harvests, and sales with easy record-keeping formats that can scale with your business.',
  },
  {
    title: 'Choosing the Right Crop for the Season',
    topic: 'Planning',
    readTime: '5 min read',
    summary: 'A practical article that helps farmers match crop selection to market demand, climate, and soil conditions.',
  },
  {
    title: 'Reducing Post-Harvest Losses',
    topic: 'Storage',
    readTime: '6 min read',
    summary: 'Practical ideas for sorting, handling, and storing produce so more of the harvest reaches the market.',
  },
];

export default function FarmerFriendlyArticlesPage() {
  return (
    <>
      <SubHeroSection
        title="Farmer-Friendly Articles"
        tag="Knowledge Centre"
        description="Short, practical reads designed to answer day-to-day farm questions in simple, accessible language."
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Practical Reading"
            title="Easy-to-read farm guidance"
            description="These article cards are dummy CMS content that can later be swapped with administrator-managed posts."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => (
              <article key={article.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-[#0d837f]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d837f]">
                    {article.topic}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span>{article.readTime}</span>
                  <span className="font-semibold text-[#0d837f]">CMS ready</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
