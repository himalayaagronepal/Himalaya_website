import Link from "next/link";
import FarmsHeroVideo from "../components/farms/FarmsHeroVideo";

export const metadata = {
  title: "Explore Our Farms",
  description:
    "Take a tour of Himalaya Nepal Agriculture's integrated farms — poultry, buffalo dairy, fishery, and goat grazing.",
};

const farms = [
  {
    title: "Poultry Sheds",
    href: "/farms/poultry",
    desc: "Climate-controlled, biosecurity-first poultry operations.",
    img: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Buffalo Farm",
    href: "/farms/buffalo",
    desc: "High-yield dairy from superior buffalo breeds.",
    img: "/cow_photo.jpg",
  },
  {
    title: "Fish Ponds",
    href: "/farms/fish",
    desc: "Sustainable freshwater aquaculture.",
    img: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Goat Grazing",
    href: "/farms/goat",
    desc: "Free-range goat farming on rotational pasture.",
    img: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800",
  },
];

export default function ExploreOurFarmsPage() {
  return (
    <main className="bg-white text-slate-900">
      {/* Autoplay background video — fills the viewport below the sticky navbar without overflowing it */}
      <section className="relative h-[calc(100svh-var(--top-bar-height,80px))] w-full overflow-hidden bg-black">
        {/* Self-hosted, muted, looping background video (poster-only on mobile / reduced-motion) */}
        <FarmsHeroVideo />

        {/* Soft dark overlay across the whole video */}
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        {/* Extra gradient toward the bottom so the caption stays readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 sm:px-8 lg:px-12 pb-12 sm:pb-16">
          <div className="mx-auto max-w-[1650px]">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-green-300">
              Explore Our Farms
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.6)]">
              A Tour of Our Integrated Farms
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
              From poultry and buffalo dairy to fishery and goat grazing — see how we grow,
              raise, and harvest across Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Farm links */}
      <section className="py-[50px]">
        <div className="mx-auto max-w-[1650px] px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {farms.map((farm) => (
              <Link
                key={farm.title}
                href={farm.href}
                className="group relative overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={farm.img}
                    alt={farm.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg font-bold text-white drop-shadow">{farm.title}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-white/85">{farm.desc}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-green-300">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
