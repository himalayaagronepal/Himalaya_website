import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';
import TeamMemberCard, { TeamMember } from '../../components/TeamMemberCard';
import connectToDatabase from '../../../lib/mongodb';
import ExecutiveSettings, { EXECUTIVE_DEFAULTS } from '../../../models/ExecutiveSettings';

export const dynamic = "force-dynamic";

async function getSettings() {
  try {
    await connectToDatabase();
    const doc = await ExecutiveSettings.findOne({ singletonKey: "executive" }).lean();
    if (doc) return {
      heroTitle: doc.heroTitle || EXECUTIVE_DEFAULTS.heroTitle,
      heroAccent: doc.heroAccent || undefined,
      heroTag: doc.heroTag || EXECUTIVE_DEFAULTS.heroTag,
      heroDescription: doc.heroDescription || EXECUTIVE_DEFAULTS.heroDescription,
      heroImage: doc.heroImage || EXECUTIVE_DEFAULTS.heroImage,
      eyebrow: doc.eyebrow || EXECUTIVE_DEFAULTS.eyebrow,
      sectionTitle: doc.sectionTitle || EXECUTIVE_DEFAULTS.sectionTitle,
      sectionDescription: doc.sectionDescription || EXECUTIVE_DEFAULTS.sectionDescription,
      members: Array.isArray(doc.members) && doc.members.length > 0
        ? doc.members.map((m: any) => ({ name: m.name, role: m.role, image: m.image, phone: m.phone, email: m.email, address: m.address }))
        : EXECUTIVE_DEFAULTS.members,
    };
  } catch (_) {}
  return {
    heroTitle: EXECUTIVE_DEFAULTS.heroTitle,
    heroAccent: undefined,
    heroTag: EXECUTIVE_DEFAULTS.heroTag,
    heroDescription: EXECUTIVE_DEFAULTS.heroDescription,
    heroImage: EXECUTIVE_DEFAULTS.heroImage,
    eyebrow: EXECUTIVE_DEFAULTS.eyebrow,
    sectionTitle: EXECUTIVE_DEFAULTS.sectionTitle,
    sectionDescription: EXECUTIVE_DEFAULTS.sectionDescription,
    members: EXECUTIVE_DEFAULTS.members,
  };
}

export default async function ExecutiveTeamPage() {
  const s = await getSettings();
  const members: TeamMember[] = s.members.map((m: any) => ({
    name: m.name, role: m.role, image: m.image || '', phone: m.phone || '', email: m.email || '', address: m.address || '',
  }));

  return (
    <>
      <SubHeroSection
        title={s.heroTitle}
        accent={s.heroAccent}
        tag={s.heroTag}
        description={s.heroDescription}
        image={s.heroImage}
      />

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={s.eyebrow}
            title={s.sectionTitle}
            description={s.sectionDescription}
          />

          <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member, i) => (
              <TeamMemberCard key={`${member.name}-${i}`} member={member} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
