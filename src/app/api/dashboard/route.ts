import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import CarbonLog from "@/lib/models/CarbonLog";
import ActionPlan from "@/lib/models/ActionPlan";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Fetch user context
    const user = await User.findOne({ sessionId });
    if (!user) {
      return NextResponse.json({ error: "User session not found" }, { status: 404 });
    }

    // Fetch all carbon logs to show progress trends, sorted by creation date
    const carbonLogs = await CarbonLog.find({ sessionId }).sort({ createdAt: 1 });

    // Fetch the active action plan
    const actionPlan = await ActionPlan.findOne({ sessionId }).sort({ createdAt: -1 });

    return NextResponse.json({
      user,
      carbonLogs,
      latestCarbonLog: carbonLogs[carbonLogs.length - 1] || null,
      actionPlan,
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard data" }, { status: 500 });
  }
}
