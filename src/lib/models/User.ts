import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  sessionId: string;
  transportation: {
    type: string;
    dailyKm: number;
    flightsPerYear: number;
  };
  homeEnergy: {
    electricityKwh: number;
    cookingFuel: string;
  };
  lifestyle: {
    diet: string;
    shopping: string;
  };
  goal: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    transportation: {
      type: { type: String, required: true },
      dailyKm: { type: Number, required: true },
      flightsPerYear: { type: Number, required: true },
    },
    homeEnergy: {
      electricityKwh: { type: Number, required: true },
      cookingFuel: { type: String, required: true },
    },
    lifestyle: {
      diet: { type: String, required: true },
      shopping: { type: String, required: true },
    },
    goal: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent compiling model multiple times
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
