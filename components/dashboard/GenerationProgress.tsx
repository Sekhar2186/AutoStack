"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete: () => void;
}

const steps = [
  { label: "Analyzing Prompt", duration: 1200 },
  { label: "Planning Architecture", duration: 1800 },
  { label: "Generating Components", duration: 2500 },
  { label: "Generating Pages", duration: 3000 },
  { label: "Generating APIs", duration: 2000 },
  { label: "Generating Documentation", duration: 1500 },
  { label: "Injecting Code", duration: 1000 },
  { label: "Starting Preview Server", duration: 2000 },
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
        }, 800);
      }
    };

    advance();
  }, [isGenerating, onComplete]);

  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);

  return (
    <div className="h-full w-full bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {completed ? "Generation Complete!" : "AutoStack AI Generation"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {completed
              ? "Your application is ready to preview."
              : "Multi-Agent System Building Your Application..."}
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep && !completed;
            const isDone = index < currentStep || completed;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`flex items-center gap-4 rounded-2xl border p-3.5 transition-all duration-300 ${isDone
                    ? "border-cyan-500/20 bg-cyan-500/5"
                    : isActive
                      ? "border-cyan-500/30 bg-cyan-500/10"
                      : "border-white/5 bg-white/3"
                  }`}
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <Check size={14} className="text-cyan-400" />
                  ) : isActive ? (
                    <Loader2 size={14} className="text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${isDone
                      ? "text-cyan-400"
                      : isActive
                        ? "text-slate-200"
                        : "text-slate-600"
                    }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 overflow-hidden rounded-full bg-white/5 h-2">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${completed ? 100 : progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-linear-to-r from-cyan-500 via-sky-500 to-purple-500 rounded-full"
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-600">
          <span>Step {Math.min(currentStep + 1, steps.length)} of {steps.length}</span>
          <span>{Math.round(completed ? 100 : progress)}%</span>
        </div>
      </div>
    </div>
  );
}
