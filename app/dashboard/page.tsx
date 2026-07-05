"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Cpu, GitBranch, Clock, Check, Lock, Crown, Server, ArrowLeft,
  Zap, LayoutDashboard, FolderOpen, Settings, HelpCircle, Sparkles,
  ArrowUpRight
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import PromptEngine from "@/components/dashboard/PromptEngine";
import IDEPanel from "@/components/dashboard/IDEPanel";
import SettingsView from "@/components/dashboard/SettingsView";
import HelpView from "@/components/dashboard/HelpView";
import { toast } from "sonner";
import ProjectActionsMenu from "@/components/dashboard/ProjectActionsMenu";

import MobileLayout, { MobileTab } from "@/components/dashboard/MobileLayout";

/* ─────────────────────────── component ──────────────────────── */
export default function CommandCenter() {
  /* desktop sidebar */
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  /* mobile tab */
  const [mobileTab, setMobileTab] = useState<MobileTab>("prompt");

  /* generation */
  const [isGenerating, setIsGenerating] = useState(false);
  const [showIDE, setShowIDE] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /* user / credits */
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [totalCredits, setTotalCredits] = useState(20);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [usageTrend, setUsageTrend] = useState<number[]>(Array(30).fill(0));
  const [genHistoryCount, setGenHistoryCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [userAvatar, setUserAvatar] = useState("");

  /* theme */
  const [activeTheme, setActiveTheme] = useState("obsidian");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  /* projects */
  const [projects, setProjects] = useState<any[]>([]);

  /* desktop panel drag */
  const [leftPanelWidth, setLeftPanelWidth] = useState(400);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(400);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = leftPanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [leftPanelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.min(700, Math.max(240, dragStartWidth.current + delta));
      setLeftPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /* load saved theme / animations */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setActiveTheme(savedTheme);
    const savedAnim = localStorage.getItem("animations");
    if (savedAnim !== null) setAnimationsEnabled(savedAnim === "true");
  }, []);

  const handleToggleAnimations = () => {
    setAnimationsEnabled(prev => {
      const next = !prev;
      localStorage.setItem("animations", String(next));
      return next;
    });
  };

  /* fetch user data + projects */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !token.startsWith("mock_")) {
      fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const u = data.user;
            setTotalCredits(u.totalCredits);
            setCreditsUsed(u.creditsUsedToday);
            setCreditHistory(u.creditHistory || []);
            setUsageTrend(u.usageTrend || Array(30).fill(0));
            setGenHistoryCount(u.genHistoryCount || 0);
            setProjectCount(u.projectCount || 0);
            setUserName(u.name || "");
            setUserEmail(u.email || "");
            setUserPlan(u.plan || "free");
            setUserAvatar(u.avatar || "");
          }
        })
        .catch(err => console.error("Failed to fetch user info:", err));

      if (activeNav === "projects" || mobileTab === "projects") {
        fetch("/api/projects", { headers: { "Authorization": `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => {
            if (data.success && data.projects.length > 0) {
              setProjects(data.projects);
            } else {
              setProjects(JSON.parse(localStorage.getItem("guestProjects") || "[]"));
            }
          })
          .catch(() => setProjects(JSON.parse(localStorage.getItem("guestProjects") || "[]")));
      }
    } else {
      setProjects(JSON.parse(localStorage.getItem("guestProjects") || "[]"));
    }
  }, [activeNav, mobileTab]);

  /* generate */
  const handleGenerate = async (data: { prompt: string; template: string; selectedModel: string }) => {
    setIsGenerating(true);
    setShowIDE(false);
    setError(null);
    setMobileTab("dashboard"); // switch to IDE tab so progress is visible

    try {
      const payload: any = { ...data };
      if (generatedApp?.projectId) payload.projectId = generatedApp.projectId;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Backend generation failed");
      const result = await response.json();

      if (result.success) {
        setGeneratedApp(result);

        if (!payload.projectId) {
          const newProject = {
            projectId: result.projectId,
            appName: result.blueprint?.appName || "Untitled Project",
            description: result.blueprint?.description || payload.prompt.substring(0, 80) + "...",
            createdAt: new Date().toISOString()
          };
          setProjects(prev => [newProject, ...prev]);
          const guestProjects = JSON.parse(localStorage.getItem("guestProjects") || "[]");
          guestProjects.unshift(newProject);
          localStorage.setItem("guestProjects", JSON.stringify(guestProjects));
        }

        setCreditsUsed(prev => Math.min(prev + 1, totalCredits));
        setGenHistoryCount(prev => prev + 1);

        const token = localStorage.getItem("token");
        if (token && !token.startsWith("mock_")) {
          fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
            .then(r => r.json())
            .then(freshData => {
              if (freshData.success) {
                const u = freshData.user;
                setCreditsUsed(u.creditsUsedToday);
                setCreditHistory(u.creditHistory || []);
                setUsageTrend(u.usageTrend || Array(30).fill(0));
                setGenHistoryCount(u.genHistoryCount || 0);
              }
            })
            .catch(() => { });
        }
      } else {
        throw new Error(result.error || "Failed to generate project");
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "An unexpected error occurred");
      setIsGenerating(false);
    }
  };

  const handleProjectClick = async (projectId: string) => {
    setIsGenerating(true);
    setShowIDE(true);
    setActiveNav("dashboard");
    setMobileTab("dashboard");
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedApp(data.project);
        setIsGenerating(false);
      } else {
        throw new Error(data.message || "Failed to load project");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    setShowIDE(true);
    setMobileTab("dashboard");
  };

  const handleNewProject = () => {
    setGeneratedApp(null);
    setShowIDE(false);
    setActiveNav("dashboard");
    setMobileTab("prompt");
  };

  const handleDeleteSuccess = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.projectId !== projectId));
    setProjectCount(prev => Math.max(0, prev - 1));
    toast.success("Project deleted successfully.");
    const guestProjects = JSON.parse(localStorage.getItem("guestProjects") || "[]");
    const updatedGuest = guestProjects.filter((p: any) => p.projectId !== projectId);
    localStorage.setItem("guestProjects", JSON.stringify(updatedGuest));
  };

  /* themes */
  const themes: Record<string, { bg: string; glow1: string; glow2: string }> = {
    obsidian: { bg: "bg-[#020617]", glow1: "bg-cyan-500/5", glow2: "bg-sky-600/5" },
    midnight: { bg: "bg-[#000000]", glow1: "bg-purple-500/5", glow2: "bg-fuchsia-600/5" },
    vibrant: { bg: "bg-[#082f49]", glow1: "bg-cyan-400/10", glow2: "bg-teal-500/10" },
    corporate: { bg: "bg-[#0f172a]", glow1: "bg-blue-500/5", glow2: "bg-indigo-600/5" },
    light: { bg: "bg-slate-50", glow1: "bg-cyan-500/10", glow2: "bg-purple-500/10" },
  };
  const t = themes[activeTheme] || themes.obsidian;
  const themeBase = `${t.bg} font-sans transition-colors duration-500${activeTheme === "light" ? " theme-light text-slate-900" : " text-slate-50"}${!animationsEnabled ? " no-animations" : ""}`;

  /* ─────────────── shared sub-views (used by both layouts) ──── */
  const settingsViewProps = {
    credits: { used: creditsUsed, total: totalCredits },
    creditHistory,
    usageTrend,
    genHistoryCount,
    projectCount,
    userName,
    userEmail,
    userPlan,
    userAvatar,
    onUpdateUser: ({ name, email, avatar }: any) => {
      if (name !== undefined) setUserName(name);
      if (email !== undefined) setUserEmail(email);
      if (avatar !== undefined) setUserAvatar(avatar);
    },
    activeTheme,
    setActiveTheme,
    animationsEnabled,
    onToggleAnimations: handleToggleAnimations,
  };

  /* ╔══════════════════════════════════════════════════════════╗
     ║                        RENDER                           ║
     ╚══════════════════════════════════════════════════════════╝ */
  return (
    <MotionConfig reducedMotion={animationsEnabled ? "user" : "always"}>

      {/* ══════════════════ MOBILE LAYOUT (< md) ══════════════════ */}
      <MobileLayout
        activeTheme={activeTheme}
        animationsEnabled={animationsEnabled}
        creditsUsed={creditsUsed}
        totalCredits={totalCredits}
        userPlan={userPlan}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        isGenerating={isGenerating}
        showIDE={showIDE}
        setShowIDE={setShowIDE}
        generatedApp={generatedApp}
        error={error}
        handleGenerate={handleGenerate}
        handleGenerationComplete={handleGenerationComplete}
        handleNewProject={handleNewProject}
        projects={projects}
        handleProjectClick={handleProjectClick}
        handleDeleteSuccess={handleDeleteSuccess}
        settingsProps={settingsViewProps}
      />

      {/* ══════════════════ DESKTOP LAYOUT (md+) ══════════════════ */}
      <main className={`hidden md:flex h-screen w-full overflow-hidden ${themeBase}`}>
        {/* Background ambient effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full ${t.glow1} blur-[120px] transition-colors duration-500`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full ${t.glow2} blur-[120px] transition-colors duration-500`} />
        </div>

        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          credits={{ used: creditsUsed, total: totalCredits }}
          userPlan={userPlan}
        />

        {/* Main Workspace */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex h-full overflow-hidden">

            {/* Left: Prompt Engine */}
            <section
              className="h-full border-r border-white/5 relative z-10 shrink-0"
              style={{ width: leftPanelWidth }}
            >
              <PromptEngine onGenerate={handleGenerate} isGenerating={isGenerating} />
            </section>

            {/* Drag Handle */}
            <div
              onMouseDown={handleDividerMouseDown}
              className="group relative z-20 flex items-center justify-center w-1.5 shrink-0 cursor-col-resize hover:bg-cyan-500/20 transition-colors duration-150 select-none"
              title="Drag to resize panels"
            >
              <div className="absolute h-16 w-1 rounded-full bg-white/10 group-hover:bg-cyan-400/60 transition-all duration-150 group-hover:h-24" />
              <div className="absolute flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <span className="w-0.5 h-0.5 rounded-full bg-cyan-400" />
                <span className="w-0.5 h-0.5 rounded-full bg-cyan-400" />
                <span className="w-0.5 h-0.5 rounded-full bg-cyan-400" />
              </div>
            </div>

            {/* Right: IDE / View Panel */}
            <section className="h-full p-4 relative z-10 overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
              <AnimatePresence mode="wait">

                {/* Dashboard / IDE view */}
                {activeNav === "dashboard" && (
                  <motion.div key="desktop-dashboard"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    {!showIDE && !isGenerating && (
                      <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full glass rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-8"
                      >
                        <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-cyan-500/10 to-sky-600/10 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          >
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg">
                              <span className="text-white text-xl font-bold">A</span>
                            </div>
                          </motion.div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-3">Welcome to the Command Center</h2>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                          Describe your application in the prompt engine to the left.
                          Our AI will handle the architecture, components, and backend logic in seconds.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-lg">
                          {[
                            generatedApp
                              ? { title: "Resume Current Project", desc: "Return to your active IDE session", action: () => setShowIDE(true) }
                              : { title: "Recent Projects", desc: "Access your last 5 builds", action: () => setActiveNav("projects") },
                            { title: "New Templates", desc: "Start from high-quality presets", action: () => setActiveNav("dashboard") },
                            { title: "Community", desc: "Explore what others are building", action: () => setActiveNav("help") },
                            { title: "Settings", desc: "Manage your API keys & models", action: () => setActiveNav("settings") }
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              onClick={item.action}
                              className={`glass glass-hover p-4 rounded-xl border border-white/5 text-left transition-all cursor-pointer ${item.title === "Resume Current Project" ? "bg-cyan-500/10 border-cyan-500/30" : ""}`}
                            >
                              <h4 className={`text-sm font-semibold mb-1 ${item.title === "Resume Current Project" ? "text-cyan-400" : "text-slate-300"}`}>{item.title}</h4>
                              <p className="text-[11px] text-slate-600">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className={`h-full transition-opacity duration-200 ${(showIDE || isGenerating) ? "block opacity-100" : "hidden opacity-0 pointer-events-none"}`}>
                      <IDEPanel
                        app={generatedApp}
                        isGenerating={isGenerating}
                        error={error}
                        onComplete={handleGenerationComplete}
                        onClose={() => setShowIDE(false)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Projects view */}
                {activeNav === "projects" && (
                  <motion.div key="desktop-projects"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="h-full glass rounded-2xl border border-white/5 p-8 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveNav("dashboard")}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-100">Your Projects</h2>
                          <p className="text-slate-500 text-sm">Manage and scale your AI-generated applications</p>
                        </div>
                      </div>
                      <button
                        onClick={handleNewProject}
                        className="shimmer-btn px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-sky-600 text-sm font-semibold text-white"
                      >
                        New Project
                      </button>
                    </div>

                    {projects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[60%] border-2 border-dashed border-white/5 rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-300">No projects yet</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2">
                          Start by describing your first app in the prompt engine.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleProjectClick(p.projectId)}
                            className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer relative group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-slate-100 pr-8">{p.appName}</h3>
                              <div className="absolute top-4 right-4 z-20">
                                <ProjectActionsMenu
                                  projectId={p.projectId}
                                  projectName={p.appName}
                                  version={p.version}
                                  onOpenProject={() => handleProjectClick(p.projectId)}
                                  onDeleteSuccess={() => handleDeleteSuccess(p.projectId)}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{p.description}</p>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                              <span>{p.projectId.slice(0, 8)}...</span>
                              <div className="flex items-center gap-3">
                                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Settings view */}
                {activeNav === "settings" && (
                  <motion.div key="desktop-settings"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <SettingsView {...settingsViewProps} onBack={() => setActiveNav("dashboard")} />
                  </motion.div>
                )}

                {/* Help view */}
                {activeNav === "help" && (
                  <motion.div key="desktop-help"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    <HelpView onBack={() => setActiveNav("dashboard")} />
                  </motion.div>
                )}

                {/* AI Models view */}
                {activeNav === "models" && (
                  <motion.div key="desktop-models"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="h-full glass rounded-2xl border border-white/5 p-8 overflow-y-auto"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <button
                        onClick={() => setActiveNav("dashboard")}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-100">AI Models</h2>
                        <p className="text-slate-500 text-sm">Select the intelligence engine that powers your generations</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[
                        { id: "gemini", name: "Gemini 1.5 Pro", provider: "Google", tier: "free", speed: "High", reasoning: "High", default: true },
                        { id: "gemini-flash", name: "Gemini 2.0 Flash", provider: "Google", tier: "free", speed: "Very High", reasoning: "Medium", default: false },
                        { id: "gpt4o", name: "GPT-4o", provider: "OpenAI", tier: "pro", speed: "High", reasoning: "Very High", default: false },
                        { id: "claude-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", tier: "pro", speed: "High", reasoning: "Very High", default: false },
                        { id: "claude-opus", name: "Claude 3 Opus", provider: "Anthropic", tier: "enterprise", speed: "Medium", reasoning: "Maximum", default: false },
                      ].map((model) => (
                        <div key={model.id} className={`relative glass p-6 rounded-2xl border transition-all ${model.default ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/5 hover:border-white/10"}`}>
                          {model.default && (
                            <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20">
                              <Check size={12} /> Active
                            </div>
                          )}
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                              {model.name}
                              {model.tier === "pro" && <Crown size={14} className="text-amber-400" />}
                              {model.tier === "enterprise" && <Server size={14} className="text-purple-400" />}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{model.provider}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-6">
                            <div className="bg-white/5 rounded-lg p-2">
                              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Speed</div>
                              <div className="text-sm font-semibold text-slate-300">{model.speed}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Reasoning</div>
                              <div className="text-sm font-semibold text-slate-300">{model.reasoning}</div>
                            </div>
                          </div>
                          {model.tier === "free" ? (
                            <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${model.default ? "bg-white/10 text-slate-300 cursor-default" : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"}`}>
                              {model.default ? "Currently Active" : "Select Model"}
                            </button>
                          ) : (
                            <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-not-allowed">
                              <Lock size={14} /> Requires {model.tier === "pro" ? "Pro" : "Enterprise"} Plan
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Versions view */}
                {activeNav === "versions" && (
                  <motion.div key="desktop-versions"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="h-full glass rounded-2xl border border-white/5 p-8 overflow-y-auto"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <button
                        onClick={() => setActiveNav("dashboard")}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <GitBranch size={20} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-100">Project Versions</h2>
                        <p className="text-slate-500 text-sm">Time-travel through your generated code iterations</p>
                      </div>
                    </div>

                    {!generatedApp ? (
                      <div className="flex flex-col items-center justify-center h-[60%] border-2 border-dashed border-white/5 rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-400">
                          <GitBranch size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-300">No active project</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2">
                          Generate an app first. Every modification creates a new version snapshot here.
                        </p>
                      </div>
                    ) : (
                      <div className="relative pl-6 border-l-2 border-white/10 space-y-8 py-4">
                        {[
                          { id: "v3", msg: "Added Stripe subscription billing checkout", time: "Just now", current: true },
                          { id: "v2", msg: "Implemented dark mode toggle & user auth", time: "2 hours ago", current: false },
                          { id: "v1", msg: "Initial app generation from prompt", time: "3 hours ago", current: false }
                        ].map((commit) => (
                          <div key={commit.id} className="relative">
                            <div className={`absolute left-[31px] w-4 h-4 rounded-full border-4 border-slate-900 ${commit.current ? "bg-cyan-400" : "bg-slate-500"}`} />
                            <div className={`glass p-5 rounded-2xl border ${commit.current ? "border-cyan-500/30" : "border-white/5"} transition-all`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs font-bold text-slate-400">#{commit.id}</span>
                                    {commit.current && <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Current Head</span>}
                                  </div>
                                  <p className="text-sm font-semibold text-slate-200">{commit.msg}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0 ml-2">
                                  <Clock size={12} /> {commit.time}
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                                <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${commit.current ? "bg-white/5 text-slate-400 cursor-not-allowed" : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all border border-cyan-500/20"}`}>
                                  {commit.current ? "Currently Viewing" : "Restore Version"}
                                </button>
                                {!commit.current && (
                                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 transition-all border border-white/5">
                                    View Diff
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </section>
          </div>
        </div>
      </main>

    </MotionConfig>
  );
}
