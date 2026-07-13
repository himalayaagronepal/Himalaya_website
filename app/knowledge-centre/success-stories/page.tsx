import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';

const stories = [
  {
    title: 'Organic Tomato Cluster, Baglung',
    impact: '+32% yield',
    summary: 'A small farmer group improved harvest quality and market prices after adopting soil testing and compost-based nutrition.',
  },
  {
    title: 'Dairy Productivity Program, Chitwan',
    impact: '+18% milk output',
    summary: 'Training on feed balancing and hygiene helped a local dairy cooperative reduce losses and improve daily output.',
  },
  {
    title: 'Irrigation Upgrade, Pokhara Valley',
    impact: '40% water saved',
    summary: 'A drip irrigation pilot reduced water usage while keeping vegetables healthy through the dry season.',
  },
  {
    title: 'Post-Harvest Handling, Butwal',
    impact: 'Less spoilage',
    summary: 'Farmers adopted better sorting, grading, and packaging practices, resulting in fewer damaged produce lots.',
  },
  {
    title: 'Market Linkage Initiative, Kathmandu',
    impact: 'New buyers onboarded',
    summary: 'The program connected producer groups with repeat buyers, improving sales consistency and planning.',
  },
  {
    title: 'Organic Inputs Trial, Nawalparasi',
    impact: 'Better soil health',
    summary: 'A field trial using compost and bio-inputs showed stronger plant growth and improved field resilience.',
  },
];

export default function SuccessStoriesPage() {
  return (
    <>
      <SubHeroSection
        title="Success Stories"
        tag="Knowledge Centre"
        description="Real-world case studies and outcomes from farms, cooperatives, and field programs will be showcased here."
        image="https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Case Studies"
            title="Outcomes that can be measured"
            description="This grid is built for CMS-managed stories so the admin can update the success outcomes without changing the page layout."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <article key={story.title} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.1)]">
                <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {story.impact}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {story.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{story.summary}</p>
                <div className="mt-6 border-t border-slate-100 pt-4 text-sm font-semibold text-[#0d837f]">
                  CMS story slot
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
