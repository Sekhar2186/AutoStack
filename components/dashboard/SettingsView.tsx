"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, CreditCard, Palette, LogOut,
  ChevronDown, BarChart3, Zap, ArrowLeft, Key,
  AlertTriangle, Trash2
} from "lucide-react";

import ProfileTab from "@/components/dashboard/settings/ProfileTab";
import UsageTab from "@/components/dashboard/settings/UsageTab";
import AppearanceTab from "@/components/dashboard/settings/AppearanceTab";
import BillingTab from "@/components/dashboard/settings/BillingTab";
import SecurityTab from "@/components/dashboard/settings/SecurityTab";
import AISettingsPage from "@/app/dashboard/settings/ai/page";
import MyApiKeys from "@/components/dashboard/settings/MyApiKey";

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
  { id: "mykeys", label: "My API Keys", icon: Key },
];

export default function SettingsView({
  credits, creditHistory, usageTrend, genHistoryCount, projectCount,
  userName, userEmail, userPlan, userAvatar = "",
  onUpdateUser, activeTheme, setActiveTheme, animationsEnabled, onToggleAnimations, onBack
}: SettingsViewProps) {
  const [openTab, setOpenTab] = useState<string | null>("profile");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const toggle = (id: string) => setOpenTab((prev) => (prev === id ? null : id));

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("token");
        window.location.href = "/";
      } else {
        showToast("error", data.message || "Failed to delete account");
        setIsDeleting(false);
      }
    } catch (error) {
      showToast("error", "Network error occurred");
      setIsDeleting(false);
    }
  };

  const renderContent = (id: string) => {
    switch (id) {
      case "profile":
        return (
          <ProfileTab
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            onUpdateUser={onUpdateUser}
            showToast={showToast}
          />
        );
      case "usage":
        return (
          <UsageTab
            credits={credits}
            creditHistory={creditHistory}
            usageTrend={usageTrend}
            genHistoryCount={genHistoryCount}
            projectCount={projectCount}
          />
        );
      case "appearance":
        return (
          <AppearanceTab
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            animationsEnabled={animationsEnabled}
            onToggleAnimations={onToggleAnimations}
          />
        );
      case "billing":
        return (
          <BillingTab
            userPlan={userPlan}
            credits={credits}
            creditHistory={creditHistory}
          />
        );
      case "security":
        return <SecurityTab />;
      case "ai":
        return (
          <div className="pb-6">
            <AISettingsPage />
          </div>
        );
      case "mykeys":
        return (
          <div className="pb-6">
            <MyApiKeys />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
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

      {/* ── Accordion list ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-2 pb-6">
          {tabs.map((tab) => {
            const isOpen = openTab === tab.id;
            return (
              <div
                key={tab.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                    ? "border-white/15 bg-white/3 shadow-lg"
                    : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/3"
                  }`}
              >
                {/* Section header / trigger */}
                <button
                  onClick={() => toggle(tab.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isOpen ? "bg-cyan-500/15 text-cyan-400" : "bg-white/5 text-slate-500"
                    }`}>
                    <tab.icon size={17} />
                  </div>
                  <span className={`text-sm font-semibold transition-colors duration-200 ${isOpen ? "text-slate-100" : "text-slate-400"}`}>
                    {tab.label}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="ml-auto"
                  >
                    <ChevronDown size={16} className={`transition-colors duration-200 ${isOpen ? "text-cyan-400" : "text-slate-600"}`} />
                  </motion.div>
                </button>

                {/* Collapsible content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={tab.id + "-content"}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pt-1 border-t border-white/5">
                        {renderContent(tab.id)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Logout row */}
          <div className="rounded-2xl border border-red-500/10 bg-red-500/3 overflow-hidden">
            <button
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer hover:bg-red-500/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
                <LogOut size={17} />
              </div>
              <span className="text-sm font-semibold text-red-400">Logout Session</span>
            </button>
          </div>

          {/* Delete Account row */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 overflow-hidden mt-4">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer hover:bg-red-500/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-600/20 text-red-500">
                <Trash2 size={17} />
              </div>
              <span className="text-sm font-semibold text-red-500">Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-red-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-rose-600" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Delete Account</h3>
                  <p className="text-sm text-slate-400 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-6 text-sm text-slate-300">
                You are about to permanently delete your account and all associated projects.
                <br /><br />
                To confirm, type <strong className="text-red-400 select-all">DELETE MY ACCOUNT</strong> below.
              </div>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || isDeleting}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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