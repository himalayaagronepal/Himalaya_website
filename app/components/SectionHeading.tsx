import React from 'react';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-[#059669]">{eyebrow}</p>
      <h2
        className="mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {title}
      </h2>
      <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}