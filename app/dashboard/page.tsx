"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import PromptEngine from "@/components/dashboard/PromptEngine";
import IDEPanel from "@/components/dashboard/IDEPanel";
import GenerationProgress from "@/components/dashboard/GenerationProgress";
import SettingsView from "@/components/dashboard/SettingsView";
import HelpView from "@/components/dashboard/HelpView";

export default function CommandCenter() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showIDE, setShowIDE] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Credit Logic
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [totalCredits, setTotalCredits] = useState(20);
  const [generationCount, setGenerationCount] = useState(0);

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !token.startsWith("mock_")) {
      // Fetch User Info (Credits, Plan)
      fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTotalCredits(data.user.totalCredits);
            // creditsUsed in the UI is actually (total - remaining)
            setCreditsUsed(data.user.totalCredits - data.user.credits);
          }
        })
        .catch(err => console.error("Failed to fetch user info:", err));

      if (activeNav === "projects") {
        fetch("/api/projects", {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.projects.length > 0) {
              setProjects(data.projects);
            } else {
              const guestProjects = JSON.parse(localStorage.getItem("guestProjects") || "[]");
              setProjects(guestProjects);
            }
          })
          .catch(err => {
            console.error("Failed to fetch projects:", err);
            const guestProjects = JSON.parse(localStorage.getItem("guestProjects") || "[]");
            setProjects(guestProjects);
          });
      }
    } else {
      const guestProjects = JSON.parse(localStorage.getItem("guestProjects") || "[]");
      setProjects(guestProjects);
    }
  }, [activeNav]);

  const handleGenerate = async (data: { prompt: string; template: string; selectedModel: string }) => {
    setIsGenerating(true);
    setShowIDE(false);
    setError(null);

    try {
      const payload: any = { ...data };

      // If we already have a project, pass its ID to the backend for versioning (v2, v3, etc.)
      if (generatedApp?.projectId) {
        payload.projectId = generatedApp.projectId;
      }

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

        // Add to recent projects
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

        // handleGenerationComplete will be called by IDEPanel after its internal progress is done
        
        // Update local credit balance immediately
        setCreditsUsed(prev => Math.min(prev + 1, totalCredits));
      } else {
        throw new Error(result.error || "Failed to generate project");
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "An unexpected error occurred");
      setIsGenerating(false);
    }

    /* Update credits handled inside try block */
  };

  const handleProjectClick = async (projectId: string) => {
    setIsGenerating(true);
    setShowIDE(true);
    setActiveNav("dashboard");
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
  };

  const handleNewProject = () => {
    setGeneratedApp(null);
    setShowIDE(false);
    setGenerationCount(0);
    setActiveNav("dashboard");
  };

  return (
    <main className="flex h-screen w-full bg-[#020617] text-slate-50 overflow-hidden font-sans">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/5 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        credits={{ used: creditsUsed, total: totalCredits }}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] h-full overflow-hidden">

          {/* Left: Prompt Engine */}
          <section className="h-full border-r border-white/5 relative z-10">
            <PromptEngine onGenerate={handleGenerate} isGenerating={isGenerating} />
          </section>

          {/* Right: IDE / Dashboard View */}
          <section className="h-full p-4 relative z-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeNav === "dashboard" && (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  {/* Empty welcome state - shown when IDE is hidden */}
                  {!showIDE && !isGenerating && (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full glass rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-8"
                    >
                      <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-cyan-500/10 to-sky-600/10 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut"
                          }}
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
                          generatedApp ? { title: "Resume Current Project", desc: "Return to your active IDE session", action: () => setShowIDE(true) } : { title: "Recent Projects", desc: "Access your last 5 builds", action: () => setActiveNav("projects") },
                          { title: "New Templates", desc: "Start from high-quality presets", action: () => setActiveNav("dashboard") },
                          {
                            title: "Community", desc: "Explore what others are building", action: () => window.location.href = "/"
                          },
                          { title: "Settings", desc: "Manage your API keys & models", action: () => setActiveNav("settings") }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={item.action}
                            className={`glass glass-hover p-4 rounded-xl border border-white/5 text-left transition-all cursor-pointer ${item.title === 'Resume Current Project' ? 'bg-cyan-500/10 border-cyan-500/30' : ''}`}
                          >
                            <h4 className={`text-sm font-semibold mb-1 ${item.title === 'Resume Current Project' ? 'text-cyan-400' : 'text-slate-300'}`}>{item.title}</h4>
                            <p className="text-[11px] text-slate-600">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}


                  {/* IDEPanel — always mounted when app exists so tab/preview state is never lost */}
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

              {activeNav === "projects" && (
                <motion.div
                  key="projects-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full glass rounded-2xl border border-white/5 p-8 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">Your Projects</h2>
                      <p className="text-slate-500 text-sm">Manage and scale your AI-generated applications</p>
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
                          className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <h3 className="text-xl font-bold text-slate-100">{p.appName}</h3>
                          <p className="text-sm text-slate-400 mt-2 mb-4 line-clamp-2">{p.description}</p>
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>{p.projectId}</span>
                            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeNav === "settings" && (
                <motion.div
                  key="settings-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <SettingsView credits={{ used: creditsUsed, total: totalCredits }} />
                </motion.div>
              )}

              {activeNav === "help" && (
                <motion.div
                  key="help-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <HelpView />
                </motion.div>
              )}

              {(activeNav === "models" || activeNav === "versions") && (
                <motion.div
                  key="placeholder-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full glass rounded-2xl border border-white/5 flex items-center justify-center p-8"
                >
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-100 mb-2 capitalize">{activeNav} View</h2>
                    <p className="text-slate-500 text-sm">This interface is currently under development.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Overlays */}
      </div>
    </main>
  );
}
