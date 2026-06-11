"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Leaf, Car, Bus, Train, Bike, Footprints, Flame, Lightbulb, ChefHat, ShoppingBag, Target, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState("");
  const [progress, setProgress] = useState(33);

  // Onboarding Form State
  const [commuteType, setCommuteType] = useState("car");
  const [dailyKm, setDailyKm] = useState("15");
  const [flightsPerYear, setFlightsPerYear] = useState("2");
  
  const [electricityKwh, setElectricityKwh] = useState("200");
  const [cookingFuel, setCookingFuel] = useState("electric");

  const [diet, setDiet] = useState("vegetarian");
  const [shopping, setShopping] = useState("medium");
  const [goal, setGoal] = useState("Reduce by 20%");

  useEffect(() => {
    // Generate or fetch session ID from localStorage
    let storedSessionId = localStorage.getItem("ecoPilotSessionId");
    if (!storedSessionId) {
      storedSessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("ecoPilotSessionId", storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  useEffect(() => {
    // Calculate progress percentage
    if (step === 1) setProgress(33);
    else if (step === 2) setProgress(66);
    else if (step === 3) setProgress(100);
  }, [step]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sessionId,
      transportation: {
        type: commuteType,
        dailyKm: Number(dailyKm) || 0,
        flightsPerYear: Number(flightsPerYear) || 0,
      },
      homeEnergy: {
        electricityKwh: Number(electricityKwh) || 0,
        cookingFuel,
      },
      lifestyle: {
        diet,
        shopping,
      },
      goal,
    };

    // Save inputs to localStorage temporary state, so analysis page can display it
    localStorage.setItem("ecoPilotPendingData", JSON.stringify(payload));
    
    // Redirect to analysis page which performs the multi-step background process
    router.push(`/analysis?sessionId=${sessionId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative items-center justify-center py-12 px-4 sm:px-6">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-teal-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Title / Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-teal-950 border border-teal-500/30 p-1.5 rounded-lg text-teal-400">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            EcoPilot AI - Onboarding
          </span>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="mb-6 px-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Step {step} of 3</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-900 [&>div]:bg-teal-500" />
        </div>

        {/* Step Cards */}
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-teal-400 flex items-center gap-2">
                  <Car className="h-6 w-6 text-teal-400" /> Commute & Transportation
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Help EcoPilot calculate your monthly transit emissions profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Commute Type Radio Cards */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-300">How do you primarily commute?</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: "car", icon: Car, label: "Car" },
                      { id: "bus", icon: Bus, label: "Bus" },
                      { id: "train", icon: Train, label: "Train" },
                      { id: "bike", icon: Bike, label: "Bike" },
                      { id: "walk", icon: Footprints, label: "Walk" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = commuteType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCommuteType(item.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 ${
                            isSelected
                              ? "bg-teal-950/60 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Icon className="h-6 w-6 mb-1.5" />
                          <span className="text-xs font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Distance */}
                <div className="space-y-2">
                  <Label htmlFor="dailyKm" className="text-sm font-semibold text-slate-300">
                    Daily commute distance (Round trip in km)
                  </Label>
                  <div className="relative">
                    <Input
                      id="dailyKm"
                      type="number"
                      min="0"
                      value={dailyKm}
                      onChange={(e) => setDailyKm(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-slate-100 h-11 focus-visible:ring-teal-500 focus-visible:ring-offset-slate-950 pl-4"
                      required
                    />
                    <span className="absolute right-4 top-3 text-sm text-slate-500 font-semibold">km</span>
                  </div>
                </div>

                {/* Flights */}
                <div className="space-y-2">
                  <Label htmlFor="flightsPerYear" className="text-sm font-semibold text-slate-300">
                    Number of airplane flights per year
                  </Label>
                  <div className="relative">
                    <Input
                      id="flightsPerYear"
                      type="number"
                      min="0"
                      value={flightsPerYear}
                      onChange={(e) => setFlightsPerYear(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-slate-100 h-11 focus-visible:ring-teal-500 focus-visible:ring-offset-slate-950 pl-4"
                      required
                    />
                    <span className="absolute right-4 top-3 text-sm text-slate-500 font-semibold">flights</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold h-11 px-5 rounded-lg flex items-center gap-1.5 transition-all duration-300"
                >
                  Next step
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 text-slate-100 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-teal-400 flex items-center gap-2">
                  <Flame className="h-6 w-6 text-teal-400" /> Home Energy Profile
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Information on your residential power grid supply and fuels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Electricity */}
                <div className="space-y-2">
                  <Label htmlFor="electricityKwh" className="text-sm font-semibold text-slate-300">
                    Monthly electricity consumption (kWh)
                  </Label>
                  <div className="relative">
                    <Input
                      id="electricityKwh"
                      type="number"
                      min="0"
                      value={electricityKwh}
                      onChange={(e) => setElectricityKwh(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-slate-100 h-11 focus-visible:ring-teal-500 focus-visible:ring-offset-slate-950 pl-4"
                      required
                    />
                    <span className="absolute right-4 top-3 text-sm text-slate-500 font-semibold">kWh</span>
                  </div>
                </div>

                {/* Cooking Fuel */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-300">Primary cooking fuel source</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "electric", label: "Electric / Induction", desc: "Eco-friendly option" },
                      { id: "lpg", label: "LPG / Natural Gas", desc: "Standard fossil gas" },
                      { id: "none", label: "None / Prepackaged", desc: "No home cooking" },
                    ].map((item) => {
                      const isSelected = cookingFuel === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCookingFuel(item.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-teal-950/60 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <ChefHat className="h-6 w-6 mb-2" />
                          <span className="text-xs font-bold block mb-1">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="border-slate-850 hover:bg-slate-900 text-slate-300 font-semibold h-11 px-5 rounded-lg flex items-center gap-1.5 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold h-11 px-5 rounded-lg flex items-center gap-1.5 transition-all duration-300"
                >
                  Next step
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 text-slate-100 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-teal-400 flex items-center gap-2">
                  <Target className="h-6 w-6 text-teal-400" /> Lifestyle & Reduction Goals
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Assess consumption variables and select a target reduction bracket.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Diet */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-300">What is your typical dietary profile?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "vegan", label: "Vegan", desc: "No animal products" },
                      { id: "vegetarian", label: "Vegetarian", desc: "Dairy/Eggs included" },
                      { id: "non-veg", label: "Non-Vegetarian", desc: "Meat/Poultry/Fish" },
                    ].map((item) => {
                      const isSelected = diet === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDiet(item.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-teal-950/60 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Leaf className="h-6 w-6 mb-2 text-teal-500" />
                          <span className="text-xs font-bold block mb-1">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shopping */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-300">How would you describe your shopping frequency?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "low", label: "Low", desc: "Minimalist buying" },
                      { id: "medium", label: "Medium", desc: "Moderate retail" },
                      { id: "high", label: "High", desc: "Frequent buying" },
                    ].map((item) => {
                      const isSelected = shopping === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setShopping(item.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-teal-950/60 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <ShoppingBag className="h-6 w-6 mb-2" />
                          <span className="text-xs font-bold block mb-1">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Goals */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-300">Define your monthly CO₂ reduction target</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "Reduce by 10%", label: "Reduce by 10%", desc: "Introductory action" },
                      { id: "Reduce by 20%", label: "Reduce by 20%", desc: "Standard targets" },
                      { id: "Reduce by 30%", label: "Reduce by 30%", desc: "Ambitious reductions" },
                    ].map((item) => {
                      const isSelected = goal === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setGoal(item.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-teal-950/60 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <CheckCircle2 className="h-6 w-6 mb-2 text-teal-500" />
                          <span className="text-xs font-bold block mb-1">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="border-slate-850 hover:bg-slate-900 text-slate-300 font-semibold h-11 px-5 rounded-lg flex items-center gap-1.5 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold h-11 px-6 rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all duration-300 border-0"
                >
                  Analyze My Footprint
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
