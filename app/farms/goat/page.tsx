import FarmPageTemplate, { FarmPageData } from "../../components/FarmPageTemplate";
import { getFarmProducts } from "../../../lib/farmProducts";

// Refresh the "Products From This Farm" list periodically so newly-tagged
// products surface without a full rebuild.
export const revalidate = 60;

export const metadata = {
  title: "Goat Grazing",
  description:
    "Managed goat grazing and herd care combining natural forage, veterinary programs, and sustainable livestock management.",
};

const data: FarmPageData = {
  title: "Goat Grazing",
  tag: "Free-Range Goat Farming",
  heroDescription:
    "Hardy, fast-breeding goats raised on rotational pasture — a low-input, high-return path into commercial livestock.",
  heroImage:
    "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=2000",
  // Taller banner to match the other farm pages.
  heroMinHeight: "min(72vh, 620px)",
  accent: "#059669",

  overviewHeading: "Managed Grazing & Herd Care",
  overviewText:
    "Our goat farming operations are built around responsible herd management and natural grazing practices. Goats are raised in carefully managed grazing areas that allow access to natural forage while ensuring the land remains productive and environmentally sustainable. Shelter facilities provide protection during adverse weather conditions, while dedicated feeding and watering stations support animal health throughout the year.",
  overviewText2:
    "The farm follows a routine health management program that includes regular inspections, preventive care measures, and close monitoring of herd conditions. By combining traditional livestock knowledge with modern management practices, we maintain healthy and productive herds while prioritizing animal welfare and sustainability.",
  overviewImage:
    "https://images.unsplash.com/photo-1551446591-142875a901a1?auto=format&fit=crop&q=80&w=800",
  features: [
    { title: "Managed grazing zones", icon: "mountain" },
    { title: "Natural forage access", icon: "sprout" },
    { title: "Herd health monitoring", icon: "heart" },
    { title: "Veterinary care programs", icon: "vet" },
    { title: "Shelter facilities", icon: "home" },
    { title: "Sustainable livestock management", icon: "recycle" },
  ],

  activitiesHeading: "Grazing Management Process",
  activitiesSubheading: "How We Care For Our Herd",
  activities: [
    {
      step: "01",
      title: "Pasture Management",
      desc: "Grazing areas are regularly maintained and rotated to promote healthy vegetation growth, prevent overgrazing, and ensure continuous access to quality forage throughout the year.",
      icon: "sprout",
    },
    {
      step: "02",
      title: "Nutrition Support",
      desc: "In addition to natural grazing, supplementary feed and mineral nutrients are provided whenever necessary to maintain balanced nutrition and support overall herd development.",
      icon: "feed",
    },
    {
      step: "03",
      title: "Health Monitoring",
      desc: "Routine health inspections help identify potential issues early and ensure the wellbeing of every animal through preventive care and professional supervision.",
      icon: "vet",
    },
    {
      step: "04",
      title: "Breeding Management",
      desc: "Controlled breeding programs are implemented to improve herd quality, maintain genetic diversity, and support long-term farm productivity.",
      icon: "dna",
    },
    {
      step: "05",
      title: "Quality Production",
      desc: "The farm follows ethical livestock management practices that prioritize animal welfare while supporting consistent and sustainable production outcomes.",
      icon: "check-badge",
    },
  ],

  sustainabilityHeading: "Environmentally Responsible Goat Farming",
  sustainabilityText:
    "Goat grazing operations contribute to efficient land utilization by converting natural vegetation into valuable agricultural resources. Managed grazing techniques help preserve soil quality, encourage biodiversity, and reduce pressure on agricultural land.",
  sustainabilityText2:
    "Organic waste generated through livestock operations is responsibly managed and can be integrated into broader agricultural activities as a natural source of nutrients. Through sustainable grazing management and responsible resource use, the farm supports both environmental stewardship and long-term productivity.",
  sustainabilityPrinciples: [
    {
      title: "Efficient Land Utilization",
      desc: "Managed grazing converts natural vegetation into valuable resources while preserving soil quality.",
      icon: "mountain",
    },
    {
      title: "Biodiversity & Soil Health",
      desc: "Grazing techniques encourage biodiversity and reduce pressure on agricultural land.",
      icon: "trees",
    },
    {
      title: "Organic Nutrient Cycling",
      desc: "Organic waste is responsibly managed as a natural source of nutrients for broader farming.",
      icon: "recycle",
    },
  ],

  sustainabilityImage:
    "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=2000",

  farmCategory: "Goat",
};

export default async function GoatPage() {
  const products = await getFarmProducts("Goat");
  return <FarmPageTemplate data={data} products={products} />;
}
