"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Leaf, RotateCcw, Award, Sparkles, TrendingDown, Calendar, 
  Send, Bot, User, Loader2, Footprints, Flame, ShoppingBag, Bike 
} from "lucide-react";

interface UserProfile {
  sessionId: string;
  transportation: { type: string; dailyKm: number; flightsPerYear: number };
  homeEnergy: { electricityKwh: number; cookingFuel: string };
  lifestyle: { diet: string; shopping: string };
  goal: string;
}

interface CarbonLog {
  transportationEmissions: number;
  homeEmissions: number;
  lifestyleEmissions: number;
  totalEmissions: number;
  month: string;
  createdAt: string;
}

interface ActionPlan {
  weeks: Array<{
    week: number;
    goal: string;
    impact: string;
    category: string;
  }>;
  geminiAnalysis: string;
  recommendations: string[];
}

interface Message {
  sender: "user" | "coach";
  text: string;
  timestamp: Date;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // States for DB data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [carbonLogs, setCarbonLogs] = useState<CarbonLog[]>([]);
  const [latestLog, setLatestLog] = useState<CarbonLog | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);

  // Chat States
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine session ID
    let currentSessionId = searchParams.get("sessionId");
    if (!currentSessionId) {
      if (typeof window !== "undefined") {
        currentSessionId = localStorage.getItem("ecoPilotSessionId");
      }
    }
    setSessionId(currentSessionId);
  }, [searchParams]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (!sessionId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard?sessionId=${sessionId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load dashboard data");
        }
        const data = await res.json();

        setProfile(data.user);
        setCarbonLogs(data.carbonLogs || []);
        setLatestLog(data.latestCarbonLog);
        setActionPlan(data.actionPlan);

        // Add greeting coach message if chat is empty
        setChatMessages([
          {
            sender: "coach",
            text: `Hello! I'm your EcoPilot AI Coach. I've analyzed your profile and generated a personalized 4-week roadmap to help you achieve your goal: ${data.user?.goal || "Reduce carbon emissions"}. Ask me anything about your current emissions or how to execute your weekly tasks!`,
            timestamp: new Date()
          }
        ]);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to retrieve database contents.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [sessionId]);

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your profile and start onboarding again?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ecoPilotPendingData");
        // We generate a new session ID to create a fresh demo state
        const newSessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem("ecoPilotSessionId", newSessionId);
        router.push("/onboarding");
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg, timestamp: new Date() }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId })
      });

      if (!res.ok) throw new Error("Failed to communicate with coach");

      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "coach", text: data.reply, timestamp: new Date() }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: "coach", 
          text: "I experienced a connection issue. Based on your profile, I strongly encourage focusing on reducing your electricity usage by unplugging standby appliances and switching off lights. Let's keep working towards your reduction goal!", 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 items-center justify-center">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Fetching dashboard database state...</p>
      </div>
    );
  }

  if (error || !profile || !latestLog) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 items-center justify-center p-6 text-center">
        <div className="bg-rose-950/40 border border-rose-500/20 p-6 rounded-2xl max-w-md space-y-4">
          <h2 className="text-2xl font-extrabold text-rose-400">Unable to Load Dashboard</h2>
          <p className="text-slate-400 text-sm">{error || "No active carbon profile found. Please onboard first."}</p>
          <Button onClick={() => router.push("/onboarding")} className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold w-full h-11 rounded-lg">
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  // Calculated metrics
  const totalEmissions = latestLog.totalEmissions;
  const goalText = profile.goal; // "Reduce by 10%" / 20% / 30%
  const reductionPercent = Number(goalText.replace(/[^0-9]/g, "")) || 20;
  const predictedNextMonth = totalEmissions * (1 - reductionPercent / 100);

  // Progress metrics: Calculate progress over time if multiple logs exist
  let progressPercentage = 0;
  if (carbonLogs.length > 1) {
    const initial = carbonLogs[0].totalEmissions;
    const current = carbonLogs[carbonLogs.length - 1].totalEmissions;
    const reduction = initial - current;
    progressPercentage = Math.round((reduction / initial) * 100);
    if (progressPercentage < 0) progressPercentage = 0; // avoid negative progress
  }

  // Recharts Data Prep
  const chartData = [
    {
      name: "Transportation",
      Emissions: Math.round(latestLog.transportationEmissions),
    },
    {
      name: "Home Energy",
      Emissions: Math.round(latestLog.homeEmissions),
    },
    {
      name: "Lifestyle",
      Emissions: Math.round(latestLog.lifestyleEmissions),
    },
  ];

  // Map category to icons
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "transportation":
        return <Bike className="h-5 w-5 text-teal-400" />;
      case "home energy":
      case "energy":
        return <Flame className="h-5 w-5 text-emerald-400" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-cyan-400" />;
    }
  };

  // Map category to color classes
  const getCategoryBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
      case "transportation":
        return "bg-teal-950/60 border-teal-500/20 text-teal-400";
      case "home energy":
      case "energy":
        return "bg-emerald-950/60 border-emerald-500/20 text-emerald-400";
      default:
        return "bg-cyan-950/60 border-cyan-500/20 text-cyan-400";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 pb-12 relative overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-[5%] left-[5%] w-[40%] h-[40%] bg-teal-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-950 border border-teal-500/30 p-2 rounded-lg text-teal-400">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              EcoPilot AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/50 text-teal-400 border border-teal-500/20">
              Session Active
            </span>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 gap-1.5 h-9 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Agent
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10 w-full">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">EcoPilot Control Panel</h1>
            <p className="text-slate-400 text-sm mt-1">
              Autonomous calculations and roadmap generated for Session <span className="font-mono text-teal-400">{sessionId?.substring(8, 16)}...</span>
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">Gemini Optimization Plan Active</span>
          </div>
        </div>

        {/* 4 Card Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <Card className="bg-slate-900/60 border-slate-850 text-slate-100 shadow-md">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Footprint</span>
              <CardTitle className="text-3xl font-extrabold text-teal-400 mt-1">
                {Math.round(totalEmissions)} <span className="text-sm font-semibold text-slate-400">kg CO₂/mo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Footprints className="h-3.5 w-3.5 text-teal-500" /> Based on your commute & lifestyle
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="bg-slate-900/60 border-slate-855 text-slate-100 shadow-md">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Your Goal</span>
              <CardTitle className="text-3xl font-extrabold text-teal-400 mt-1">
                {goalText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-teal-500" /> Targeting next 30 days
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="bg-slate-900/60 border-slate-850 text-slate-100 shadow-md">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Progress</span>
              <CardTitle className="text-3xl font-extrabold text-teal-400 mt-1">
                {progressPercentage}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-teal-500" />
                {progressPercentage > 0 ? "Emissions are decreasing!" : "Complete roadmap tasks to start"}
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="bg-slate-900/60 border-slate-855 text-slate-100 shadow-md">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Predicted Next Month</span>
              <CardTitle className="text-3xl font-extrabold text-teal-400 mt-1">
                {Math.round(predictedNextMonth)} <span className="text-sm font-semibold text-slate-400">kg CO₂</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-500" /> With successful habit reduction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Weekly Roadmap Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recharts Column */}
          <Card className="bg-slate-900/60 border-slate-850 text-slate-100 shadow-md lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-100">Monthly Emission Breakdown</CardTitle>
              <CardDescription className="text-slate-400">
                Visualizing CO₂ footprint by specific activities.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px" }}
                    itemStyle={{ color: "#2dd4bf", fontWeight: "bold" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Bar dataKey="Emissions" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Action Plan Roadmap Column */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-slate-900/60 border-slate-850 text-slate-100 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-100">
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" /> Gemini Action Plan Roadmap
                </CardTitle>
                <CardDescription className="text-slate-400">
                  A personalized 4-week task calendar crafted by our autonomous agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/80 border border-slate-855 rounded-xl p-3.5">
                  <span className="font-semibold text-teal-400 block mb-1">Agent Summary Analysis:</span>
                  {actionPlan?.geminiAnalysis || "Generating details..."}
                </p>

                {/* Week Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {actionPlan?.weeks.map((wk) => (
                    <div 
                      key={wk.week}
                      className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/25 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                            Week {wk.week}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(wk.category)}`}>
                            {wk.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                          {wk.goal}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-900">
                        {getCategoryIcon(wk.category)}
                        <span className="text-xs font-bold text-teal-400">
                          {wk.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Coach Chat Interface */}
        <Card className="bg-slate-900/60 border-slate-850 text-slate-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
          <CardHeader className="border-b border-slate-850/80 bg-slate-900/40 py-4 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-950 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">EcoPilot AI Coach</CardTitle>
                <CardDescription className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Direct access to active agent context
                </CardDescription>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChatMessages([
                  {
                    sender: "coach",
                    text: "Chat cleared. What sustainability topic or footprint metric can I help you analyze now?",
                    timestamp: new Date()
                  }
                ]);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-850 h-8"
            >
              Clear Chat
            </Button>
          </CardHeader>

          {/* Chat Logs */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.sender === "user" 
                    ? "bg-slate-900 border-slate-800 text-slate-300" 
                    : "bg-teal-950 border-teal-500/20 text-teal-400"
                }`}>
                  {msg.sender === "user" ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </div>

                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-teal-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                    : "bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none shadow-sm"
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] font-semibold mt-1.5 block text-right ${
                    msg.sender === "user" ? "text-slate-800" : "text-slate-500"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-teal-950 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Bot className="h-4.5 w-4.5 animate-bounce" />
                </div>
                <div className="bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                  <span>EcoPilot is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </CardContent>

          {/* Chat Input form */}
          <CardFooter className="border-t border-slate-850/80 bg-slate-900/40 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
              <Input
                type="text"
                placeholder="Ask your coach (e.g. 'How can I save more electricity on electric cooking?')..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 h-11 focus-visible:ring-teal-500 focus-visible:ring-offset-slate-900 text-sm rounded-lg"
                disabled={chatLoading}
                required
              />
              <Button 
                type="submit" 
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold h-11 px-4 rounded-lg flex items-center justify-center shrink-0"
                disabled={chatLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 items-center justify-center">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Fetching dashboard database state...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
