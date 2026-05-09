"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Shield, CreditCard, Palette, LogOut, 
  ChevronRight, Camera, BarChart3, Clock, Zap, Globe
} from "lucide-react";

interface SettingsViewProps {
  credits: { used: number; total: number };
}

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "usage", label: "Usage & Activity", icon: BarChart3 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsView({ credits }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
          <p className="text-slate-500 text-sm">Manage your account, preferences, and billing</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Settings Navigation */}
        <div className="w-64 shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                activeTab === tab.id 
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
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/5 transition-all w-full text-left"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout Session</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 glass rounded-2xl border border-white/10 p-8 overflow-y-auto custom-scrollbar">
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
                  
                  <div className="flex items-center gap-8 mb-8">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-cyan-500/20 to-purple-600/20 border-2 border-dashed border-white/10 flex items-center justify-center text-slate-400 group-hover:border-cyan-500/40 transition-all overflow-hidden">
                        <User size={32} />
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">Profile Photo</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">JPG, GIF or PNG. Max size 2MB.</p>
                      <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Upload New Photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue="Sekhar Kurapati" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue="sekhar@autostack.dev" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                  <button className="shimmer-btn px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm">
                    Save Changes
                  </button>
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
                      <div className="h-full bg-linear-to-r from-cyan-500 to-purple-600 rounded-full" style={{ width: `${(credits.used/credits.total)*100}%` }} />
                    </div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/5">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                      <Globe size={14} className="text-purple-400" />
                      Deployments
                    </div>
                    <div className="text-3xl font-bold text-slate-100">0</div>
                    <div className="text-xs text-slate-600 mt-2">Active in this period</div>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/5">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                      <Clock size={14} className="text-amber-400" />
                      Gen History
                    </div>
                    <div className="text-3xl font-bold text-slate-100">12</div>
                    <div className="text-xs text-slate-600 mt-2">Total apps built</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-4">Usage Trends</h4>
                  <div className="h-48 glass rounded-2xl border border-white/5 flex items-end justify-between p-6 gap-2">
                    {[34, 45, 67, 43, 89, 56, 78, 45, 92, 45, 67, 34].map((val, i) => (
                      <div key={i} className="flex-1 bg-linear-to-t from-cyan-500/20 to-purple-600/40 rounded-t-lg transition-all hover:to-cyan-400" style={{ height: `${val}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 px-2">
                    <span className="text-[10px] text-slate-600 uppercase font-bold">May 1</span>
                    <span className="text-[10px] text-slate-600 uppercase font-bold">May 30</span>
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
                      { id: "obsidian", name: "Obsidian Glass", bg: "bg-[#020617]", active: true },
                      { id: "midnight", name: "Deep Midnight", bg: "bg-black", active: false },
                      { id: "vibrant", name: "Vibrant Cyan", bg: "bg-cyan-950", active: false },
                      { id: "corporate", name: "Corporate Blue", bg: "bg-slate-900", active: false },
                    ].map((theme) => (
                      <div 
                        key={theme.id}
                        className={`group relative aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                          theme.active ? "border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className={`w-full h-full ${theme.bg} p-3`}>
                          <div className="w-1/2 h-1.5 rounded bg-white/10 mb-1" />
                          <div className="w-full h-1.5 rounded bg-white/5 mb-1" />
                          <div className="w-2/3 h-1.5 rounded bg-white/5" />
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
                    <div className="w-10 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeTab === "billing" || activeTab === "security") && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-500">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">{activeTab} coming soon</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-2">We're building a secure, enterprise-grade system for your account management.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
