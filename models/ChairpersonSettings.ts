import mongoose, { Document, Model, Schema } from "mongoose";

export const CHAIRPERSON_DEFAULTS = {
  name: "Prof. Dr. Chandika Pandit",
  role: "Chairperson",
  subRole: "OB/GYN · Gandaki Medical College · Co-founder, Fewa City Hospital",
  cardTitle: "Chairperson",
  image: "/chandika_pandit.jpeg",
  imagePublicId: "",
  contentHtml: "<p>Welcome to Himalaya Nepal Agriculture Company Limited. It is with great pride and responsibility that I extend my warm greetings to all our valued farmers, partners, investors, customers, and well-wishers. Agriculture has always been the backbone of Nepal's economy, and we strongly believe that modern, sustainable, and technology-driven agriculture is the key to national prosperity and rural transformation.</p><p>Our company was established with a vision to create an integrated and diversified business ecosystem that supports agriculture, livestock farming, poultry, dairy, fisheries, goat and buffalo farming, agro-processing, hospitality services, and clean energy infrastructure under one progressive platform. Alongside agricultural development, we are also committed to promoting sustainable transportation and modern highway services through the development of EV charging stations and family-friendly modern restaurants and mini marts designed to serve travelers with comfort, safety, and quality service.</p><p>At Himalaya Nepal Agriculture Company Limited, we aim not only to produce quality agricultural products but also to create employment opportunities, strengthen local economies, encourage green energy adoption, and improve customer experiences through innovation and responsible business practices. We believe that collaboration, transparency, sustainability, and long-term vision are essential to building a stronger and more self-reliant Nepal.</p><p>As Chairperson, I remain deeply committed to ensuring that our organization contributes meaningfully to Nepal's agricultural modernization while embracing environmentally responsible technologies and diversified business opportunities for the future. Our mission is to bridge traditional values with modern solutions that benefit farmers, communities, travelers, and the nation as a whole.</p><p>I sincerely thank everyone who continues to support and believe in our vision and mission. Together, we can build a prosperous, sustainable, and forward-looking Nepal.</p>",
};

export interface IChairpersonSettings extends Document {
  singletonKey: string;
  name: string;
  role: string;
  subRole?: string;
  cardTitle: string;
  image: string;
  imagePublicId?: string;
  contentHtml: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChairpersonSettingsSchema: Schema<IChairpersonSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "chairperson" },
    name: { type: String, default: CHAIRPERSON_DEFAULTS.name },
    role: { type: String, default: CHAIRPERSON_DEFAULTS.role },
    subRole: { type: String },
    cardTitle: { type: String, default: CHAIRPERSON_DEFAULTS.cardTitle },
    image: { type: String, default: CHAIRPERSON_DEFAULTS.image },
    imagePublicId: { type: String, default: "" },
    contentHtml: { type: String, default: CHAIRPERSON_DEFAULTS.contentHtml },
  },
  { timestamps: true }
);

const ChairpersonSettings: Model<IChairpersonSettings> =
  (mongoose.models.ChairpersonSettings as Model<IChairpersonSettings>) ||
  mongoose.model<IChairpersonSettings>("ChairpersonSettings", ChairpersonSettingsSchema);

export default ChairpersonSettings;
