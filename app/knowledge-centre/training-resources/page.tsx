import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';

const trainingResources = [
  {
    title: 'Field Training Handbook',
    type: 'PDF Guide',
    duration: '48 pages',
    summary: 'A practical handbook covering crop planning, input handling, and post-harvest handling for field teams.',
    color: 'from-emerald-600 via-teal-600 to-cyan-600',
  },
  {
    title: 'Irrigation Basics Workshop',
    type: 'Workshop Recording',
    duration: '32 min',
    summary: 'Step-by-step training on irrigation scheduling, pump safety, and water-use efficiency for farmers.',
    color: 'from-sky-600 via-blue-600 to-indigo-600',
  },
  {
    title: 'Organic Certification Checklist',
    type: 'Checklist',
    duration: 'Quick reference',
    summary: 'A concise checklist for farms preparing documentation and field records for organic certification.',
    color: 'from-amber-600 via-orange-500 to-rose-500',
  },
  {
    title: 'Dairy Farm SOP Pack',
    type: 'Document Pack',
    duration: '6 documents',
    summary: 'Standard operating procedures for dairy hygiene, feeding, record keeping, and cold-chain handling.',
    color: 'from-slate-700 via-slate-800 to-slate-900',
  },
  {
    title: 'Post-Harvest Video Series',
    type: 'Video Series',
    duration: '4 episodes',
    summary: 'Short training videos on grading, sorting, storage, and market-ready packaging for produce.',
    color: 'from-lime-600 via-green-600 to-emerald-600',
  },
  {
    title: 'Pest Monitoring Template',
    type: 'Template',
    duration: 'Editable sheet',
    summary: 'A reusable monitoring template for scouting pests, logging observations, and tracking interventions.',
    color: 'from-violet-600 via-fuchsia-600 to-pink-600',
  },
];

export default function TrainingResourcesPage() {
  return (
    <>
      <SubHeroSection
        title="Training Resources"
        tag="Knowledge Centre"
        description="CMS-managed guides, workshops, and learning materials will live here for farmers, staff, and partner networks."
        image="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="CMS Resources"
            title="Training materials and downloads"
            description="These cards are dummy content for now and can be replaced by admin-uploaded PDFs, videos, and templates later."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trainingResources.map((resource) => (
              <article key={resource.title} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.1)]">
                <div className={`h-32 bg-gradient-to-br ${resource.color} p-5 text-white`}>
                  <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    {resource.type}
                  </div>
                  <div className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    Ready for CMS upload
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {resource.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{resource.summary}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <span>{resource.duration}</span>
                    <span className="font-semibold text-[#0d837f]">CMS editable</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
