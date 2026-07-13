import FarmPageTemplate, { FarmPageData } from "../../components/FarmPageTemplate";
import { getFarmProducts } from "../../../lib/farmProducts";

// Refresh the "Products From This Farm" list periodically so newly-tagged
// products surface without a full rebuild.
export const revalidate = 60;

export const metadata = {
  title: "Poultry Sheds",
  description:
    "Modern, biosecurity-first poultry operations producing healthy broilers and eggs with humane, climate-controlled housing.",
};

const data: FarmPageData = {
  title: "Poultry Sheds",
  tag: "Modern Poultry Operations",
  heroDescription:
    "Climate-controlled, biosecurity-first poultry housing producing healthy broilers and farm-fresh eggs across Nepal.",
  // Looping background video — the former /farms hero, moved here. Cloudinary-first
  // (CDN, adaptive delivery) with a self-hosted fallback; its poster doubles as the
  // mobile / reduced-motion still, so the banner scene stays consistent.
  heroVideoCloudSrc:
    "https://res.cloudinary.com/dk7ggjvlw/video/upload/c_limit,w_1280,q_auto:eco/himalaya_agro_bg_v2.mp4",
  heroVideoLocalSrc: "/himalaya_agro_bg_opt_v2.mp4",
  heroImage: "/himalaya_agro_poster_v2.jpg",
  // Taller banner (poultry only) to better showcase the looping video background.
  heroMinHeight: "min(72vh, 620px)",
  accent: "#059669",

  overviewHeading: "Modern Poultry Production Facilities",
  overviewText:
    "Our poultry sheds are designed to provide a controlled environment that supports healthy bird development and efficient production. Each facility is maintained according to strict hygiene and biosecurity standards, helping reduce disease risks and improve overall flock health.",
  overviewText2:
    "Ventilation systems, feeding arrangements, and water supply networks are carefully managed to ensure birds receive optimal living conditions throughout their growth cycle. Continuous monitoring enables timely adjustments that support animal welfare and operational efficiency.",
  overviewImage:
    "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&q=80&w=800",
  features: [
    { title: "Biosecure poultry housing", icon: "shield" },
    { title: "Controlled ventilation systems", icon: "wind" },
    { title: "Automated feeding management", icon: "feed" },
    { title: "Clean water distribution", icon: "water" },
    { title: "Routine flock monitoring", icon: "monitor" },
    { title: "Dedicated sanitation protocols", icon: "sanitation" },
  ],

  activitiesHeading: "Poultry Management Process",
  activitiesSubheading: "Maintaining Healthy Flocks",
  activities: [
    {
      step: "01",
      title: "Facility Preparation",
      desc: "Poultry sheds are thoroughly cleaned, disinfected, and prepared before introducing new flocks.",
      icon: "sanitation",
    },
    {
      step: "02",
      title: "Feeding Management",
      desc: "Balanced nutrition programs support healthy growth and development throughout the production cycle.",
      icon: "feed",
    },
    {
      step: "03",
      title: "Environmental Control",
      desc: "Temperature, airflow, and lighting conditions are continuously monitored and adjusted as required.",
      icon: "thermometer",
    },
    {
      step: "04",
      title: "Health Monitoring",
      desc: "Routine inspections help ensure bird welfare and support preventive health management practices.",
      icon: "vet",
    },
    {
      step: "05",
      title: "Production Management",
      desc: "Operational procedures are followed to maintain consistent production quality and farm performance.",
      icon: "package",
    },
  ],

  sustainabilityHeading: "Responsible Poultry Farming",
  sustainabilityText:
    "The poultry operation emphasizes efficient resource utilization and responsible waste management. Organic by-products are managed carefully to support environmental sustainability and agricultural productivity.",
  sustainabilityText2:
    "Continuous improvements in facility management, resource efficiency, and operational practices help reduce environmental impact while supporting long-term production goals.",
  sustainabilityPrinciples: [
    {
      title: "Efficient Resource Use",
      desc: "Resources are utilized efficiently across daily operations to reduce waste and improve farm performance.",
      icon: "gauge",
    },
    {
      title: "Responsible Waste Management",
      desc: "Organic by-products are managed carefully to support environmental sustainability and productivity.",
      icon: "recycle",
    },
    {
      title: "Continuous Improvement",
      desc: "Ongoing improvements in facility management and operations help reduce environmental impact.",
      icon: "activity",
    },
  ],

  sustainabilityImage:
    "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=2000",

  farmCategory: "Poultry",
};

export default async function PoultryPage() {
  const products = await getFarmProducts("Poultry");
  return <FarmPageTemplate data={data} products={products} />;
}
