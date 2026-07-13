import FarmPageTemplate, { FarmPageData } from "../../components/FarmPageTemplate";
import { getFarmProducts } from "../../../lib/farmProducts";

// Refresh the "Products From This Farm" list periodically so newly-tagged
// products surface without a full rebuild.
export const revalidate = 60;

export const metadata = {
  title: "Buffalo Farm",
  description:
    "Dairy-focused buffalo livestock operations built on balanced nutrition, clean housing, and professional herd management.",
};

const data: FarmPageData = {
  title: "Buffalo Farm",
  tag: "Dairy & Buffalo Livestock",
  heroDescription:
    "High-yield buffalo dairy built on superior breeds, balanced nutrition, and round-the-clock veterinary care.",
  heroImage: "/cow_photo.jpg",
  // Taller banner to match the other farm pages.
  heroMinHeight: "min(72vh, 620px)",
  accent: "#059669",

  overviewHeading: "Dairy-Focused Buffalo Management",
  overviewText:
    "The buffalo farm is dedicated to maintaining healthy livestock through proper nutrition, clean housing facilities, and professional herd management practices. Spacious shelters and reliable water systems help ensure animal comfort throughout all seasons.",
  overviewText2:
    "The farm focuses on maintaining herd health, supporting productivity, and promoting responsible livestock management through continuous monitoring and regular care programs.",
  overviewImage:
    "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800",
  features: [
    { title: "Spacious livestock housing", icon: "barn" },
    { title: "Nutritional feeding programs", icon: "feed" },
    { title: "Veterinary supervision", icon: "vet" },
    { title: "Clean water systems", icon: "water" },
    { title: "Herd management practices", icon: "clipboard" },
    { title: "Hygienic dairy operations", icon: "milk" },
  ],

  activitiesHeading: "Buffalo Management Process",
  activitiesSubheading: "Supporting Healthy Herd Development",
  activities: [
    {
      step: "01",
      title: "Nutritional Planning",
      desc: "Animals receive carefully balanced feed designed to support growth, health, and productivity.",
      icon: "feed",
    },
    {
      step: "02",
      title: "Housing Management",
      desc: "Shelters are maintained to provide clean, comfortable, and safe living conditions.",
      icon: "home",
    },
    {
      step: "03",
      title: "Health Supervision",
      desc: "Routine health checks help monitor animal wellbeing and support preventive care measures.",
      icon: "vet",
    },
    {
      step: "04",
      title: "Dairy Operations",
      desc: "Milk collection and handling processes follow hygienic farm management practices.",
      icon: "milk",
    },
    {
      step: "05",
      title: "Quality Assurance",
      desc: "Continuous monitoring supports consistent operational standards and livestock care.",
      icon: "check-badge",
    },
  ],

  sustainabilityHeading: "Integrated Livestock Farming",
  sustainabilityText:
    "The buffalo farm supports sustainable agriculture through responsible resource utilization and organic waste management. Livestock by-products contribute to broader agricultural activities, helping create a balanced and efficient farming ecosystem.",
  sustainabilityText2:
    "Efforts to maintain water efficiency, feed management, and environmental stewardship support long-term farm sustainability.",
  sustainabilityPrinciples: [
    {
      title: "Responsible Resource Use",
      desc: "Resources are utilized responsibly to support sustainable and efficient dairy operations.",
      icon: "gauge",
    },
    {
      title: "Organic Waste Management",
      desc: "Livestock by-products contribute to broader agricultural activities for a balanced ecosystem.",
      icon: "recycle",
    },
    {
      title: "Water & Feed Efficiency",
      desc: "Efforts in water efficiency and feed management support long-term farm sustainability.",
      icon: "droplet",
    },
  ],

  sustainabilityImage:
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=2000",

  farmCategory: "Buffalo",
};

export default async function BuffaloPage() {
  const products = await getFarmProducts("Buffalo");
  return <FarmPageTemplate data={data} products={products} />;
}
