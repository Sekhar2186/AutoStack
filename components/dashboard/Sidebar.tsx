"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, FolderOpen, Cpu, GitBranch, Settings,
  HelpCircle, ChevronLeft, ChevronRight, Lock, Crown, Check,
  Users, Globe, Activity, Home, LogOut,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { id: "home", icon: Home, label: "Return to Home", href: "/" },
  { id: "projects", icon: FolderOpen, label: "Projects" },
  { id: "models", icon: Cpu, label: "AI Models" },
  { id: "versions", icon: GitBranch, label: "Versions" },
  { id: "team", icon: Users, label: "Team", comingSoon: true },
  { id: "deploy", icon: Globe, label: "Deployments", comingSoon: true },
];

const modelOptions = [
  { id: "gemini", name: "Gemini 1.5 Pro", provider: "Google", tier: "free", available: true },
  { id: "gemini-flash", name: "Gemini 2.0 Flash", provider: "Google", tier: "free", available: true },
  { id: "gpt4o", name: "GPT-4o", provider: "OpenAI", tier: "pro", available: false },
  { id: "gpt4o-mini", name: "GPT-4o Mini", provider: "OpenAI", tier: "pro", available: false },
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic", tier: "pro", available: false },
  { id: "claude-opus", name: "Claude Opus", provider: "Anthropic", tier: "enterprise", available: false },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeNav: string;
  onNavChange: (id: string) => void;
  credits: { used: number; total: number };
}

export default function Sidebar({ collapsed, onToggle, activeNav, onNavChange, credits }: SidebarProps) {
  const [modelOpen, setModelOpen] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="relative shrink-0 h-full glass border-r border-white/[0.07] flex flex-col overflow-hidden z-10"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/6 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(34,211,238,0.3)]">
          <Zap size={15} className="text-white fill-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-[15px] gradient-text whitespace-nowrap"
            >
              AutoStack
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 pt-4 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-slate-500 hover:text-slate-300 hover:bg-white/4 cursor-pointer"
              >
                <Icon size={17} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 min-w-0 flex-1"
                    >
                      <span className="text-[13px] font-medium whitespace-nowrap truncate">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => !item.comingSoon && onNavChange(item.id)}
              className={`relative group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${isActive
                  ? "bg-linear-to-r from-cyan-500/15 to-purple-600/10 text-slate-100 border border-cyan-500/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/4"
                } ${item.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon size={17} className={`shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 min-w-0 flex-1"
                  >
                    <span className="text-[13px] font-medium whitespace-nowrap truncate">{item.label}</span>
                    {item.comingSoon && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-600 whitespace-nowrap">
                        Soon
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {isActive && (
                <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Credits section */}
      <div className="px-2 pb-2 flex flex-col gap-2 border-t border-white/5 pt-3">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-3 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 font-semibold">Daily Credits</span>
              <span className="text-[11px] font-bold text-cyan-400">{credits.used} / {credits.total}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-cyan-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${(credits.used / credits.total) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">{credits.total - credits.used} credits remaining today</p>
          </motion.div>
        )}

        {/* Model selector */}
        {!collapsed && (
          <div className="relative">
            <button
              id="model-selector-btn"
              onClick={() => setModelOpen((v) => !v)}
              className="w-full glass rounded-xl px-3 py-2.5 border border-white/5 hover:border-cyan-500/20 transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-cyan-400" />
                <span className="text-[12px] text-slate-300 font-medium">Gemini 1.5 Pro</span>
              </div>
              <ChevronRight
                size={13}
                className={`text-slate-500 transition-transform ${modelOpen ? "rotate-90" : ""}`}
              />
            </button>
            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute bottom-full mb-2 left-0 right-0 glass bg-[#0a0f1e]/95 rounded-xl border border-white/8 p-1.5 shadow-2xl z-50"
                >
                  {modelOptions.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${m.available ? "hover:bg-white/5 cursor-pointer" : "cursor-not-allowed opacity-50"
                        }`}
                    >
                      <div>
                        <div className="text-[12px] text-slate-300 font-medium flex items-center gap-1.5">
                          {m.name}
                          {m.available && <Check size={11} className="text-cyan-400" />}
                        </div>
                        <div className="text-[10px] text-slate-600">{m.provider}</div>
                      </div>
                      {!m.available && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          <Lock size={9} />
                          {m.tier === "enterprise" ? "Ent" : "Pro"}
                        </span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Upgrade prompt */}
        {!collapsed && (
          <Link
            href="/#pricing"
            id="sidebar-upgrade-btn"
            className="shimmer-btn flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-amber-500/20 to-purple-600/20 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
          >
            <Crown size={13} className="text-amber-400" />
            <span className="text-[12px] font-semibold text-amber-400">Upgrade to Pro</span>
          </Link>
        )}

        {/* Bottom nav icons */}
        <div className="flex flex-col gap-1 pt-1">
          {[
            { id: "settings", icon: Settings, label: "Settings" },
            { id: "help", icon: HelpCircle, label: "Help" },
          ].map(({ id, icon: Icon, label }) => {
            const isActive = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => onNavChange(id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  isActive ? "bg-white/5 text-slate-100" : "text-slate-600 hover:text-slate-300 hover:bg-white/4"
                }`}
              >
                <Icon size={17} className={`shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
                {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-white/6 space-y-2">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
        </button>

        <button
          id="sidebar-collapse-btn"
          onClick={onToggle}
          className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full glass border border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-cyan-500/30 transition-all shadow-lg z-20"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>
    </motion.aside>
  );
}
