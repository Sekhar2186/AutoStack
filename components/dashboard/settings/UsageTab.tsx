"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Globe, Clock } from "lucide-react";

interface UsageTabProps {
  credits: { used: number; total: number };
  creditHistory: any[];
  usageTrend: number[];
  genHistoryCount: number;
  projectCount: number;
}

const formatTime = (ts: string | Date) => {
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
};

export default function UsageTab({ credits, creditHistory, usageTrend, genHistoryCount, projectCount }: UsageTabProps) {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const displayHistory = (creditHistory && creditHistory.length > 0) ? creditHistory : [
    { action: "App Generation (Dashboard)", amount: -1, timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
    { action: "App Generation (Portfolio)", amount: -1, timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { action: "Daily Credits Reset", amount: 20, timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000 - 2 * 3600 * 1000).toISOString() },
    { action: "Welcome Credits", amount: 20, timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  ];

  return (
    <motion.div key="usage" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2"><Zap size={14} className="text-cyan-400" />Credits Used</div>
          <div className="text-3xl font-bold text-slate-100">{credits.used} <span className="text-lg text-slate-500 font-medium">/ {credits.total}</span></div>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-linear-to-r from-cyan-500 to-purple-600 rounded-full" style={{ width: `${(credits.used / credits.total) * 100}%` }} />
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2"><Globe size={14} className="text-purple-400" />Deployments</div>
          <div className="text-3xl font-bold text-slate-100">{projectCount}</div>
          <div className="text-xs text-slate-600 mt-2">Active in this period</div>
        </div>
        <div className="glass p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2"><Clock size={14} className="text-amber-400" />Gen History</div>
          <div className="text-3xl font-bold text-slate-100">{genHistoryCount}</div>
          <div className="text-xs text-slate-600 mt-2">Total apps built</div>
        </div>
      </div>

      {/* Trend Chart */}
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
                <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full cursor-pointer" onMouseEnter={() => setHoveredBarIndex(i)} onMouseLeave={() => setHoveredBarIndex(null)}>
                  <AnimatePresence>
                    {hoveredBarIndex === i && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }} className="absolute z-25 -top-12 flex flex-col items-center bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                        <span className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">{dateStr}</span>
                        <span className="text-[11px] text-cyan-400 font-bold">{val} credits used</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="w-full bg-linear-to-t from-cyan-500/20 to-purple-600/40 rounded-t-lg transition-all group-hover:to-cyan-400 group-hover:from-cyan-500/30" style={{ height: `${val === 0 ? 0 : Math.max(4, (val / maxTrendVal) * 100)}%` }} />
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
                <span className="text-[10px] text-slate-600 uppercase font-bold">{startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-[10px] text-slate-600 uppercase font-bold">{endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </>
            );
          })()}
        </div>
      </div>

      {/* History Table */}
      <div className="pt-4 border-t border-white/5">
        <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Clock size={15} className="text-cyan-400" />Credits Usage History</h4>
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
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/10 text-rose-400 border border-rose-500/25"}`}>
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
  );
}
