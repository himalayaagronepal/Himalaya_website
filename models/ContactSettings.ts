import mongoose, { Document, Model, Schema } from "mongoose";

export const CONTACT_DEFAULTS = {
  heroTitle: "Contact Us",
  heroAccent: "",
  heroDescription: "Connect with our team to bring your vision to life. We are ready when you are.",
  heroImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000",
  heroImagePublicId: "",
  heroStats: [
    { value: "753", label: "Sales Centers" },
    { value: "12", label: "Countries" },
  ],
  infoCompanyLabel: "Himalaya Nepal Krishi Company Limited",
  infoHeading: "Let's talk",
  infoSubheading: "Share your needs and our team will reach out within 24 hours.",
  phones: ["+977-9851227052", "+977-9851312052", "01-061-587586"],
  email: "info@himalayaagronepal.com",
  addressLines: ["Dharapani Marga (Road)", "Pokhara 33700"],
  supportEmail: "info@himalayaagronepal.com",
  openHours: "Mon - Fri",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d938.4845275782392!2d83.97552017100725!3d28.223913589483583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6987177b13ca1cdd%3A0x6cd4dd3f132d685d!2sHimalaya%20Nepal%20Krishi%20Company%20Limited!5e1!3m2!1sen!2snp!4v1777634380714!5m2!1sen!2snp",
  formHeading: "Send us a message",
  formSubheading: "We will get back to you shortly.",
};

export type ContactStat = { value: string; label: string };

export interface IContactSettings extends Document {
  singletonKey: string;
  heroTitle: string;
  heroAccent?: string;
  heroDescription?: string;
  heroImage: string;
  heroImagePublicId?: string;
  heroStats: ContactStat[];
  infoCompanyLabel: string;
  infoHeading: string;
  infoSubheading?: string;
  phones: string[];
  email: string;
  addressLines: string[];
  supportEmail?: string;
  openHours?: string;
  mapEmbedUrl: string;
  formHeading: string;
  formSubheading?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StatSchema = new mongoose.Schema({ value: String, label: String }, { _id: false });

const ContactSettingsSchema: Schema<IContactSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "contact" },
    heroTitle: { type: String, default: CONTACT_DEFAULTS.heroTitle },
    heroAccent: { type: String },
    heroDescription: { type: String },
    heroImage: { type: String, default: CONTACT_DEFAULTS.heroImage },
    heroImagePublicId: { type: String, default: "" },
    heroStats: { type: [StatSchema], default: CONTACT_DEFAULTS.heroStats },
    infoCompanyLabel: { type: String, default: CONTACT_DEFAULTS.infoCompanyLabel },
    infoHeading: { type: String, default: CONTACT_DEFAULTS.infoHeading },
    infoSubheading: { type: String },
    phones: { type: [String], default: CONTACT_DEFAULTS.phones },
    email: { type: String, default: CONTACT_DEFAULTS.email },
    addressLines: { type: [String], default: CONTACT_DEFAULTS.addressLines },
    supportEmail: { type: String },
    openHours: { type: String },
    mapEmbedUrl: { type: String, default: CONTACT_DEFAULTS.mapEmbedUrl },
    formHeading: { type: String, default: CONTACT_DEFAULTS.formHeading },
    formSubheading: { type: String },
  },
  { timestamps: true }
);

const ContactSettings: Model<IContactSettings> =
  (mongoose.models.ContactSettings as Model<IContactSettings>) ||
  mongoose.model<IContactSettings>("ContactSettings", ContactSettingsSchema);

export default ContactSettings;
