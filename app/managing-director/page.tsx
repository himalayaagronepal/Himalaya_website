import SubHeroSection from '../components/SubHeroSection';
import HeroSection from './sections/HeroSection';
import StatsBar from './sections/StatsBar';
import CareerTimeline from './sections/CareerTimeline';
import EducationSection from './sections/EducationSection';
import PublicationsSection from './sections/PublicationsSection';
import TravelSection from './sections/TravelSection';
import PatronagesSection from './sections/PatronagesSection';

export const metadata = {
  title: 'About Managing Director - Dolindra Prasad Sharma',
};

export default function ManagingDirectorPage() {
  return (
    <main>
      {/* <SubHeroSection
        title="About Managing Director"
        description="Our Leader's Vision for Agricultural Excellence"
        image="/managing-director.jpg"
        tag="Leadership"
      /> */}

      <HeroSection imageSrc="/managing-director.jpg" />

      <StatsBar />
      <CareerTimeline />
      <EducationSection />
      <PublicationsSection />
      <TravelSection />
      <PatronagesSection />
    </main>
  );
}
