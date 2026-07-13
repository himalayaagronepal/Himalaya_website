import mongoose, { Document, Model, Schema } from "mongoose";

export interface IObjective {
  name: string;
  desc: string;
  icon: string;
}

export const STRATEGIC_OBJECTIVES_DEFAULTS = {
  badgeText: "Our Blueprint",
  heading: "Ten Strategic Objectives",
  description: "The ten commitments that guide every decision — from the farm gate to the global market.",
  objectives: [
    { name: "Modernization", desc: "Mechanised, ICT-led smart farming.", icon: "cog" },
    { name: "Commercialization", desc: "Subsistence plots into market value.", icon: "trending-up" },
    { name: "Land Consolidation", desc: "Fragmented land into scale zones.", icon: "grid" },
    { name: "Quality Testing", desc: "GMP & HACCP aligned standards.", icon: "beaker" },
    { name: "Farmer Welfare", desc: "Training, fair prices & security.", icon: "users" },
    { name: "Supply Chain", desc: "Cold storage to reliable transport.", icon: "truck" },
    { name: "Export Promotion", desc: '"Made in Nepal" to global markets.', icon: "globe" },
    { name: "R&D Innovation", desc: "Research-driven, eco-responsible.", icon: "bulb" },
    { name: "Digital Logistics", desc: "Traceability from seed to shelf.", icon: "phone" },
    { name: "Agri-Tourism", desc: "Farm experiences & hospitality.", icon: "sun" },
  ] as IObjective[],
};

export interface IStrategicObjectivesSettings extends Document {
  singletonKey: string;
  badgeText: string;
  heading: string;
  description: string;
  objectives: IObjective[];
  createdAt: Date;
  updatedAt: Date;
}

const ObjectiveSchema = new Schema<IObjective>(
  { name: { type: String, required: true }, desc: { type: String, default: "" }, icon: { type: String, default: "cog" } },
  { _id: false }
);

const StrategicObjectivesSettingsSchema: Schema<IStrategicObjectivesSettings> = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "strategic-objectives" },
    badgeText: { type: String, default: STRATEGIC_OBJECTIVES_DEFAULTS.badgeText },
    heading: { type: String, default: STRATEGIC_OBJECTIVES_DEFAULTS.heading },
    description: { type: String, default: STRATEGIC_OBJECTIVES_DEFAULTS.description },
    objectives: { type: [ObjectiveSchema], default: STRATEGIC_OBJECTIVES_DEFAULTS.objectives },
  },
  { timestamps: true }
);

const StrategicObjectivesSettings: Model<IStrategicObjectivesSettings> =
  (mongoose.models.StrategicObjectivesSettings as Model<IStrategicObjectivesSettings>) ||
  mongoose.model<IStrategicObjectivesSettings>("StrategicObjectivesSettings", StrategicObjectivesSettingsSchema);

export default StrategicObjectivesSettings;
