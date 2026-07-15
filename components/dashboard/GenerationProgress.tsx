"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check, Loader2, Sparkles, LayoutTemplate, Blocks,
  FileCode2, Server, TerminalSquare, MonitorPlay
} from "lucide-react";

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete: () => void;
}

const steps = [
  { label: "Analyzing Prompt", desc: "Extracting requirements & AI context", duration: 1200, icon: Sparkles },
  { label: "Planning Architecture", desc: "Designing component tree & state", duration: 1800, icon: LayoutTemplate },
  { label: "Generating Components", desc: "Writing React components", duration: 2500, icon: Blocks },
  { label: "Generating Pages", desc: "Setting up Next.js app router", duration: 3000, icon: FileCode2 },
  { label: "Generating APIs", desc: "Creating backend endpoints", duration: 2000, icon: Server },
  { label: "Injecting Code", desc: "Linking modules & dependencies", duration: 1000, icon: TerminalSquare },
  { label: "Starting Preview", desc: "Booting up WebContainer sandbox", duration: 2000, icon: MonitorPlay },
];

export default function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;

    let stepIndex = 0;
    const totalSteps = steps.length;

    const advance = () => {
      if (stepIndex < totalSteps) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(advance, steps[stepIndex - 1]?.duration || 1500);
      } else {
        setCompleted(true);
        setTimeout(() => {
          onComplete();
        }, 1200); // Give a bit more time to see the 100% state
      }
    };

    advance();
  }, [isGenerating, onComplete]);

  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);

  return (
    <div className="h-full w-full bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl relative">
        {/* Glow behind the card */}
        <div className="absolute -inset-1 rounded-[2rem] bg-linear-to-b from-cyan-500/20 to-purple-600/20 blur-2xl opacity-50 pointer-events-none" />

        <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 via-sky-500 to-purple-600" />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  {completed ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Check size={16} className="text-emerald-400" />
                      </div>
                      Generation Complete!
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                      </div>
                      Building Application
                    </>
                  )}
                </h1>
                <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-md">
                  {completed
                    ? "Your AI-generated application is ready to be previewed and deployed."
                    : "Our multi-agent system is currently architecting and writing your codebase."}
                </p>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/50">
                  {Math.round(completed ? 100 : progress)}%
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                  Overall Progress
                </div>
              </div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="p-6 sm:p-8 bg-black/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {steps.map((step, index) => {
                const isActive = index === currentStep && !completed;
                const isDone = index < currentStep || completed;
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative overflow-hidden flex items-start gap-3 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 transition-all duration-500 ${isDone
                        ? "border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                        : isActive
                          ? "border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                          : "border-white/5 bg-white/5 opacity-50"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                      />
                    )}

                    <div className="relative z-10 shrink-0 mt-0.5">
                      {isDone ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <Check size={14} className="text-emerald-400" />
                        </div>
                      ) : isActive ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                          <Loader2 size={14} className="text-cyan-400 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-500">
                          <StepIcon size={14} />
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h3 className={`text-xs sm:text-sm font-bold transition-colors ${isDone ? "text-emerald-400" : isActive ? "text-white" : "text-slate-400"
                        }`}>
                        {step.label}
                      </h3>
                      <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 transition-colors ${isActive ? "text-slate-300" : "text-slate-500"
                        }`}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer Progress */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 bg-white/2 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="w-full flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${completed ? 100 : progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-linear-to-r from-cyan-500 to-sky-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
              />
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-400 shrink-0 w-full sm:w-auto text-center sm:text-left">
              {completed ? "Done" : `Processing step ${Math.min(currentStep + 1, steps.length)} of ${steps.length}`}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
