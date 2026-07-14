"use client";

import { Check, Crown, Star, ArrowUpRight, Receipt } from "lucide-react";

interface BillingTabProps {
  userPlan: string;
  credits: { used: number; total: number };
  creditHistory: any[];
}

const formatTime = (ts: string | Date) => {
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
};

const plans = [
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
];

const planOrder: Record<string, number> = { free: 0, pro: 1, enterprise: 2 };

export default function BillingTab({ userPlan, credits, creditHistory }: BillingTabProps) {
  const currentOrder = planOrder[userPlan] ?? 0;

  const purchases = (creditHistory || []).filter((e: any) =>
    e.action?.toLowerCase().includes("upgrade") ||
    e.action?.toLowerCase().includes("pro") ||
    e.action?.toLowerCase().includes("enterprise") ||
    e.action?.toLowerCase().includes("purchase")
  );

  return (
    <div className="space-y-8">

      {/* Current Plan Card */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-6">Current Plan</h3>
        <div className={`relative rounded-2xl p-6 border overflow-hidden ${userPlan === "enterprise" ? "bg-linear-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20"
          : userPlan === "pro" ? "bg-linear-to-br from-cyan-500/10 to-purple-600/10 border-cyan-500/20"
            : "bg-white/3 border-white/10"
          }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} className={userPlan === "free" ? "text-slate-500" : userPlan === "pro" ? "text-cyan-400" : "text-amber-400"} />
                <span className={`text-sm font-bold uppercase tracking-widest ${userPlan === "enterprise" ? "text-amber-400" : userPlan === "pro" ? "text-cyan-400" : "text-slate-400"}`}>
                  {userPlan} Plan
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-100 mb-1">
                {userPlan === "free" ? "$0" : userPlan === "pro" ? "$29" : "$99"}
                <span className="text-sm text-slate-500 font-normal">/month</span>
              </div>
              <p className="text-xs text-slate-500">
                {userPlan === "free" ? "20 credits/day · Community support · 1 project"
                  : userPlan === "pro" ? "500 credits/day · Priority support · Unlimited projects"
                    : "1000 credits/day · Dedicated support · Enterprise features"}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${userPlan === "free" ? "border-white/10 text-slate-500 bg-white/3" : "border-emerald-500/25 text-emerald-400 bg-emerald-500/10"
              }`}>
              {userPlan === "free" ? "Starter" : "Active"}
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
            <div><div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Credits / Day</div><div className="text-lg font-bold text-slate-100">{credits.total}</div></div>
            <div><div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Used Today</div><div className="text-lg font-bold text-slate-100">{credits.used}</div></div>
            <div><div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Remaining</div><div className="text-lg font-bold text-cyan-400">{credits.total - credits.used}</div></div>
          </div>
        </div>
      </div>

      {/* All Plans */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />All Plans
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          {userPlan === "free" ? "Upgrade anytime to unlock more credits and features." : "Switch plans anytime. Changes take effect at the next billing cycle."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = userPlan === plan.id;
            const planOrd = planOrder[plan.id] ?? 0;
            const isUpgrade = planOrd > currentOrder;
            const isDowngrade = planOrd < currentOrder;
            return (
              <div key={plan.id} className={`relative glass rounded-2xl p-6 border ${plan.accent} ${plan.bg} flex flex-col transition-all duration-200 ${isCurrent ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/10" : "hover:border-white/20"}`}>
                {isCurrent ? (
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1"><Check size={9} /> Current Plan</span>
                  </div>
                ) : plan.badge ? (
                  <div className="absolute top-4 right-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${plan.badgeBg}`}>{plan.badge}</span>
                  </div>
                ) : null}
                <div className="mb-4 pr-20">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{plan.name}</p>
                  <p className="text-3xl font-bold text-slate-100">{plan.price}<span className="text-sm font-normal text-slate-500">{plan.period}</span></p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-400"><Check size={12} className={`${plan.checkColor} shrink-0`} />{f}</li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button disabled className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm font-bold cursor-default flex items-center justify-center gap-2"><Check size={14} /> Current Plan</button>
                ) : isUpgrade ? (
                  <a href="/#pricing" className={`shimmer-btn flex items-center justify-center gap-0.5 w-full py-2.5 rounded-xl ${plan.btnUpgrade} text-white text-sm font-bold transition-all hover:opacity-90`}>Upgrade to {plan.name} <ArrowUpRight size={12} /></a>
                ) : isDowngrade ? (
                  <a href="/#pricing" className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl ${plan.btnDowngrade} text-sm font-bold transition-all`}>Downgrade to {plan.name}</a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Purchases */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Receipt size={18} className="text-purple-400" />Recent Purchases</h3>
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-600"><Receipt size={24} /></div>
              <p className="text-sm font-semibold text-slate-400 mb-1">No purchases yet</p>
              <p className="text-xs text-slate-600 max-w-xs">Upgrade to Pro or Enterprise to see your billing history here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                  <th className="px-6 py-3.5">Plan</th><th className="px-6 py-3.5">Credits Granted</th><th className="px-6 py-3.5">Date</th><th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {purchases.slice(0, 10).map((entry: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{entry.action}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">+{entry.amount}</span></td>
                    <td className="px-6 py-4 text-slate-500">{formatTime(entry.timestamp)}</td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400"><Check size={10} /> Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
