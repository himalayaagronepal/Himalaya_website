import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug?: string;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, index: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", default: [] }],
  },
  { timestamps: true }
);

const Category: Model<ICategory> = (mongoose.models.Category as Model<ICategory>) || mongoose.model<ICategory>("Category", CategorySchema);
export default Category; 
