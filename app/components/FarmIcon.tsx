import {
  ShieldCheck,
  Wind,
  Wheat,
  Droplets,
  Droplet,
  Eye,
  SprayCan,
  Thermometer,
  Stethoscope,
  Package,
  Settings,
  Recycle,
  Activity,
  Warehouse,
  Home,
  Milk,
  ClipboardCheck,
  BadgeCheck,
  Waves,
  Gauge,
  Fish,
  Leaf,
  Mountain,
  Sprout,
  HeartPulse,
  Dna,
  Trees,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a stable string key to a Lucide icon. Using keys (instead of icon
 * components) keeps the farm page data fully serialisable, so the same icon set
 * works in both Server Components (FarmPageTemplate) and Client Components
 * (FarmTimeline).
 */
const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  wind: Wind,
  feed: Wheat,
  water: Droplets,
  droplet: Droplet,
  monitor: Eye,
  sanitation: SprayCan,
  thermometer: Thermometer,
  vet: Stethoscope,
  package: Package,
  settings: Settings,
  recycle: Recycle,
  activity: Activity,
  barn: Warehouse,
  home: Home,
  milk: Milk,
  clipboard: ClipboardCheck,
  "check-badge": BadgeCheck,
  waves: Waves,
  gauge: Gauge,
  fish: Fish,
  leaf: Leaf,
  mountain: Mountain,
  sprout: Sprout,
  heart: HeartPulse,
  dna: Dna,
  trees: Trees,
};

export type FarmIconName = keyof typeof ICONS;

export default function FarmIcon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = ICONS[name] ?? Leaf;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
