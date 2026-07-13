import mongoose, { Document, Model, Schema } from "mongoose";

// Notice "types" shown as a coloured badge on the public notices board. These
// mirror the values used by the bundled dummy notices on /news-and-notices.
export const NOTICE_TYPES = ["Notice", "Tender", "Vacancy", "Circular", "Result"] as const;
export type NoticeType = (typeof NOTICE_TYPES)[number];

export interface INotice extends Document {
  title: string;
  // Optional Nepali (नेपाली) title. Falls back to `title` when empty.
  titleNe?: string;
  type: NoticeType;
  status: "draft" | "published";
  fileUrl?: string; // optional link/attachment opened by the download icon
  publishedAt: Date; // drives the day / month / year date block
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema<INotice> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    titleNe: { type: String },
    type: { type: String, enum: NOTICE_TYPES as unknown as string[], default: "Notice" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    fileUrl: { type: String },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notice: Model<INotice> =
  (mongoose.models.Notice as Model<INotice>) || mongoose.model<INotice>("Notice", NoticeSchema);

export default Notice;
