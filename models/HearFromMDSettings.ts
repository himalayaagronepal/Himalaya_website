import mongoose, { Document, Model, Schema } from "mongoose";

export const HEAR_FROM_MD_DEFAULTS = {
  heroTitle: "Hear From the MD",
  heroAccent: "MD",
  heroDescription: "A personal note from our Managing Director on the road ahead for Nepal's agriculture.",
  heroImage: "/hero_images/second_image.jpeg",
  heroImagePublicId: "",
  mdName: "Dolindra Paudel Sharma",
  mdRole: "Managing Director",
  mdImage: "/managing-director.jpg",
  mdImagePublicId: "",
  eyebrow: "Message From the Managing Director",
  heading: "Building a modern, resilient Nepalese agriculture",
  contentHtml: "<p>As the Managing Director of Himalaya Nepal Agriculture Company Limited, I am honored to welcome you to our platform. Our vision is rooted in transforming Nepal's agricultural landscape into a modern, sustainable, and commercially viable sector that empowers farmers and strengthens the national economy.</p><p>We are committed to bridging the gap between traditional farming practices and innovative agricultural solutions by promoting technology, value addition, and efficient market access. Through strong collaboration with farmers, cooperatives, and stakeholders, we aim to ensure quality production, fair pricing, and long-term growth for all involved.</p><p>Our focus remains on enhancing productivity, encouraging youth participation in agriculture, and building a reliable supply chain that meets both domestic and international standards. We believe that agriculture is not just a profession, but a foundation for national prosperity and food security.</p><p>I sincerely thank you for your interest and support. Together, let us work towards building a resilient, competitive, and prosperous agricultural future for Nepal.</p>",
};

export interface IHearFromMDSettings extends Document {
  singletonKey: string;
  heroTitle: string;
  heroAccent?: string;
  heroDescription?: string;
  heroImage: string;
  heroImagePublicId?: string;
  mdName: string;
  mdRole: string;
  mdImage: string;
  mdImagePublicId?: string;
  eyebrow: string;
  heading: string;
  contentHtml: string;
  createdAt: Date;
  updatedAt: Date;
}

const HearFromMDSettingsSchema: Schema<IHearFromMDSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "hear-from-md" },
    heroTitle: { type: String, default: HEAR_FROM_MD_DEFAULTS.heroTitle },
    heroAccent: { type: String },
    heroDescription: { type: String },
    heroImage: { type: String, default: HEAR_FROM_MD_DEFAULTS.heroImage },
    heroImagePublicId: { type: String, default: "" },
    mdName: { type: String, default: HEAR_FROM_MD_DEFAULTS.mdName },
    mdRole: { type: String, default: HEAR_FROM_MD_DEFAULTS.mdRole },
    mdImage: { type: String, default: HEAR_FROM_MD_DEFAULTS.mdImage },
    mdImagePublicId: { type: String, default: "" },
    eyebrow: { type: String, default: HEAR_FROM_MD_DEFAULTS.eyebrow },
    heading: { type: String, default: HEAR_FROM_MD_DEFAULTS.heading },
    contentHtml: { type: String, default: HEAR_FROM_MD_DEFAULTS.contentHtml },
  },
  { timestamps: true }
);

const HearFromMDSettings: Model<IHearFromMDSettings> =
  (mongoose.models.HearFromMDSettings as Model<IHearFromMDSettings>) ||
  mongoose.model<IHearFromMDSettings>("HearFromMDSettings", HearFromMDSettingsSchema);

export default HearFromMDSettings;
