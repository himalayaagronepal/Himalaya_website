import React from 'react';
import { CalendarDays, FileText, Image as ImageIcon, Paperclip } from 'lucide-react';
import SubHeroSection from '../components/SubHeroSection';
import SectionHeading from '../components/SectionHeading';
import currentNotices from '../../lib/current-notices.json';

const notices = currentNotices.notices.map((notice) => ({
  ...notice,
  image: notice.previewImages[0],
  format: notice.fileUrl ? 'PDF attachment' : notice.type,
}));

export default function NoticesPage() {
  return (
    <>
      <SubHeroSection
        title="Notices"
        tag="News & Notices"
        description="Official notices can be published as posters, PDFs, or attachments, depending on what the admin uploads."
        image="https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Notice Board"
            title="Uploaded notices and announcements"
            description="Read our latest official notice and vacancy announcement."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {notices.map((notice) => (
              <article key={notice.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_16px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.1)]">
                {notice.image ? (
                  <a href={notice.image} target="_blank" rel="noopener noreferrer" aria-label={`${notice.title} — open full-resolution image`} className="relative block h-80 overflow-hidden bg-white p-3">
                    <img src={notice.image} alt={notice.titleNe || notice.title} className="h-full w-full object-contain" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-800">
                      <ImageIcon className="h-4 w-4 text-[#0d837f]" />
                      {notice.format}
                    </div>
                  </a>
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
                    <div className="text-center">
                      <Paperclip className="mx-auto h-12 w-12 text-white/85" />
                      <div className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                        {notice.format}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d837f]">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(notice.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {notice.title}
                  </h3>
                  {notice.titleNe ? <p lang="ne" className="mt-2 text-lg font-semibold text-slate-800">{notice.titleNe}</p> : null}
                  <p className="mt-3 text-sm leading-6 text-slate-600">{notice.excerpt}</p>

                  {notice.fileUrl ? (
                    <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0d837f]" />
                        <span>{notice.fileUrl.split('/').pop()}</span>
                      </div>
                      <span className="font-semibold text-[#0d837f]">Open PDF</span>
                    </a>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      {notice.type}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
