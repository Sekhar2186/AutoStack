"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Settings, HelpCircle, Sparkles,
  Zap, Crown, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import PromptEngine from "@/components/dashboard/PromptEngine";
import IDEPanel from "@/components/dashboard/IDEPanel";
import SettingsView from "@/components/dashboard/SettingsView";
import HelpView from "@/components/dashboard/HelpView";

/* ─────────────────────────── types ──────────────────────────── */
export type MobileTab = "dashboard" | "prompt" | "projects" | "settings" | "help";

export const mobileNavItems: { id: MobileTab; icon: any; label: string; center?: boolean }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "IDE" },
  { id: "projects", icon: FolderOpen, label: "Projects" },
  { id: "prompt", icon: Sparkles, label: "Prompt", center: true },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "help", icon: HelpCircle, label: "Help" },
];

interface MobileLayoutProps {
  activeTheme: string;
  animationsEnabled: boolean;

  creditsUsed: number;
  totalCredits: number;
  userPlan: string;

  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;

  isGenerating: boolean;
  showIDE: boolean;
  setShowIDE: (show: boolean) => void;
  generatedApp: any;
  error: string | null;

  handleGenerate: (data: { prompt: string; template: string; selectedModel: string }) => void;
  handleGenerationComplete: () => void;
  handleNewProject: () => void;

  projects: any[];
  handleProjectClick: (id: string) => void;

  settingsProps: any;
}

