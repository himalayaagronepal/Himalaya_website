import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';

const publications = [
  {
    title: 'Annual Impact Report 2025',
    kind: 'Publication',
    details: '92 pages · PDF',
    summary: 'A yearly summary of program reach, farming outcomes, and organisational highlights.',
  },
  {
    title: 'Field Manual for Vegetable Production',
    kind: 'Guide',
    details: '48 pages · PDF',
    summary: 'Practical guidance for land preparation, nursery management, fertiliser use, and harvesting.',
  },
  {
    title: 'Crop Advisory Bulletin Q1',
    kind: 'Bulletin',
    details: '16 pages · PDF',
    summary: 'Seasonal advisory notes, weather-aware recommendations, and input planning tips for farmers.',
  },
  {
    title: 'Research Note: Soil Health',
    kind: 'Document',
    details: '12 pages · PDF',
    summary: 'A short technical note summarising soil health observations and recommended next steps.',
  },
  {
    title: 'Training Deck: Post-Harvest Care',
    kind: 'Presentation',
    details: '22 slides · PPT',
    summary: 'A downloadable presentation intended for training sessions and field demonstrations.',
  },
  {
    title: 'Policy Brief: Market Access',
    kind: 'Brief',
    details: '8 pages · PDF',
    summary: 'A concise policy brief exploring routes to better farm-gate market access and coordination.',
  },
];

export default function PublicationsDocumentsPage() {
  return (
    <>
      <SubHeroSection
        title="Publications & Documents"
        tag="Knowledge Centre"
        description="Admin-uploaded PDFs, reports, presentations, and supporting documents will be collected in one place."
        image="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Document Library"
            title="Publications and downloads"
            description="These are dummy cards for now, ready to be replaced by admin-managed uploads from the CMS."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {publications.map((item, index) => (
              <article key={item.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-[#0d837f]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d837f]">
                    {item.kind}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span>{item.details}</span>
                  <span className="font-semibold text-[#0d837f]">CMS upload</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
