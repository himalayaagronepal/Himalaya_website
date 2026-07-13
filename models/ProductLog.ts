import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProductLog extends Document {
  product: mongoose.Types.ObjectId;
  outlet?: mongoose.Types.ObjectId;
  type: string; // 'sale' | 'add' | 'expiry' | 'adjust'
  quantity: number;
  before: number;
  after: number;
  note?: string;
  actorId?: string;
  actorName?: string;
  createdAt: Date;
}

const ProductLogSchema: Schema<IProductLog> = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", index: true },
    type: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    note: { type: String },
    actorId: { type: String },
    actorName: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ProductLog: Model<IProductLog> = (mongoose.models.ProductLog as Model<IProductLog>) || mongoose.model<IProductLog>("ProductLog", ProductLogSchema);
export default ProductLog;
