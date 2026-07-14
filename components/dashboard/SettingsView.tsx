"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, CreditCard, Palette, LogOut,
  ChevronRight, BarChart3, Zap, ArrowLeft
} from "lucide-react";

import ProfileTab from "@/components/dashboard/settings/ProfileTab";
import UsageTab from "@/components/dashboard/settings/UsageTab";
import AppearanceTab from "@/components/dashboard/settings/AppearanceTab";
import BillingTab from "@/components/dashboard/settings/BillingTab";
import SecurityTab from "@/components/dashboard/settings/SecurityTab";
import AISettingsPage from "@/app/dashboard/settings/ai/page";

interface SettingsViewProps {
  onBack?: () => void;
  credits: { used: number; total: number };
  creditHistory: any[];
  usageTrend: number[];
  genHistoryCount: number;
  projectCount: number;
  userName: string;
  userEmail: string;
  userPlan: string;
  userAvatar?: string;
  onUpdateUser?: (data: { name?: string; email?: string; avatar?: string }) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  animationsEnabled: boolean;
  onToggleAnimations: () => void;
}

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "usage", label: "Usage & Activity", icon: BarChart3 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "ai", label: "AI Providers", icon: Zap },
];

export default function SettingsView({
  credits, creditHistory, usageTrend, genHistoryCount, projectCount,
  userName, userEmail, userPlan, userAvatar = "",
  onUpdateUser, activeTheme, setActiveTheme, animationsEnabled, onToggleAnimations, onBack
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header row ── */}
      <div className="flex items-center gap-4 shrink-0 px-4 pt-4 md:px-0 md:pt-0 mb-4 md:mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Settings</h2>
          <p className="text-slate-500 text-xs md:text-sm">Manage your account, preferences, and billing</p>
        </div>
      </div>

      {/* ── MOBILE: horizontal tab strip ── */}
      <div className="md:hidden shrink-0 px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 border ${isActive
                  ? "bg-white/8 border-cyan-500/30 text-cyan-400"
                  : "border-white/5 text-slate-500 bg-white/3"
                  }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border border-red-500/15 text-red-400 bg-red-500/5 transition-all"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      {/* ── Main body: desktop = 2-col, mobile = single col ── */}
      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* DESKTOP sidebar nav (hidden on mobile) */}
        <div className="hidden md:flex w-64 shrink-0 flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${activeTab === tab.id
                ? "bg-white/5 text-slate-100 border border-white/10"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/4"
                }`}
            >
              <tab.icon size={18} />
              <span className="text-sm font-medium">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-white/5">
            <button
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/5 transition-all w-full text-left cursor-pointer"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout Session</span>
            </button>
          </div>
        </div>

        {/* Settings Content — full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0 md:glass md:rounded-2xl md:border md:border-white/10 px-4 pb-4 md:p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <ProfileTab
                userName={userName}
                userEmail={userEmail}
                userAvatar={userAvatar}
                onUpdateUser={onUpdateUser}
                showToast={showToast}
              />
            )}
            {activeTab === "usage" && (
              <UsageTab
                credits={credits}
                creditHistory={creditHistory}
                usageTrend={usageTrend}
                genHistoryCount={genHistoryCount}
                projectCount={projectCount}
              />
            )}
            {activeTab === "appearance" && (
              <AppearanceTab
                activeTheme={activeTheme}
                setActiveTheme={setActiveTheme}
                animationsEnabled={animationsEnabled}
                onToggleAnimations={onToggleAnimations}
              />
            )}
            {activeTab === "billing" && (
              <BillingTab
                userPlan={userPlan}
                credits={credits}
                creditHistory={creditHistory}
              />
            )}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "ai" && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto pb-10">
                <AISettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 md:px-5 py-3 md:py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-semibold backdrop-blur-md max-w-[calc(100vw-2rem)] ${toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}