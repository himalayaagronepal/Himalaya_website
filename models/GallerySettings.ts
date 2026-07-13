import mongoose, { Document, Model, Schema } from "mongoose";

// Current defaults shown on /gallery — used as fallback when nothing is saved yet.
export const GALLERY_HERO_DEFAULTS = {
  heroTitle: "Our Gallery",
  heroAccent: "Gallery",
  heroDescription:
    "Highlights from our farms, facilities, field operations, and community programs across Nepal.",
  heroImage: "/hero_images/second_image.jpeg",
  heroImagePublicId: "",
  carouselLabel: "Photo Carousel",
  carouselTitle: "Swipe, click, and explore",
  carouselDescription:
    "Click any photo to open it in a fullscreen lightbox. Use the arrows, swipe, or your keyboard to navigate.",
};

export interface IGallerySettings extends Document {
  singletonKey: string; // always "gallery" — guarantees a single settings document
  heroTitle: string;
  heroAccent?: string; // word inside the title highlighted green
  heroDescription?: string;
  heroImage: string;
  heroImagePublicId?: string; // Cloudinary public_id (empty for bundled/static images)
  carouselLabel?: string;
  carouselTitle?: string;
  carouselDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySettingsSchema: Schema<IGallerySettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "gallery" },
    heroTitle: { type: String, default: GALLERY_HERO_DEFAULTS.heroTitle },
    heroAccent: { type: String },
    heroDescription: { type: String },
    heroImage: { type: String, default: GALLERY_HERO_DEFAULTS.heroImage },
    heroImagePublicId: { type: String, default: "" },
    carouselLabel: { type: String },
    carouselTitle: { type: String },
    carouselDescription: { type: String },
  },
  { timestamps: true }
);

const GallerySettings: Model<IGallerySettings> =
  (mongoose.models.GallerySettings as Model<IGallerySettings>) ||
  mongoose.model<IGallerySettings>("GallerySettings", GallerySettingsSchema);

export default GallerySettings;
