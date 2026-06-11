import Link from "next/link";
import { ArrowRight, Leaf, ShieldAlert, Cpu, Database, BarChart3, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-950 border border-teal-500/30 p-2 rounded-lg text-teal-400">
              <Leaf className="h-6 w-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              EcoPilot AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Agent Status: Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 pt-20 pb-16 text-center max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-900 border border-slate-800 text-slate-300 mb-8 hover:border-teal-500/30 transition-all duration-300">
          <span className="text-teal-400">⚡ Google Cloud Hackathon Submission</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">MongoDB Track</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Your AI-Powered <br />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            Carbon Reduction Agent
          </span>
        </h1>

        <p className="text-xl md:text-2xl font-light text-slate-400 italic mb-10 max-w-2xl">
          &ldquo;Not a chatbot. An agent that acts.&rdquo;
        </p>

        <p className="text-base md:text-lg text-slate-400 max-w-xl mb-12">
          EcoPilot autonomously collects your footprint, stores it securely in MongoDB, calculates emissions, generates a personalized 4-week roadmap using Google Gemini, and tracks your progress dynamically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link href="/onboarding" passHref className="w-full">
            <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300 flex items-center justify-center gap-2 border-0 group">
              Start Reducing My Carbon Footprint
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              How EcoPilot Operates
            </h2>
            <p className="text-slate-400 mt-4 text-lg">
              Observe how the autonomous agent handles calculations and generates intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-900 transition-colors">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-teal-400 transition-colors">
                1. Data Onboarding
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Provide basic metrics on transportation, energy use, and dietary habits. EcoPilot saves your data securely inside MongoDB Atlas.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-900 transition-colors">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-emerald-400 transition-colors">
                2. Autonomous Analysis
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                The agent processes formulas to compile your carbon load. It queries Gemini API to isolate emission spikes and design a 4-week task plan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-8 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-900 transition-colors">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-cyan-400 transition-colors">
                3. Interactive Dashboard
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Track your weekly objectives, view a breakdown of carbon consumption in Recharts, and ask questions to the active AI Coach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-8">
            Engineered with Production-Grade Integrations
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75 hover:opacity-100 transition-opacity duration-300">
            {/* Gemini */}
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="font-bold text-sm bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Google Gemini API
              </span>
            </div>

            {/* MongoDB */}
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-sm bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                MongoDB Atlas
              </span>
            </div>

            {/* Google Cloud */}
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="font-bold text-sm bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Google Cloud Platform
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-semibold text-slate-500">
              EcoPilot AI © 2026. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Google Cloud Rapid Agent Hackathon Submission</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
