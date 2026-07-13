import FarmPageTemplate, { FarmPageData } from "../../components/FarmPageTemplate";
import { getFarmProducts } from "../../../lib/farmProducts";

// Refresh the "Products From This Farm" list periodically so newly-tagged
// products surface without a full rebuild.
export const revalidate = 60;

export const metadata = {
  title: "Fish Ponds",
  description:
    "Sustainable freshwater aquaculture maintaining healthy aquatic environments through careful water and feed management.",
};

const data: FarmPageData = {
  title: "Fish Ponds",
  tag: "Freshwater Aquaculture",
  heroDescription:
    "Sustainably-farmed freshwater fish raised through precise water quality, feeding, and stocking management.",
  heroImage:
    "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=2000",
  // Taller banner to match the other farm pages.
  heroMinHeight: "min(72vh, 620px)",
  accent: "#059669",

  overviewHeading: "Sustainable Aquaculture Operations",
  overviewText:
    "Our fish ponds are managed to maintain healthy aquatic environments that support sustainable fish production. Water quality, feeding schedules, and pond conditions are regularly monitored to create favorable conditions for fish growth and development.",
  overviewText2:
    "The operation follows responsible aquaculture practices aimed at maintaining environmental balance while supporting consistent production outcomes.",
  overviewImage:
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&q=80&w=800",
  features: [
    { title: "Managed pond ecosystems", icon: "waves" },
    { title: "Water quality monitoring", icon: "gauge" },
    { title: "Aquaculture feeding programs", icon: "feed" },
    { title: "Environmental management", icon: "leaf" },
    { title: "Stock health supervision", icon: "vet" },
    { title: "Sustainable production practices", icon: "recycle" },
  ],

  activitiesHeading: "Aquaculture Management Process",
  activitiesSubheading: "From Pond Preparation to Harvest",
  activities: [
    {
      step: "01",
      title: "Pond Preparation",
      desc: "Ponds are prepared and maintained to establish suitable aquatic conditions before stocking.",
      icon: "droplet",
    },
    {
      step: "02",
      title: "Stocking",
      desc: "Healthy fish stock is introduced following appropriate pond management procedures.",
      icon: "fish",
    },
    {
      step: "03",
      title: "Nutrition Management",
      desc: "Feeding schedules are carefully planned to support healthy growth and efficient resource use.",
      icon: "feed",
    },
    {
      step: "04",
      title: "Water Quality Monitoring",
      desc: "Water conditions are continuously assessed to maintain a healthy aquatic environment.",
      icon: "gauge",
    },
    {
      step: "05",
      title: "Harvest Management",
      desc: "Harvesting activities are conducted using practices that support product quality and operational efficiency.",
      icon: "package",
    },
  ],

  sustainabilityHeading: "Responsible Aquaculture Management",
  sustainabilityText:
    "The fish farming operation emphasizes efficient water use, environmental stewardship, and sustainable production methods. Continuous monitoring and responsible management practices help maintain ecological balance while supporting long-term aquaculture productivity.",
  sustainabilityPrinciples: [
    {
      title: "Efficient Water Use",
      desc: "Water is managed efficiently to maintain a healthy aquatic environment and reduce waste.",
      icon: "droplet",
    },
    {
      title: "Environmental Stewardship",
      desc: "Responsible management practices help maintain ecological balance across pond ecosystems.",
      icon: "leaf",
    },
    {
      title: "Sustainable Production",
      desc: "Continuous monitoring supports long-term aquaculture productivity and careful resource use.",
      icon: "recycle",
    },
  ],

  sustainabilityImage:
    "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=80&w=2000",

  farmCategory: "Fish",
};

export default async function FishPage() {
  const products = await getFarmProducts("Fish");
  return <FarmPageTemplate data={data} products={products} />;
}
