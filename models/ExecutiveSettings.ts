import mongoose, { Document, Model, Schema } from "mongoose";

export type ExecutiveMemberData = {
  name: string;
  role: string;
  image: string;
  imagePublicId: string;
  phone: string;
  email: string;
  address: string;
};

export const EXECUTIVE_DEFAULTS = {
  heroTitle: "Executive Team",
  heroAccent: "",
  heroTag: "About Us",
  heroDescription: "Our executive team turns strategy into action through operations, finance, sales, people, and digital systems.",
  heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000",
  heroImagePublicId: "",
  eyebrow: "Management Grid",
  sectionTitle: "Executive leadership",
  sectionDescription: "Each card is a placeholder for CMS-managed executive profiles, ready to be replaced with live backend content.",
  members: [
    { name: "Dolindra Paudel Sharma", role: "Managing Director", image: "/managing-director.jpg", imagePublicId: "", phone: "9810000000", email: "md@himalayaagro.com", address: "Executive Office, Kathmandu" },
    { name: "Officer One", role: "Officer", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9810000001", email: "officer.one@himalayaagro.com", address: "Executive Office, Kathmandu" },
    { name: "Officer Two", role: "Officer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9810000002", email: "officer.two@himalayaagro.com", address: "Operations Division, Baglung" },
    { name: "Officer Three", role: "Officer", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9810000003", email: "officer.three@himalayaagro.com", address: "Sales Division, Pokhara" },
    { name: "Officer Four", role: "Officer", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9810000004", email: "officer.four@himalayaagro.com", address: "Finance Desk, Butwal" },
    { name: "Officer Five", role: "Officer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9810000005", email: "officer.five@himalayaagro.com", address: "People Team, Chitwan" },
    { name: "Officer Six", role: "Officer", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9810000006", email: "officer.six@himalayaagro.com", address: "Technology Office, Kathmandu" },
  ] as ExecutiveMemberData[],
};

export interface IExecutiveSettings extends Document {
  singletonKey: string;
  heroTitle: string;
  heroAccent?: string;
  heroTag?: string;
  heroDescription?: string;
  heroImage: string;
  heroImagePublicId?: string;
  eyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  members: ExecutiveMemberData[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, default: "" },
  imagePublicId: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
}, { _id: true });

const ExecutiveSettingsSchema: Schema<IExecutiveSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "executive" },
    heroTitle: { type: String, default: EXECUTIVE_DEFAULTS.heroTitle },
    heroAccent: { type: String },
    heroTag: { type: String, default: EXECUTIVE_DEFAULTS.heroTag },
    heroDescription: { type: String },
    heroImage: { type: String, default: EXECUTIVE_DEFAULTS.heroImage },
    heroImagePublicId: { type: String, default: "" },
    eyebrow: { type: String, default: EXECUTIVE_DEFAULTS.eyebrow },
    sectionTitle: { type: String, default: EXECUTIVE_DEFAULTS.sectionTitle },
    sectionDescription: { type: String, default: EXECUTIVE_DEFAULTS.sectionDescription },
    members: { type: [MemberSchema], default: EXECUTIVE_DEFAULTS.members },
  },
  { timestamps: true }
);

const ExecutiveSettings: Model<IExecutiveSettings> =
  (mongoose.models.ExecutiveSettings as Model<IExecutiveSettings>) ||
  mongoose.model<IExecutiveSettings>("ExecutiveSettings", ExecutiveSettingsSchema);

export default ExecutiveSettings;
