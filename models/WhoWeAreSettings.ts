import mongoose, { Document, Model, Schema } from "mongoose";

export const WHO_WE_ARE_DEFAULTS = {
  heroTitle: "Who We Are",
  heroAccent: "",
  heroDescription: "One progressive Nepalese platform bringing farming, clean energy and hospitality together for a self-reliant Nepal.",
  heroImage: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=2000",
  heroImagePublicId: "",
  mainHeading: "An integrated agricultural enterprise for a self-reliant Nepal",
  mainAccent: "self-reliant Nepal",
  paragraph1: "Himalaya Nepal Krishi Company Limited brings modern agriculture, processing, clean energy, hospitality and innovation together under one progressive platform — transforming subsistence farming into a competitive, farmer-centered value chain.",
  paragraph2: "From the farm gate to the global market, we empower farmers with training, fair prices and modern infrastructure — building food security, rural prosperity and lasting national self-reliance.",
  contentHtml: "<p>Himalaya Nepal Krishi Company Limited brings modern agriculture, processing, clean energy, hospitality and innovation together under one progressive platform — transforming subsistence farming into a competitive, farmer-centered value chain.</p><p>From the farm gate to the global market, we empower farmers with training, fair prices and modern infrastructure — building food security, rural prosperity and lasting national self-reliance.</p>",
};

export interface IWhoWeAreSettings extends Document {
  singletonKey: string;
  heroTitle: string;
  heroAccent?: string;
  heroDescription?: string;
  heroImage: string;
  heroImagePublicId?: string;
  mainHeading: string;
  mainAccent?: string;
  paragraph1: string;
  paragraph2: string;
  contentHtml?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WhoWeAreSettingsSchema: Schema<IWhoWeAreSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "who-we-are" },
    heroTitle: { type: String, default: WHO_WE_ARE_DEFAULTS.heroTitle },
    heroAccent: { type: String },
    heroDescription: { type: String },
    heroImage: { type: String, default: WHO_WE_ARE_DEFAULTS.heroImage },
    heroImagePublicId: { type: String, default: "" },
    mainHeading: { type: String, default: WHO_WE_ARE_DEFAULTS.mainHeading },
    mainAccent: { type: String },
    paragraph1: { type: String, default: WHO_WE_ARE_DEFAULTS.paragraph1 },
    paragraph2: { type: String, default: WHO_WE_ARE_DEFAULTS.paragraph2 },
    contentHtml: { type: String, default: "" },
  },
  { timestamps: true }
);

const WhoWeAreSettings: Model<IWhoWeAreSettings> =
  (mongoose.models.WhoWeAreSettings as Model<IWhoWeAreSettings>) ||
  mongoose.model<IWhoWeAreSettings>("WhoWeAreSettings", WhoWeAreSettingsSchema);

export default WhoWeAreSettings;
