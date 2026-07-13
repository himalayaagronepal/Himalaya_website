import React from "react";
import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import SubHeroSection from "../components/SubHeroSection";
import GalleryCarousel from "../components/GalleryCarousel";
import connectToDatabase from "../../lib/mongodb";
import GalleryImage from "../../models/GalleryImage";
import GallerySettings, { GALLERY_HERO_DEFAULTS } from "../../models/GallerySettings";
import { browserSafeVideoUrl } from "../../lib/videoDelivery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Highlights from our farms, facilities, and community programs.",
};

// Always render with the latest images managed from the admin gallery.
export const dynamic = "force-dynamic";

type GalleryPhoto = { src: string; caption?: string; mediaType?: 'image' | 'video' };

// Primary source: images managed in the admin → Gallery section (stored in
// MongoDB, hosted on Cloudinary). Falls back to the bundled public/gallery
// folder when none have been added yet.
async function getGalleryImages(): Promise<GalleryPhoto[]> {
  try {
    await connectToDatabase();
    const docs = await GalleryImage.find({}).sort({ order: 1, createdAt: 1 }).lean();
    if (docs.length > 0) {
      return docs.map((d: any) => {
        const isVideo = d.mediaType === 'video';
        return {
          src: isVideo ? browserSafeVideoUrl(d.url) : d.url,
          caption: d.caption || undefined,
          mediaType: (isVideo ? 'video' : 'image') as 'image' | 'video',
        };
      });
    }
  } catch (error) {
    console.error("Error reading gallery images from database:", error);
  }

  try {
    const galleryDir = path.join(process.cwd(), "public", "gallery");
    const files = await fs.readdir(galleryDir);

    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    });

    // Sort to put firstimage.jpeg first
    imageFiles.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower.includes("firstimage")) return -1;
      if (bLower.includes("firstimage")) return 1;
      return 0;
    });

    return imageFiles.map((file) => ({ src: `/gallery/${file}` }));
  } catch (error) {
    console.error("Error reading gallery images:", error);
    return [];
  }
}

// Hero banner content, managed from admin → Gallery. Falls back to defaults.
async function getGalleryHero() {
  try {
    await connectToDatabase();
    const doc = await GallerySettings.findOne({ singletonKey: "gallery" }).lean();
    if (doc) {
      return {
        title: doc.heroTitle || GALLERY_HERO_DEFAULTS.heroTitle,
        accent: doc.heroAccent || undefined,
        description: doc.heroDescription || undefined,
        image: doc.heroImage || GALLERY_HERO_DEFAULTS.heroImage,
        carouselLabel: doc.carouselLabel || GALLERY_HERO_DEFAULTS.carouselLabel,
        carouselTitle: doc.carouselTitle || GALLERY_HERO_DEFAULTS.carouselTitle,
        carouselDescription: doc.carouselDescription || GALLERY_HERO_DEFAULTS.carouselDescription,
      };
    }
  } catch (error) {
    console.error("Error reading gallery hero settings:", error);
  }
  return {
    title: GALLERY_HERO_DEFAULTS.heroTitle,
    accent: GALLERY_HERO_DEFAULTS.heroAccent,
    description: GALLERY_HERO_DEFAULTS.heroDescription,
    image: GALLERY_HERO_DEFAULTS.heroImage,
    carouselLabel: GALLERY_HERO_DEFAULTS.carouselLabel,
    carouselTitle: GALLERY_HERO_DEFAULTS.carouselTitle,
    carouselDescription: GALLERY_HERO_DEFAULTS.carouselDescription,
  };
}

export default async function GalleryPage() {
  const [galleryImages, hero] = await Promise.all([getGalleryImages(), getGalleryHero()]);

  // Fallback images if none found in public/gallery
  const fallbackImages = [
    { src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=1400" },
    { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1400" },
    { src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1400" },
    { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1400" },
  ];

  const displayImages = galleryImages.length > 0 ? galleryImages : fallbackImages;

  return (
    <main className="bg-white text-slate-900">
      <SubHeroSection
        title={hero.title}
        accent={hero.accent}
        tag="A look inside"
        description={hero.description}
        image={hero.image}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mb-8 sm:mb-12 flex flex-col gap-3 text-center">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
              {hero.carouselLabel}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-tight text-slate-900 px-2">
              {hero.carouselTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 leading-relaxed">
              {hero.carouselDescription}
            </p>
          </div>

          <GalleryCarousel images={displayImages} interval={5000} />
        </div>
      </section>
    </main>
  );
}
