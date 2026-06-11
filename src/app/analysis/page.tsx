"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertTriangle, Cpu, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
  id: number;
  label: string;
  status: "idle" | "running" | "completed" | "error";
  description: string;
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const apiTriggeredRef = useRef(false);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 1, label: "Storing your data in MongoDB...", status: "idle", description: "Writing questionnaire answers to users collection" },
    { id: 2, label: "Calculating your carbon emissions...", status: "idle", description: "Applying mathematical formulas to commute, energy, and diet data" },
    { id: 3, label: "Gemini Agent analyzing patterns...", status: "idle", description: "Evaluating carbon hotspots using Google Gemini 2.5" },
    { id: 4, label: "Generating your personalized action plan...", status: "idle", description: "Synthesizing a 4-week reduction roadmap" },
    { id: 5, label: "Saving report to MongoDB...", status: "idle", description: "Finalizing carbon_logs and action_plans collections" },
  ]);

  const [errorMessage, setErrorMessage] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage("No session ID found. Please go back and fill the onboarding form.");
      return;
    }

    // Retrieve pending data
    const pendingDataStr = localStorage.getItem("ecoPilotPendingData");
    if (!pendingDataStr) {
      setErrorMessage("No onboarding data found. Please complete the onboarding process.");
      return;
    }

    const onboardingData = JSON.parse(pendingDataStr);

    let apiCompleted = false;
    let apiError = "";
    let simulatedIndex = 0;

    // 1. Fire the actual API call immediately
    const triggerAnalysis = async () => {
      try {
        const res = await fetch("/api/agent/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(onboardingData),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Analysis API request failed");
        }

        apiCompleted = true;
        // Clean up temporary pending data
        localStorage.removeItem("ecoPilotPendingData");
      } catch (err: any) {
        apiError = err.message || "Failed to process carbon footprint analysis";
        console.error("API Error during analysis:", err);
      }
    };

    if (!apiTriggeredRef.current) {
      apiTriggeredRef.current = true;
      triggerAnalysis();
    }

    // 2. Control visual step transitions sequentially
    const interval = setInterval(() => {
      if (apiError) {
        clearInterval(interval);
        setSteps((prev) =>
          prev.map((step, idx) => {
            if (idx === simulatedIndex) {
              return { ...step, status: "error" };
            }
            return step;
          })
        );
        setErrorMessage(apiError);
        return;
      }

      setSteps((prev) => {
        const updated = [...prev];
        
        // Complete the current running step
        if (simulatedIndex > 0) {
          updated[simulatedIndex - 1].status = "completed";
        }

        // Start the next step
        if (simulatedIndex < updated.length) {
          updated[simulatedIndex].status = "running";
          setCurrentStepIndex(simulatedIndex);
          simulatedIndex++;
        } else {
          // If we reached the end of steps, wait for the actual API to resolve
          if (apiCompleted) {
            clearInterval(interval);
            // Mark the last step completed
            updated[updated.length - 1].status = "completed";
            
            // Wait brief moment then route to dashboard
            setTimeout(() => {
              router.push(`/dashboard?sessionId=${sessionId}`);
            }, 800);
          } else {
            // Keep Step 5 running until API resolves
            updated[updated.length - 1].status = "running";
            setCurrentStepIndex(updated.length - 1);
          }
        }
        return updated;
      });
    }, 1000); // 1 second per step transitions

    return () => clearInterval(interval);
  }, [sessionId, router]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-850 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-950 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight">EcoPilot Agent Workspace</CardTitle>
                <CardDescription className="text-slate-400">
                  Executing autonomous workflows & model inference.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            {errorMessage ? (
              <div className="space-y-6 text-center py-4">
                <div className="h-14 w-14 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-rose-400">Analysis Failed</h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">{errorMessage}</p>
                </div>
                <Button
                  onClick={() => router.push("/onboarding")}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 h-10 px-5 rounded-lg font-semibold"
                >
                  Return to Onboarding
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Step Panel */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-teal-400" />
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-teal-500">ecopilot-agent ~</span> {steps[currentStepIndex]?.description || "Initializing workflow..."}
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                        step.status === "running"
                          ? "bg-teal-950/30 border-teal-500/40 text-slate-100 shadow-[0_0_15px_rgba(20,184,166,0.05)]"
                          : step.status === "completed"
                          ? "bg-slate-900/20 border-slate-850/50 text-slate-400"
                          : "bg-slate-950/20 border-slate-900/50 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold font-mono h-5 w-5 rounded-md flex items-center justify-center ${
                          step.status === "running"
                            ? "bg-teal-900 text-teal-400 border border-teal-500/20"
                            : step.status === "completed"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        }`}>
                          {step.id}
                        </span>
                        <span className="text-sm font-semibold">{step.label}</span>
                      </div>
                      
                      {step.status === "running" && (
                        <Loader2 className="h-5 w-5 text-teal-400 animate-spin" />
                      )}
                      {step.status === "completed" && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-950" />
                      )}
                      {step.status === "idle" && (
                        <div className="h-2 w-2 rounded-full bg-slate-800" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Analysis() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 items-center justify-center">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Preparing analysis workspace...</p>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
