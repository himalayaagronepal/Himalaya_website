import mongoose, { Document, Model, Schema } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "card" | "credit" | "esewa";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  brand?: string;
  category?: string;
}

export interface IShippingAddress {
  name?: string;
  line1?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  outlet?: mongoose.Types.ObjectId;
  distributorCreditApplied?: boolean;
  distributorCreditAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingAddress?: IShippingAddress;
  orderStatus: OrderStatus;
  inventoryApplied?: boolean;
  inventoryAppliedAt?: Date;
  isManualOrder?: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // optional UI fields
  estimatedDelivery?: string;
  subTotal?: number;
  shippingCost?: number;
  tax?: number;
}

const OrderItemSchema = new mongoose.Schema<IOrderItem>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
  brand: { type: String },
  category: { type: String },
});

const ShippingSchema = new mongoose.Schema<IShippingAddress>({
  name: String,
  line1: String,
  city: String,
  postalCode: String,
  phone: String,
}, { _id: false });

const OrderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", index: true },
    distributorCreditApplied: { type: Boolean, default: false },
    distributorCreditAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ["cod", "card", "credit", "esewa"], default: "cod" },
    shippingAddress: { type: ShippingSchema },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
    inventoryApplied: { type: Boolean, default: false },
    inventoryAppliedAt: { type: Date },
    isManualOrder: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

// Indexes for the hottest queries: customer order history (by user, newest first) and
// status filtering. `outlet` is already indexed on the field definition above.
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });

const Order: Model<IOrder> = (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;