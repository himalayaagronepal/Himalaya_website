import mongoose, { Document, Model, Schema } from "mongoose";

export const HERO_DEFAULTS = {
  headingMain: "From our farms to world market for a",
  headingAccent: "Sustainable Development",
  paragraph:
    "We are a modern integrated agro-company specializing in poultry, buffalo farming,goat farming , fishery,and organic farming.",
  primaryButtonLabel: "Our Projects",
  primaryButtonHref: "#integrated-business",
  secondaryButtonLabel: "Explore Opportunities",
  secondaryButtonHref: "/contact",
  slides: [
    { image: "/hero_images/first_image.jpg", imagePublicId: "", mobileImage: "/hero_images/first_image_two.jpg", mobileImagePublicId: "", alt: "Himalaya Agro farm landscape" },
    { image: "/hero_images/second_image.jpeg", imagePublicId: "", mobileImage: "", mobileImagePublicId: "", alt: "Himalaya Agro farm operations" },
    { image: "/hero_images/third_image.jpeg", imagePublicId: "", mobileImage: "", mobileImagePublicId: "", alt: "Himalaya Agro sustainable farming" },
  ],
  features: [
    { title: "Sustainable Agriculture", desc: "High quality production for food security" },
    { title: "Renewable Energy", desc: "Clean energy for a greener tomorrow" },
    { title: "EV Charging Network", desc: "Powering Nepal's future with clean mobility" },
    { title: "Agro Tourism", desc: "Experience nature, culture and rural life" },
  ],
};

export interface IHeroSlide {
  image: string;
  imagePublicId?: string;
  mobileImage?: string;
  mobileImagePublicId?: string;
  alt?: string;
}

export interface IHeroFeature {
  title: string;
  desc: string;
}

export interface IHeroSettings extends Document {
  singletonKey: string;
  headingMain: string;
  headingAccent: string;
  paragraph: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  slides: IHeroSlide[];
  features: IHeroFeature[];
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    mobileImage: { type: String, default: "" },
    mobileImagePublicId: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const HeroFeatureSchema = new Schema<IHeroFeature>(
  {
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

const HeroSettingsSchema: Schema<IHeroSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "hero" },
    headingMain: { type: String, default: HERO_DEFAULTS.headingMain },
    headingAccent: { type: String, default: HERO_DEFAULTS.headingAccent },
    paragraph: { type: String, default: HERO_DEFAULTS.paragraph },
    primaryButtonLabel: { type: String, default: HERO_DEFAULTS.primaryButtonLabel },
    primaryButtonHref: { type: String, default: HERO_DEFAULTS.primaryButtonHref },
    secondaryButtonLabel: { type: String, default: HERO_DEFAULTS.secondaryButtonLabel },
    secondaryButtonHref: { type: String, default: HERO_DEFAULTS.secondaryButtonHref },
    slides: { type: [HeroSlideSchema], default: HERO_DEFAULTS.slides },
    features: { type: [HeroFeatureSchema], default: HERO_DEFAULTS.features },
  },
  { timestamps: true }
);

const HeroSettings: Model<IHeroSettings> =
  (mongoose.models.HeroSettings as Model<IHeroSettings>) ||
  mongoose.model<IHeroSettings>("HeroSettings", HeroSettingsSchema);

export default HeroSettings;
