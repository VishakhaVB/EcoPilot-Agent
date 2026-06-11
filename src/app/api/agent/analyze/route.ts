import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import CarbonLog from "@/lib/models/CarbonLog";
import ActionPlan from "@/lib/models/ActionPlan";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { sessionId, transportation, homeEnergy, lifestyle, goal } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // 1. Calculate emissions
    const dailyKm = Number(transportation.dailyKm) || 0;
    const electricityKwh = Number(homeEnergy.electricityKwh) || 0;

    // Formulas:
    // transportation = dailyKm * 22 * 0.21
    const transportationEmissions = dailyKm * 22 * 0.21;

    // home = electricityKwh * 0.82
    const homeEmissions = electricityKwh * 0.82;

    // lifestyle = diet factor + shopping factor
    let dietFactor = 60; // default non-veg
    if (lifestyle.diet === "vegan") dietFactor = 10;
    else if (lifestyle.diet === "vegetarian") dietFactor = 30;

    let shoppingFactor = 30; // default medium
    if (lifestyle.shopping === "low") shoppingFactor = 10;
    else if (lifestyle.shopping === "high") shoppingFactor = 60;

    const lifestyleEmissions = dietFactor + shoppingFactor;
    const totalEmissions = transportationEmissions + homeEmissions + lifestyleEmissions;

    // 2. Save User Onboarding Data to MongoDB
    // Check if user session already exists, if so we update it, otherwise create new
    await User.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        transportation,
        homeEnergy,
        lifestyle,
        goal,
      },
      { upsert: true, new: true }
    );

    // 3. Save to carbon_logs
    const currentMonth = new Date().toLocaleString("default", { month: "long" });
    const carbonLog = new CarbonLog({
      sessionId,
      transportationEmissions,
      homeEmissions,
      lifestyleEmissions,
      totalEmissions,
      month: currentMonth,
    });
    await carbonLog.save();

    // 4. Call Gemini to analyze patterns and generate a 4-week plan
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Using mock data for analysis plan.");
      // Mock plan fallback if Gemini key is missing to keep hackathon demo functioning
      const mockPlan = {
        weeks: [
          { week: 1, goal: "Switch 100% of home lighting to LED bulbs.", impact: "Saves 8 kg CO₂", category: "Energy" },
          { week: 2, goal: "Opt for cycling or walking for commutes under 5km.", impact: "Saves 15 kg CO₂", category: "Transportation" },
          { week: 3, goal: "Adopt a completely meat-free diet for 5 days a week.", impact: "Saves 12 kg CO₂", category: "Lifestyle" },
          { week: 4, goal: "Unplug idle appliances and configure sleep timers.", impact: "Saves 5 kg CO₂", category: "Energy" }
        ],
        recommendations: [
          "Lower thermostat settings by 2 degrees.",
          "Use cold water settings for all laundry wash loads.",
          "Reduce flights or offset airline emissions."
        ],
        summary: `Your calculated carbon footprint is ${totalEmissions.toFixed(1)} kg CO₂/month. Based on your goal (${goal}), we recommend targeting transportation first, which represents ${((transportationEmissions / totalEmissions) * 100).toFixed(0)}% of your footprint, followed by home energy.`
      };

      const actionPlan = new ActionPlan({
        sessionId,
        weeks: mockPlan.weeks,
        geminiAnalysis: mockPlan.summary,
        recommendations: mockPlan.recommendations,
      });
      await actionPlan.save();

      return NextResponse.json({
        sessionId,
        emissions: {
          transportationEmissions,
          homeEmissions,
          lifestyleEmissions,
          totalEmissions,
          month: currentMonth
        },
        actionPlan
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are EcoPilot AI, an autonomous sustainability agent.
Analyze this user's carbon footprint data and create a personalized plan.
User's Profile:
- Commute: Type: ${transportation.type}, Daily Distance: ${dailyKm} km, Flights per year: ${transportation.flightsPerYear || 0}
- Home Energy: Monthly Electricity: ${electricityKwh} kWh, Cooking Fuel: ${homeEnergy.cookingFuel}
- Lifestyle: Diet: ${lifestyle.diet}, Shopping habits: ${lifestyle.shopping}
- Carbon Reduction Target: ${goal}
- Monthly Emissions Breakdown:
  - Transportation: ${transportationEmissions.toFixed(1)} kg CO₂
  - Home Energy: ${homeEmissions.toFixed(1)} kg CO₂
  - Lifestyle: ${lifestyleEmissions.toFixed(1)} kg CO₂
  - Total: ${totalEmissions.toFixed(1)} kg CO₂

Respond ONLY in this JSON format (do NOT wrap it in markdown code blocks like \`\`\`json, do NOT include explanations, just return raw JSON):
{
  "weeks": [
    { "week": 1, "goal": "string", "impact": "string", "category": "string" },
    { "week": 2, "goal": "string", "impact": "string", "category": "string" },
    { "week": 3, "goal": "string", "impact": "string", "category": "string" },
    { "week": 4, "goal": "string", "impact": "string", "category": "string" }
  ],
  "recommendations": ["string", "string", "string"],
  "summary": "string"
}

Ensure the 4-week tasks are highly actionable and address the highest emission sector. The impact field must show estimated CO₂ savings (e.g. "Saves 14 kg CO₂"). The category must be one of: "Transportation", "Home Energy", "Lifestyle".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let planText = response.text || "";
    // Clean potential markdown wrappers
    planText = planText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(planText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON. Response text:", planText);
      throw new Error("Invalid response from Gemini AI agent.");
    }

    // Save action plan to MongoDB
    const actionPlan = new ActionPlan({
      sessionId,
      weeks: parsedPlan.weeks,
      geminiAnalysis: parsedPlan.summary,
      recommendations: parsedPlan.recommendations,
    });
    await actionPlan.save();

    return NextResponse.json({
      sessionId,
      emissions: {
        transportationEmissions,
        homeEmissions,
        lifestyleEmissions,
        totalEmissions,
        month: currentMonth
      },
      actionPlan
    });
  } catch (error: any) {
    console.error("Error in /api/agent/analyze:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