export default function MobileLayout({
  activeTheme,
  animationsEnabled,
  creditsUsed,
  totalCredits,
  userPlan,
  mobileTab,
  setMobileTab,
  isGenerating,
  showIDE,
  setShowIDE,
  generatedApp,
  error,
  handleGenerate,
  handleGenerationComplete,
  handleNewProject,
  projects,
  handleProjectClick,
  settingsProps
}: MobileLayoutProps) {
  
  /* themes logic duplicated for independence */
  const themes: Record<string, { bg: string; glow1: string; glow2: string }> = {
    obsidian:  { bg: "bg-[#020617]",  glow1: "bg-cyan-500/5",   glow2: "bg-sky-600/5" },
    midnight:  { bg: "bg-[#000000]",  glow1: "bg-purple-500/5", glow2: "bg-fuchsia-600/5" },
    vibrant:   { bg: "bg-[#082f49]",  glow1: "bg-cyan-400/10",  glow2: "bg-teal-500/10" },
    corporate: { bg: "bg-[#0f172a]",  glow1: "bg-blue-500/5",   glow2: "bg-indigo-600/5" },
    light:     { bg: "bg-slate-50",   glow1: "bg-cyan-500/10",  glow2: "bg-purple-500/10" },
  };
  const t = themes[activeTheme] || themes.obsidian;
  const themeBase = `${t.bg} font-sans transition-colors duration-500${activeTheme === "light" ? " theme-light text-slate-900" : " text-slate-50"}${!animationsEnabled ? " no-animations" : ""}`;

  return (
    <div className={`flex md:hidden flex-col h-screen w-full overflow-hidden ${themeBase}`}>
      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full ${t.glow1} blur-[90px]`} />
        <div className={`absolute -bottom-20 -right-20 w-72 h-72 rounded-full ${t.glow2} blur-[90px]`} />
      </div>

      {/* ── Top Header ── */}
      <header className="relative z-20 shrink-0 flex items-center justify-between px-4 h-14 glass border-b border-white/[0.07]">
        {/* logo — tap to go home (/) */}
        <Link
          href="/"
          className="flex items-center gap-2 active:opacity-70 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-[0_0_14px_rgba(34,211,238,0.4)]">
            <Zap size={13} className="text-black fill-black" />
          </div>
          <span className="font-bold text-[15px] text-white">AutoStack</span>
        </Link>

        {/* right-side status */}
        <div className="flex items-center gap-2">
          {/* credits pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${creditsUsed >= totalCredits ? "bg-red-400" : "bg-cyan-400 animate-pulse"}`} />
            <span className="text-[11px] text-slate-300 font-semibold">
              {totalCredits - creditsUsed} credits
            </span>
          </div>
          {/* plan badge */}
          {userPlan !== "free" && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Crown size={10} className="text-amber-400" />
              <span className="text-[10px] text-amber-400 font-bold capitalize">{userPlan}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Content Area ── */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* PROMPT tab */}
          {mobileTab === "prompt" && (
            <motion.div key="mob-prompt"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="h-full"
            >
              <PromptEngine onGenerate={handleGenerate} isGenerating={isGenerating} />
            </motion.div>
          )}

          {/* IDE / DASHBOARD tab */}
          {mobileTab === "dashboard" && (
            <motion.div key="mob-dashboard"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="h-full"
            >
              {!showIDE && !isGenerating ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500 to-sky-600 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(34,211,238,0.35)]"
                  >
                    <span className="text-white text-2xl font-bold">A</span>
                  </motion.div>

                  <h2 className="text-xl font-bold text-slate-100 mb-2">Command Center</h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
                    Tap <span className="text-cyan-400 font-semibold">Prompt</span> below to describe your app, then AutoStack AI builds it instantly.
                  </p>

                  <button
                    onClick={() => setMobileTab("prompt")}
                    className="shimmer-btn w-full max-w-xs flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-linear-to-r from-cyan-500/20 to-sky-600/20 border border-cyan-500/30 text-cyan-300 font-semibold text-sm mb-3"
                  >
                    <Sparkles size={15} />
                    Open Prompt Engine
                  </button>

                  {generatedApp && (
                    <button
                      onClick={() => setShowIDE(true)}
                      className="w-full max-w-xs px-5 py-3 rounded-2xl glass border border-white/10 text-slate-300 font-medium text-sm"
                    >
                      Resume Last Project →
                    </button>
                  )}
                </div>
              ) : (
                <IDEPanel
                  app={generatedApp}
                  isGenerating={isGenerating}
                  error={error}
                  onComplete={handleGenerationComplete}
                  onClose={() => setShowIDE(false)}
                />
              )}
            </motion.div>
          )}

          {/* PROJECTS tab */}
          {mobileTab === "projects" && (
            <motion.div key="mob-projects"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="h-full overflow-y-auto"
            >
              <div className="p-4 pb-6">
                {/* header row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">Your Projects</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">AI-generated applications</p>
                  </div>
                  <button
                    onClick={handleNewProject}
                    className="shimmer-btn px-3 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-sky-600 text-xs font-bold text-white shadow-[0_0_16px_rgba(34,211,238,0.3)]"
                  >
                    + New
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/5 rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-slate-400">
                      <FolderOpen size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-300 mb-1">No projects yet</h3>
                    <p className="text-xs text-slate-500 max-w-[200px]">
                      Describe your first app in the Prompt tab to get started.
                    </p>
                    <button
                      onClick={() => setMobileTab("prompt")}
                      className="mt-4 px-4 py-2 rounded-xl glass border border-cyan-500/20 text-cyan-400 text-xs font-semibold"
                    >
                      Go to Prompt →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {projects.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleProjectClick(p.projectId)}
                        className="glass p-4 rounded-2xl border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <h3 className="text-base font-bold text-slate-100 mb-1 truncate">{p.appName}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-600">
                          <span className="font-mono">{p.projectId?.slice(0, 10)}…</span>
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SETTINGS tab */}
          {mobileTab === "settings" && (
            <motion.div key="mob-settings"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="h-full"
            >
              <SettingsView
                {...settingsProps}
                onBack={() => setMobileTab("dashboard")}
              />
            </motion.div>
          )}

          {/* HELP tab */}
          {mobileTab === "help" && (
            <motion.div key="mob-help"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              className="h-full"
            >
              <HelpView onBack={() => setMobileTab("dashboard")} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom Navigation ── */}
      <nav
        className="relative z-20 shrink-0 glass border-t border-white/[0.07]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch justify-around h-16">
          {mobileNavItems.map(({ id, icon: Icon, label, center }) => {
            const isActive = mobileTab === id;
            /* notification dot on IDE tab when generating or IDE is open */
            const showDot = id === "dashboard" && (isGenerating || showIDE);

            if (center) {
              /* ── Central FAB-style prompt button ── */
              return (
                <button
                  key={id}
                  id={`mobile-nav-${id}`}
                  onClick={() => setMobileTab(id)}
                  className="relative flex flex-col items-center justify-end pb-1 flex-1"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className={`-mt-5 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-[0_6px_24px_rgba(34,211,238,0.45)] ${isActive
                      ? "bg-linear-to-br from-cyan-400 to-sky-500 scale-105"
                      : "bg-linear-to-br from-cyan-500 to-sky-600"
                      }`}
                  >
                    <Icon size={22} className="text-white" />
                  </motion.div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide mt-1 ${isActive ? "text-cyan-400" : "text-slate-500"}`}>
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={id}
                id={`mobile-nav-${id}`}
                onClick={() => setMobileTab(id)}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${isActive ? "text-cyan-400" : "text-slate-500"
                  }`}
              >
                {/* active top indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mob-nav-line"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {/* icon + notification dot */}
                <div className="relative">
                  <Icon size={20} />
                  {showDot && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 border-2 border-[#020617]" />
                  )}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? "text-cyan-400" : "text-slate-600"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
