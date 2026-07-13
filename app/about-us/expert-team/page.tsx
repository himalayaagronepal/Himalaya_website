import React from 'react';
import SubHeroSection from '../../components/SubHeroSection';
import SectionHeading from '../../components/SectionHeading';
import TeamMemberCard, { TeamMember } from '../../components/TeamMemberCard';

const expertTeam: TeamMember[] = [
  {
    name: 'Agronomy Expert One',
    role: 'Agronomy Specialist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200',
    phone: '9820000001',
    email: 'agronomy@himalayaagro.com',
    address: 'Research Wing, Kathmandu',
  },
  {
    name: 'Livestock Expert One',
    role: 'Livestock Specialist',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1200',
    phone: '9820000002',
    email: 'livestock@himalayaagro.com',
    address: 'Research Wing, Baglung',
  },
  {
    name: 'Irrigation Expert One',
    role: 'Irrigation Advisor',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200',
    phone: '9820000003',
    email: 'irrigation@himalayaagro.com',
    address: 'Technical Office, Pokhara',
  },
  {
    name: 'Organic Expert One',
    role: 'Organic Farming Consultant',
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&q=80&w=1200',
    phone: '9820000004',
    email: 'organic@himalayaagro.com',
    address: 'Advisory Center, Butwal',
  },
  {
    name: 'Quality Expert One',
    role: 'Quality Assurance Expert',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1200',
    phone: '9820000005',
    email: 'quality@himalayaagro.com',
    address: 'Standards Desk, Chitwan',
  },
  {
    name: 'Market Expert One',
    role: 'Market Linkage Specialist',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200',
    phone: '9820000006',
    email: 'market@himalayaagro.com',
    address: 'Market Support Unit, Kathmandu',
  },
];

export default function ExpertTeamPage() {
  return (
    <>
      <SubHeroSection
        title="Expert Team"
        tag="About Us"
        description="Our experts guide farming systems, advisory services, and technical problem-solving across the field network."
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Expert Grid"
            title="Subject matter experts"
            description="Replace these placeholders with CMS-managed expert profiles when backend content is ready."
          />

          <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {expertTeam.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
