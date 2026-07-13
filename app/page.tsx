import React from "react";
import HeroCarousel from "./components/home/Hero";
import OurFarmExperiences from "./components/home/OurFarmExperiences";
import OurMission from "./components/home/WhatWeDo";
import MessageFromChairwoman from "./components/home/MessageFromChairwoman";
import Products from "./components/home/Products";
import CorePillars from "./components/home/CorePillars";
import EcoBalance from "./components/home/EcoBalance";
import WhyChooseUs from "./components/home/WhyChooseUs";
import ImpactVision from "./components/home/ImpactVision";
import NewsMedia from "./components/home/NewsMedia";
import OneStopShop from "./components/home/OneStopShop";
import Partners from "./components/home/Partheres";
import connectToDatabase from "../lib/mongodb";
import Product from "../models/Product";
import ChairpersonSettings, { CHAIRPERSON_DEFAULTS } from "../models/ChairpersonSettings";
import HeroSettings, { HERO_DEFAULTS } from "../models/HeroSettings";
import StrategicRoadmap from "./components/home/StrategicRoadmap";

export const metadata = {
  title: "Home",
};

// Always fetch fresh data from DB so admin changes appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let safeProducts: {
    _id: string;
    name: string;
    shortDescription?: string;
    images?: string[];
    price?: number;
    brand?: string | null;
    category?: string | null;
  }[] = [];

  let chairpersonData = {
    name: CHAIRPERSON_DEFAULTS.name,
    role: CHAIRPERSON_DEFAULTS.role,
    subRole: CHAIRPERSON_DEFAULTS.subRole,
    cardTitle: CHAIRPERSON_DEFAULTS.cardTitle,
    image: CHAIRPERSON_DEFAULTS.image,
    contentHtml: CHAIRPERSON_DEFAULTS.contentHtml,
  };

  try {
    await connectToDatabase();
    const chairDoc = await ChairpersonSettings.findOne({ singletonKey: "chairperson" }).lean();
    if (chairDoc) chairpersonData = {
      name: (chairDoc as any).name || CHAIRPERSON_DEFAULTS.name,
      role: (chairDoc as any).role || CHAIRPERSON_DEFAULTS.role,
      subRole: (chairDoc as any).subRole || CHAIRPERSON_DEFAULTS.subRole,
      cardTitle: (chairDoc as any).cardTitle || CHAIRPERSON_DEFAULTS.cardTitle,
      image: (chairDoc as any).image || CHAIRPERSON_DEFAULTS.image,
      contentHtml: (chairDoc as any).contentHtml || CHAIRPERSON_DEFAULTS.contentHtml,
    };
  } catch (_) {}

  let heroData: {
    headingMain: string;
    headingAccent: string;
    paragraph: string;
    primaryButtonLabel: string;
    primaryButtonHref: string;
    secondaryButtonLabel: string;
    secondaryButtonHref: string;
    slides: { image: string; mobileImage?: string; alt?: string }[];
    features: { title: string; desc: string }[];
  } = {
    headingMain: HERO_DEFAULTS.headingMain,
    headingAccent: HERO_DEFAULTS.headingAccent,
    paragraph: HERO_DEFAULTS.paragraph,
    primaryButtonLabel: HERO_DEFAULTS.primaryButtonLabel,
    primaryButtonHref: HERO_DEFAULTS.primaryButtonHref,
    secondaryButtonLabel: HERO_DEFAULTS.secondaryButtonLabel,
    secondaryButtonHref: HERO_DEFAULTS.secondaryButtonHref,
    slides: HERO_DEFAULTS.slides.map((s) => ({ image: s.image, mobileImage: s.mobileImage, alt: s.alt })),
    features: HERO_DEFAULTS.features,
  };

  try {
    await connectToDatabase();
    const heroDoc = await HeroSettings.findOne({ singletonKey: "hero" }).lean();
    if (heroDoc) {
      const d = heroDoc as any;
      heroData = {
        headingMain: d.headingMain || HERO_DEFAULTS.headingMain,
        headingAccent: d.headingAccent || HERO_DEFAULTS.headingAccent,
        paragraph: d.paragraph || HERO_DEFAULTS.paragraph,
        primaryButtonLabel: d.primaryButtonLabel || HERO_DEFAULTS.primaryButtonLabel,
        primaryButtonHref: d.primaryButtonHref || HERO_DEFAULTS.primaryButtonHref,
        secondaryButtonLabel: d.secondaryButtonLabel || HERO_DEFAULTS.secondaryButtonLabel,
        secondaryButtonHref: d.secondaryButtonHref || HERO_DEFAULTS.secondaryButtonHref,
        slides: Array.isArray(d.slides) && d.slides.length > 0
          ? d.slides.map((s: any) => ({ image: s.image, mobileImage: s.mobileImage || undefined, alt: s.alt || "" }))
          : heroData.slides,
        features: Array.isArray(d.features) && d.features.length > 0
          ? d.features.map((f: any) => ({ title: f.title || "", desc: f.desc || "" }))
          : heroData.features,
      };
    }
  } catch (_) {}

  try {
    await connectToDatabase();
    const prods = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).lean();
    safeProducts = (prods || []).map((p: any) => ({
      _id: String(p._id),
      name: p.name,
      shortDescription: p.shortDescription || p.description || '',
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
      price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
      brand: p.brand ? String(p.brand) : null,
      category: p.category ? String(p.category) : null,
    }));
  } catch (err) {
    // DB not available — Products component will fall back to demo data
    safeProducts = [];
  }

  return (
    <main>
      <HeroCarousel {...heroData} />
      <OurFarmExperiences />

      <MessageFromChairwoman {...chairpersonData} />
      
      
      <Products products={safeProducts} />
      {/* <OurMission /> */}
      {/* <ImpactVision /> */}
      <CorePillars />
      {/* <EcoBalance /> */}
      <WhyChooseUs />
      <NewsMedia />
    </main>
  );
}
