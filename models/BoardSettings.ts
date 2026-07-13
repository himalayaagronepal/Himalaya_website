import mongoose, { Document, Model, Schema } from "mongoose";

export type BoardMemberData = {
  name: string;
  role: string;
  image: string;
  imagePublicId: string;
  phone: string;
  email: string;
  address: string;
};

export const BOARD_DEFAULTS = {
  heroTitle: "Board of Directors",
  heroAccent: "",
  heroTag: "About Us",
  heroDescription: "The board provides governance, oversight, and long-term direction for the organisation's growth and accountability.",
  heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2000",
  heroImagePublicId: "",
  eyebrow: "Leadership Grid",
  sectionTitle: "Board members",
  sectionDescription: "This grid is CMS-ready. Each profile card can later be edited by the admin panel without changing the page structure.",
  members: [
    { name: "Prof. Dr. Chandika Pandit", role: "Chairperson", image: "/chandika_pandit.jpeg", imagePublicId: "", phone: "9800000000", email: "chairperson@himalayaagro.com", address: "Central Office, Pokhara" },
    { name: "Board Member One", role: "Board Member", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9800000001", email: "board.one@himalayaagro.com", address: "Central Office, Kathmandu" },
    { name: "Board Member Two", role: "Board Member", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9800000002", email: "board.two@himalayaagro.com", address: "Regional Office, Baglung" },
    { name: "Board Member Three", role: "Board Member", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9800000003", email: "board.three@himalayaagro.com", address: "Regional Office, Pokhara" },
    { name: "Board Member Four", role: "Board Member", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9800000004", email: "board.four@himalayaagro.com", address: "Project Office, Butwal" },
    { name: "Board Member Five", role: "Board Member", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1200", imagePublicId: "", phone: "9800000005", email: "board.five@himalayaagro.com", address: "Corporate Office, Chitwan" },
  ] as BoardMemberData[],
};

export interface IBoardSettings extends Document {
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
  members: BoardMemberData[];
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

const BoardSettingsSchema: Schema<IBoardSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "board" },
    heroTitle: { type: String, default: BOARD_DEFAULTS.heroTitle },
    heroAccent: { type: String },
    heroTag: { type: String, default: BOARD_DEFAULTS.heroTag },
    heroDescription: { type: String },
    heroImage: { type: String, default: BOARD_DEFAULTS.heroImage },
    heroImagePublicId: { type: String, default: "" },
    eyebrow: { type: String, default: BOARD_DEFAULTS.eyebrow },
    sectionTitle: { type: String, default: BOARD_DEFAULTS.sectionTitle },
    sectionDescription: { type: String, default: BOARD_DEFAULTS.sectionDescription },
    members: { type: [MemberSchema], default: BOARD_DEFAULTS.members },
  },
  { timestamps: true }
);

const BoardSettings: Model<IBoardSettings> =
  (mongoose.models.BoardSettings as Model<IBoardSettings>) ||
  mongoose.model<IBoardSettings>("BoardSettings", BoardSettingsSchema);

export default BoardSettings;
