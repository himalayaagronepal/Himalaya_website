import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGalleryImage extends Document {
  url: string;        // Cloudinary secure_url
  publicId: string;   // Cloudinary public_id (needed to delete/replace the asset)
  mediaType: "image" | "video";
  caption?: string;
  order: number;      // display order in the gallery carousel (lower = first)
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema: Schema<IGalleryImage> = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    caption: { type: String },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const GalleryImage: Model<IGalleryImage> =
  (mongoose.models.GalleryImage as Model<IGalleryImage>) ||
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);

export default GalleryImage;
