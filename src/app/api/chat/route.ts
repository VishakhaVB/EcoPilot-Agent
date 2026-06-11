import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import CarbonLog from "@/lib/models/CarbonLog";
import ActionPlan from "@/lib/models/ActionPlan";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { message, sessionId } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId and message are required" }, { status: 400 });
    }

    // Fetch user context
    const user = await User.findOne({ sessionId });
    const latestCarbonLog = await CarbonLog.findOne({ sessionId }).sort({ createdAt: -1 });
    const actionPlan = await ActionPlan.findOne({ sessionId }).sort({ createdAt: -1 });

    let context = "";
    if (user && latestCarbonLog) {
      context = `User Profile Context:
- Commute: Type: ${user.transportation.type}, Daily Distance: ${user.transportation.dailyKm} km, Flights: ${user.transportation.flightsPerYear || 0} per year. (Monthly Emissions: ${latestCarbonLog.transportationEmissions.toFixed(1)} kg CO₂)
- Home Energy: Monthly Electricity: ${user.homeEnergy.electricityKwh} kWh, Cooking Fuel: ${user.homeEnergy.cookingFuel}. (Monthly Emissions: ${latestCarbonLog.homeEmissions.toFixed(1)} kg CO₂)
- Lifestyle: Diet: ${user.lifestyle.diet}, Shopping Scale: ${user.lifestyle.shopping}. (Monthly Emissions: ${latestCarbonLog.lifestyleEmissions.toFixed(1)} kg CO₂)
- Total Monthly Footprint: ${latestCarbonLog.totalEmissions.toFixed(1)} kg CO₂
- Target reduction goal: ${user.goal}
${
  actionPlan
    ? `- 4-Week Action Plan Summary: ${actionPlan.geminiAnalysis}
- Recommendations: ${actionPlan.recommendations.join("; ")}`
    : ""
}`;
    } else {
      context = "No user profile context is available yet.";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Using mock data for chat reply.");
      return NextResponse.json({
        reply: "Hi there! I am EcoPilot AI, your autonomous sustainability coach. It looks like my AI key is not configured yet, but based on your profile, I recommend reducing electricity usage or commuting by bike to make a quick dent in your carbon footprint! Let me know if you have any questions."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are EcoPilot AI, a premium autonomous sustainability coach.
Use the provided User Profile Context to answer the user's questions with highly personalized, encouraging, and specific advice.
Always reference their specific details (e.g. their commuting type, electricity units, or diet) in your answers.
Keep your response concise, professional, and actionable (2-3 paragraphs max).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemInstruction}\n\n${context}\n\nUser Question: ${message}\n\nEcoPilot Coach response:`,
    });

    const reply = response.text || "I'm sorry, I couldn't formulate a response right now. Please try again.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
