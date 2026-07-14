"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Shield, CreditCard, Palette, LogOut,
  ChevronRight, Camera, BarChart3, Clock, Zap, Globe, Loader2,
  Crown, Check, ArrowUpRight, Receipt, Star, ArrowLeft
} from "lucide-react";
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
  credits,
  creditHistory,
  usageTrend,
  genHistoryCount,
  projectCount,
  userName,
  userEmail,
  userPlan,
  userAvatar = "",
  onUpdateUser,
  activeTheme,
  setActiveTheme,
  animationsEnabled,
  onToggleAnimations,
  onBack
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(userName);
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [avatarPreview, setAvatarPreview] = useState(userAvatar);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & Toast State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with props
  useEffect(() => {
    setProfileName(userName);
    setProfileEmail(userEmail);
  }, [userName, userEmail]);

  useEffect(() => {
    setAvatarPreview(userAvatar);
  }, [userAvatar]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      showToast("error", "Name and email are required");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
          avatar: avatarPreview
        })
      });

      const data = await response.json();
      if (data.success) {
        showToast("success", "Profile updated successfully!");
        if (onUpdateUser) {
          onUpdateUser({
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar
          });
        }
      } else {
        showToast("error", data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An error occurred while updating profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showToast("error", "New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (data.success) {
        showToast("success", "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast("error", data.message || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatTime = (ts: string | Date) => {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const displayHistory = (creditHistory && creditHistory.length > 0) ? creditHistory : [
    { action: "App Generation (Dashboard)", amount: -1, timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
    { action: "App Generation (Portfolio)", amount: -1, timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { action: "Daily Credits Reset", amount: 20, timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000 - 2 * 3600 * 1000).toISOString() },
    { action: "Welcome Credits", amount: 20, timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  ];

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
          {/* Logout inline on mobile */}
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
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-6">Profile Information</h3>

                  <div className="flex items-center gap-4 md:gap-8 mb-6 md:mb-8">
                    <div onClick={handleUploadClick} className="relative group cursor-pointer shrink-0">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-linear-to-br from-cyan-500/20 to-purple-600/20 border-2 border-dashed border-white/10 flex items-center justify-center text-slate-400 group-hover:border-cyan-500/40 transition-all overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-3xl">
                        <Camera size={16} className="text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm md:text-base">Profile Photo</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-2 md:mb-3">JPG, GIF or PNG. Max 2MB.</p>
                      <button onClick={handleUploadClick} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">Upload New Photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="shimmer-btn px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm cursor-pointer disabled:opacity-55 flex items-center gap-2"
                  >
                    {isSavingProfile && <Loader2 size={14} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>

                {/* Reset Password Section */}
                <div className="pt-8 border-t border-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2">Password & Security</h3>
                    <p className="text-xs text-slate-500">Update your password directly, or request a reset link if you've forgotten it.</p>
                  </div>

                  {/* Inline Password Change Form */}
                  <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-white/10 text-slate-200 font-bold text-sm cursor-pointer hover:border-cyan-500/30 transition-all disabled:opacity-55 flex items-center justify-center gap-2"
                      >
                        {isChangingPassword && <Loader2 size={14} className="animate-spin" />}
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* External Reset Redirect */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-4 md:p-6 rounded-2xl border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Forgot Current Password?</h4>
                      <p className="text-xs text-slate-500 mt-1">Proceed to the secure password reset page to recover and change your credentials via email.</p>
                    </div>
                    <a
                      href="/auth/forgot-password"
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold text-sm hover:bg-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      Send Reset Link
                    </a>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === "usage" && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass p-5 rounded-2xl border border-white/5">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                      <Zap size={14} className="text-cyan-400" />
                      Credits Used
                    </div>
                    <div className="text-3xl font-bold text-slate-100">{credits.used} <span className="text-lg text-slate-500 font-medium">/ {credits.total}</span></div>
                    <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-linear-to-r from-cyan-500 to-purple-600 rounded-full" style={{ width: `${(credits.used / credits.total) * 100}%` }} />
                    </div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/5">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                      <Globe size={14} className="text-purple-400" />
                      Deployments
                    </div>
                    <div className="text-3xl font-bold text-slate-100">{projectCount}</div>
                    <div className="text-xs text-slate-600 mt-2">Active in this period</div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/5">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                      <Clock size={14} className="text-amber-400" />
                      Gen History
                    </div>
                    <div className="text-3xl font-bold text-slate-100">{genHistoryCount}</div>
                    <div className="text-xs text-slate-600 mt-2">Total apps built</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-4">Usage Trends</h4>
                  <div className="h-48 glass rounded-2xl border border-white/5 flex items-end justify-between p-6 gap-2 relative">
                    {(() => {
                      const trendData = (usageTrend && usageTrend.length > 0) ? usageTrend : [0, 0, 0, 0, 0, 0, 0];
                      const maxTrendVal = Math.max(...trendData, 10);

                      return trendData.map((val, i, arr) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (arr.length - 1 - i));
                        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                        return (
                          <div
                            key={i}
                            className="flex-1 group relative flex flex-col items-center justify-end h-full cursor-pointer"
                            onMouseEnter={() => setHoveredBarIndex(i)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          >
                            <AnimatePresence>
                              {hoveredBarIndex === i && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                  className="absolute z-25 -top-12 flex flex-col items-center bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
                                >
                                  <span className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">{dateStr}</span>
                                  <span className="text-[11px] text-cyan-400 font-bold">{val} credits used</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <div
                              className="w-full bg-linear-to-t from-cyan-500/20 to-purple-600/40 rounded-t-lg transition-all group-hover:to-cyan-400 group-hover:from-cyan-500/30"
                              style={{ height: `${val === 0 ? 0 : Math.max(4, (val / maxTrendVal) * 100)}%` }}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex justify-between mt-2 px-2">
                    {(() => {
                      const arrLength = (usageTrend && usageTrend.length > 0) ? usageTrend.length : 7;
                      const startDate = new Date();
                      startDate.setDate(startDate.getDate() - (arrLength - 1));
                      const endDate = new Date();
                      return (
                        <>
                          <span className="text-[10px] text-slate-600 uppercase font-bold">
                            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span className="text-[10px] text-slate-600 uppercase font-bold">
                            {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Clock size={15} className="text-cyan-400" />
                    Credits Usage History
                  </h4>
                  <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/2 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                            <th className="px-6 py-3.5">Action</th>
                            <th className="px-6 py-3.5">Amount</th>
                            <th className="px-6 py-3.5">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/4">
                          {displayHistory.map((log, idx) => {
                            const isPositive = log.amount > 0;
                            return (
                              <tr key={idx} className="hover:bg-white/2 transition-colors">
                                <td className="px-6 py-3.5 font-medium text-slate-200">{log.action}</td>
                                <td className="px-6 py-3.5">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isPositive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                                    }`}>
                                    {isPositive ? `+${log.amount}` : log.amount}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-slate-500">{formatTime(log.timestamp)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-6">Theme & Personalization</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: "obsidian", name: "Obsidian Glass", bg: "bg-[#020617]" },
                      { id: "midnight", name: "Deep Midnight", bg: "bg-black" },
                      { id: "vibrant", name: "Vibrant Cyan", bg: "bg-[#082f49]" },
                      { id: "corporate", name: "Corporate Blue", bg: "bg-slate-900" },
                      { id: "light", name: "Light Theme", bg: "bg-slate-100 border-slate-300" },
                    ].map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => {
                          setActiveTheme(theme.id);
                          localStorage.setItem("theme", theme.id);
                        }}
                        className={`group relative aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${activeTheme === theme.id ? "border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-white/5 hover:border-white/20"
                          }`}
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

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-200">Developer Options</h4>
                  <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Animations</div>
                      <div className="text-xs text-slate-500">Enable smooth UI transitions and micro-interactions</div>
                    </div>
                    <button
                      onClick={onToggleAnimations}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer outline-none border ${animationsEnabled
                        ? "bg-cyan-500/20 border-cyan-500/30"
                        : "bg-slate-700/20 border-slate-700/30"
                        }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`absolute w-3 h-3 rounded-full ${animationsEnabled ? "right-1 bg-cyan-400" : "left-1 bg-slate-400"
                          } top-1`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "billing" && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                {/* Current Plan Card */}
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-6">Current Plan</h3>
                  <div className={`relative rounded-2xl p-6 border overflow-hidden ${userPlan === "enterprise"
                    ? "bg-linear-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20"
                    : userPlan === "pro"
                      ? "bg-linear-to-br from-cyan-500/10 to-purple-600/10 border-cyan-500/20"
                      : "bg-white/3 border-white/10"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown size={18} className={userPlan === "free" ? "text-slate-500" : userPlan === "pro" ? "text-cyan-400" : "text-amber-400"} />
                          <span className={`text-sm font-bold uppercase tracking-widest ${userPlan === "enterprise" ? "text-amber-400" : userPlan === "pro" ? "text-cyan-400" : "text-slate-400"
                            }`}>{userPlan} Plan</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-100 mb-1">
                          {userPlan === "free" ? "$0" : userPlan === "pro" ? "$29" : "$99"}
                          <span className="text-sm text-slate-500 font-normal">/month</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {userPlan === "free"
                            ? "20 credits/day · Community support · 1 project"
                            : userPlan === "pro"
                              ? "500 credits/day · Priority support · Unlimited projects"
                              : "1000 credits/day · Dedicated support · Enterprise features"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${userPlan === "free"
                          ? "border-white/10 text-slate-500 bg-white/3"
                          : "border-emerald-500/25 text-emerald-400 bg-emerald-500/10"
                          }`}>
                          {userPlan === "free" ? "Starter" : "Active"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Credits / Day</div>
                        <div className="text-lg font-bold text-slate-100">{credits.total}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Used Today</div>
                        <div className="text-lg font-bold text-slate-100">{credits.used}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Remaining</div>
                        <div className="text-lg font-bold text-cyan-400">{credits.total - credits.used}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Plans — upgrade / downgrade */}
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
                    <Star size={18} className="text-amber-400" />
                    All Plans
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    {userPlan === "free"
                      ? "Upgrade anytime to unlock more credits and features."
                      : "Switch plans anytime. Changes take effect at the next billing cycle."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: "free",
                        name: "Free",
                        price: "$0",
                        period: "/mo",
                        features: ["20 credits/day", "Community support", "1 project", "Basic AI models", "Hosted preview"],
                        accent: "border-white/10",
                        bg: "bg-white/3",
                        badgeBg: "bg-white/8 border-white/10 text-slate-400",
                        btnUpgrade: null,
                        btnDowngrade: "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10",
                        checkColor: "text-slate-400",
                      },
                      {
                        id: "pro",
                        name: "Pro",
                        price: "$29",
                        period: "/mo",
                        features: ["500 credits/day", "Priority support", "Unlimited projects", "All AI models", "Export to GitHub"],
                        accent: "border-cyan-500/25",
                        bg: "bg-linear-to-br from-cyan-500/10 to-sky-600/5",
                        badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                        btnUpgrade: "bg-linear-to-r from-cyan-500 to-sky-600",
                        btnDowngrade: "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10",
                        checkColor: "text-cyan-400",
                        badge: "Most Popular",
                      },
                      {
                        id: "enterprise",
                        name: "Enterprise",
                        price: "$99",
                        period: "/mo",
                        features: ["1000 credits/day", "Dedicated support", "Custom integrations", "SSO & team seats", "SLA guarantee"],
                        accent: "border-amber-500/25",
                        bg: "bg-linear-to-br from-amber-500/10 to-orange-600/5",
                        badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                        btnUpgrade: "bg-linear-to-r from-amber-500 to-orange-500",
                        btnDowngrade: "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10",
                        checkColor: "text-amber-400",
                        badge: "Best Value",
                      },
                    ].map((plan) => {
                      const isCurrent = userPlan === plan.id;
                      const planOrder = { free: 0, pro: 1, enterprise: 2 };
                      const currentOrder = planOrder[userPlan as keyof typeof planOrder] ?? 0;
                      const planOrd = planOrder[plan.id as keyof typeof planOrder] ?? 0;
                      const isUpgrade = planOrd > currentOrder;
                      const isDowngrade = planOrd < currentOrder;

                      return (
                        <div
                          key={plan.id}
                          className={`relative glass rounded-2xl p-6 border ${plan.accent} ${plan.bg} flex flex-col transition-all duration-200 ${isCurrent ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/10" : "hover:border-white/20"}`}
                        >
                          {/* Badge */}
                          {isCurrent ? (
                            <div className="absolute top-4 right-4">
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1">
                                <Check size={9} /> Current Plan
                              </span>
                            </div>
                          ) : plan.badge ? (
                            <div className="absolute top-4 right-4">
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${plan.badgeBg}`}>
                                {plan.badge}
                              </span>
                            </div>
                          ) : null}

                          {/* Plan name & price */}
                          <div className="mb-4 pr-20">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{plan.name}</p>
                            <p className="text-3xl font-bold text-slate-100">
                              {plan.price}<span className="text-sm font-normal text-slate-500">{plan.period}</span>
                            </p>
                          </div>

                          {/* Features */}
                          <ul className="space-y-2 mb-6 flex-1">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <Check size={12} className={`${plan.checkColor} shrink-0`} />
                                {f}
                              </li>
                            ))}
                          </ul>

                          {/* CTA button */}
                          {isCurrent ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm font-bold cursor-default flex items-center justify-center gap-2"
                            >
                              <Check size={14} /> Current Plan
                            </button>
                          ) : isUpgrade ? (
                            <a
                              href={`/#pricing`}
                              className={`shimmer-btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl ${plan.btnUpgrade} text-white text-sm font-bold transition-all hover:opacity-90`}
                            >
                              Upgrade to {plan.name} <ArrowUpRight size={14} />
                            </a>
                          ) : isDowngrade ? (
                            <a
                              href={`/#pricing`}
                              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl ${plan.btnDowngrade} text-sm font-bold transition-all`}
                            >
                              Downgrade to {plan.name}
                            </a>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Purchases */}
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Receipt size={18} className="text-purple-400" />
                    Recent Purchases
                  </h3>
                  <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                    {(() => {
                      const purchases = (creditHistory || []).filter((e: any) =>
                        e.action?.toLowerCase().includes("upgrade") ||
                        e.action?.toLowerCase().includes("pro") ||
                        e.action?.toLowerCase().includes("enterprise") ||
                        e.action?.toLowerCase().includes("purchase")
                      );

                      if (purchases.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-600">
                              <Receipt size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-400 mb-1">No purchases yet</p>
                            <p className="text-xs text-slate-600 max-w-xs">Upgrade to Pro or Enterprise to see your billing history here.</p>
                          </div>
                        );
                      }

                      return (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/2 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                              <th className="px-6 py-3.5">Plan</th>
                              <th className="px-6 py-3.5">Credits Granted</th>
                              <th className="px-6 py-3.5">Date</th>
                              <th className="px-6 py-3.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/4">
                            {purchases.slice(0, 10).map((entry: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/2 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-200">{entry.action}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                    +{entry.amount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{formatTime(entry.timestamp)}</td>
                                <td className="px-6 py-4">
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                    <Check size={10} /> Completed
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-500">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">Security Settings</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-2">Advanced security features like 2FA, API keys, and session management are coming soon.</p>
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full overflow-y-auto pb-10"
              >
                <AISettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification — shifted up on mobile to clear bottom nav */}
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