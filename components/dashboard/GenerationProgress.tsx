"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Zap } from "lucide-react";

const stages = [
  { id: "planner", label: "plannerAgent", detail: "Orchestrating project structure from prompt" },
  { id: "component", label: "componentAgent", detail: "Generating reusable UI components and styles" },
  { id: "page", label: "pageAgent", detail: "Assembling pages and defining layout hierarchy" },
  { id: "coder", label: "coderAgent", detail: "Writing core business logic and API handlers" },
  { id: "route", label: "routeAgent", detail: "Connecting agents and final code injection" },
  { id: "sandbox", label: "sandbox", detail: "Launching live preview environment" },
];

interface Props {
  isGenerating: boolean;
  onComplete: () => void;
}

export default function GenerationProgress({ isGenerating, onComplete }: Props) {
  const [currentStage, setCurrentStage] = useState(-1);
  const [stageProgress, setStageProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    if (!isGenerating) { setCurrentStage(-1); setStageProgress(0); setDone(false); return; }
    setDone(false); setCurrentStage(0); setStageProgress(0);
  }, [isGenerating]);

  useEffect(() => {
    if (currentStage < 0 || done) return;
    const t = setInterval(() => setStageProgress((p) => Math.min(p + 2.5 + Math.random() * 2, 100)), 80);
    return () => clearInterval(t);
  }, [currentStage, done]);

  useEffect(() => {
    if (stageProgress < 100 || currentStage < 0) return;
    const next = currentStage + 1;
    if (next >= stages.length) { setDone(true); setTimeout(handleComplete, 800); return; }
    const t = setTimeout(() => { setCurrentStage(next); setStageProgress(0); }, 350);
    return () => clearTimeout(t);
  }, [stageProgress, currentStage, handleComplete]);

  const total = done ? 100 : currentStage < 0 ? 0 : Math.round(((currentStage + stageProgress / 100) / stages.length) * 100);

  if (!isGenerating) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="w-full h-full flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="glass rounded-2xl border border-white/8 p-8 w-full max-w-md mx-4 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              {done ? <Check size={18} className="text-white" /> : <Zap size={18} className="text-white fill-white" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{done ? "Generation Complete!" : "AutoStack AI is building your app"}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{done ? "Your app is ready to preview" : `Stage ${Math.max(currentStage + 1, 1)} of ${stages.length}`}</p>
            </div>
            <span className="ml-auto text-xl font-extrabold gradient-text">{total}%</span>
          </div>

          <div className="h-2 rounded-full bg-white/6 overflow-hidden mb-6">
            <motion.div className="h-full rounded-full bg-linear-to-r from-cyan-500 to-purple-600" animate={{ width: `${total}%` }} transition={{ duration: 0.3 }} />
          </div>

          <div className="flex flex-col gap-3">
            {stages.map((stage, idx) => {
              const complete = done || idx < currentStage;
              const active = !done && idx === currentStage;
              return (
                <div key={stage.id} className={`flex items-start gap-3 transition-opacity ${!done && idx > currentStage ? "opacity-35" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${complete ? "bg-emerald-500/15 border-emerald-500/40" : active ? "bg-cyan-500/15 border-cyan-500/40" : "bg-white/3 border-white/7"}`}>
                    {complete ? <Check size={11} className="text-emerald-400" /> : active ? <Loader2 size={11} className="text-cyan-400 animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/15" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-semibold ${complete ? "text-emerald-400" : active ? "text-cyan-300" : "text-slate-600"}`}>{stage.label}</span>
                      {active && <span className="text-[10px] text-cyan-500 terminal-font">{Math.round(stageProgress)}%</span>}
                    </div>
                    {active && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <p className="text-[10px] text-slate-600 mt-0.5">{stage.detail}</p>
                        <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-linear-to-r from-cyan-500 to-purple-600" animate={{ width: `${stageProgress}%` }} transition={{ duration: 0.15 }} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
