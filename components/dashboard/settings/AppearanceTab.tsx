"use client";

import { motion } from "framer-motion";

interface AppearanceTabProps {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  animationsEnabled: boolean;
  onToggleAnimations: () => void;
}

const themes = [
  { id: "obsidian", name: "Obsidian Glass", bg: "bg-[#020617]" },
  { id: "midnight", name: "Deep Midnight", bg: "bg-black" },
  { id: "vibrant", name: "Vibrant Cyan", bg: "bg-[#082f49]" },
  { id: "corporate", name: "Corporate Blue", bg: "bg-slate-900" },
  { id: "light", name: "Light Theme", bg: "bg-slate-100 border-slate-300" },
];

export default function AppearanceTab({ activeTheme, setActiveTheme, animationsEnabled, onToggleAnimations }: AppearanceTabProps) {
  return (
    <div className="space-y-8">
      {/* Theme Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-6">Theme & Personalization</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => { setActiveTheme(theme.id); localStorage.setItem("theme", theme.id); }}
              className={`group relative aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${activeTheme === theme.id ? "border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-white/5 hover:border-white/20"}`}
            >
              <div className={`w-full h-full ${theme.bg} p-3`}>
                <div className={`w-1/2 h-1.5 rounded mb-1 ${theme.id === "light" ? "bg-slate-300" : "bg-white/10"}`} />
                <div className={`w-full h-1.5 rounded mb-1 ${theme.id === "light" ? "bg-slate-200" : "bg-white/5"}`} />
                <div className={`w-2/3 h-1.5 rounded ${theme.id === "light" ? "bg-slate-200" : "bg-white/5"}`} />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{theme.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-200">Developer Options</h4>
        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
          <div>
            <div className="text-sm font-medium text-slate-200">Animations</div>
            <div className="text-xs text-slate-500">Enable smooth UI transitions and micro-interactions</div>
          </div>
          <button
            onClick={onToggleAnimations}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer outline-none border ${animationsEnabled ? "bg-cyan-500/20 border-cyan-500/30" : "bg-slate-700/20 border-slate-700/30"}`}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute w-3 h-3 rounded-full ${animationsEnabled ? "right-1 bg-cyan-400" : "left-1 bg-slate-400"} top-1`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
