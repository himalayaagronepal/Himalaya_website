import mongoose, { Document, Model, Schema } from "mongoose";

export type FarmCategory = "Poultry" | "Buffalo" | "Fish" | "Goat";

export interface IProduct extends Document {
  name: string;
  description?: string;
  brand?: string;
  price: number;
  unit?: string;
  category?: string;
  /** Links a product to one of the farm detail pages (Explore Our Farms). Optional. */
  farmCategory?: FarmCategory;
  images: string[];
  stock: number;
  isActive: boolean;
  outlet?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    brand: { type: String, index: true },
    price: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "" },
    category: { type: String, index: true },
    farmCategory: {
      type: String,
      enum: ["Poultry", "Buffalo", "Fish", "Goat"],
      index: true,
    },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", brand: "text", category: 1 });

const Product: Model<IProduct> = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;