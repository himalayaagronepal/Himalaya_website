import mongoose, { Document, Model, Schema } from "mongoose";

// Controls whether the public /news-and-notices page shows the bundled dummy
// content or the admin-published content from the database. Both default to
// `true` so the site keeps showing the curated dummy data until an admin
// explicitly switches a section over to dynamic content.
export const CONTENT_SETTINGS_DEFAULTS = {
  newsDummyEnabled: true,
  noticesDummyEnabled: true,
};

export interface IContentSettings extends Document {
  singletonKey: string; // always "content" — guarantees a single settings document
  newsDummyEnabled: boolean;
  noticesDummyEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSettingsSchema: Schema<IContentSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "content" },
    newsDummyEnabled: { type: Boolean, default: CONTENT_SETTINGS_DEFAULTS.newsDummyEnabled },
    noticesDummyEnabled: { type: Boolean, default: CONTENT_SETTINGS_DEFAULTS.noticesDummyEnabled },
  },
  { timestamps: true }
);

const ContentSettings: Model<IContentSettings> =
  (mongoose.models.ContentSettings as Model<IContentSettings>) ||
  mongoose.model<IContentSettings>("ContentSettings", ContentSettingsSchema);

export default ContentSettings;
