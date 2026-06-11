import mongoose, { Schema, Document } from "mongoose";

export interface IWeekAction {
  week: number;
  goal: string;
  impact: string;
  category: string;
}

export interface IActionPlan extends Document {
  sessionId: string;
  weeks: IWeekAction[];
  geminiAnalysis: string;
  recommendations: string[];
  createdAt: Date;
}

const WeekActionSchema = new Schema({
  week: { type: Number, required: true },
  goal: { type: String, required: true },
  impact: { type: String, required: true },
  category: { type: String, required: true },
});

const ActionPlanSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    weeks: { type: [WeekActionSchema], required: true },
    geminiAnalysis: { type: String, required: true },
    recommendations: { type: [String], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.ActionPlan || mongoose.model<IActionPlan>("ActionPlan", ActionPlanSchema);
