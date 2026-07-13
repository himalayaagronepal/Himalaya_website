import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';
import TeamMemberCard, { TeamMember } from '../../components/TeamMemberCard';
import connectToDatabase from '../../../lib/mongodb';
import BoardSettings, { BOARD_DEFAULTS } from '../../../models/BoardSettings';

export const dynamic = "force-dynamic";

async function getSettings() {
  try {
    await connectToDatabase();
    const doc = await BoardSettings.findOne({ singletonKey: "board" }).lean();
    if (doc) return {
      heroTitle: doc.heroTitle || BOARD_DEFAULTS.heroTitle,
      heroAccent: doc.heroAccent || undefined,
      heroTag: doc.heroTag || BOARD_DEFAULTS.heroTag,
      heroDescription: doc.heroDescription || BOARD_DEFAULTS.heroDescription,
      heroImage: doc.heroImage || BOARD_DEFAULTS.heroImage,
      eyebrow: doc.eyebrow || BOARD_DEFAULTS.eyebrow,
      sectionTitle: doc.sectionTitle || BOARD_DEFAULTS.sectionTitle,
      sectionDescription: doc.sectionDescription || BOARD_DEFAULTS.sectionDescription,
      members: Array.isArray(doc.members) && doc.members.length > 0
        ? doc.members.map((m: any) => ({ name: m.name, role: m.role, image: m.image, phone: m.phone, email: m.email, address: m.address }))
        : BOARD_DEFAULTS.members,
    };
  } catch (_) {}
  return {
    heroTitle: BOARD_DEFAULTS.heroTitle,
    heroAccent: undefined,
    heroTag: BOARD_DEFAULTS.heroTag,
    heroDescription: BOARD_DEFAULTS.heroDescription,
    heroImage: BOARD_DEFAULTS.heroImage,
    eyebrow: BOARD_DEFAULTS.eyebrow,
    sectionTitle: BOARD_DEFAULTS.sectionTitle,
    sectionDescription: BOARD_DEFAULTS.sectionDescription,
    members: BOARD_DEFAULTS.members,
  };
}

export default async function BoardOfDirectorsPage() {
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

      <section className="bg-slate-50 py-14 sm:py-16">
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
