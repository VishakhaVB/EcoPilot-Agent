import mongoose, { Schema, Document } from "mongoose";

export interface ICarbonLog extends Document {
  sessionId: string;
  transportationEmissions: number;
  homeEmissions: number;
  lifestyleEmissions: number;
  totalEmissions: number;
  month: string;
  createdAt: Date;
}

const CarbonLogSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    transportationEmissions: { type: Number, required: true },
    homeEmissions: { type: Number, required: true },
    lifestyleEmissions: { type: Number, required: true },
    totalEmissions: { type: Number, required: true },
    month: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.CarbonLog || mongoose.model<ICarbonLog>("CarbonLog", CarbonLogSchema);
