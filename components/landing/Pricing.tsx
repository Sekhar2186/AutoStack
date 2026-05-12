"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Star, Building2, Lock } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    iconColor: "text-slate-400",
    monthlyPrice: 0,
    yearlyDiscount: 0.15,
    description: "Perfect for hobbyists and side projects",
    badge: null,
    cta: "Start Free",
    ctaStyle: "glass border border-white/10 text-slate-200 hover:border-cyan-500/30",
    cardStyle: "border-white/7",
    features: [
      "20 AI generations / month",
      "Gemini 1.5 Flash model",
      "Live preview sandbox",
      "Basic export (ZIP)",
      "Community support",
      "1 active project",
    ],
    locked: ["GPT-4o access", "Claude access", "GitHub sync", "Team collab"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    iconColor: "text-cyan-400",
    monthlyPrice: 29,
    yearlyDiscount: 0.50,
    description: "For professional developers and small teams",
    badge: "Most Popular",
    cta: "Start Pro Trial",
    ctaStyle: "bg-linear-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_24px_rgba(34,211,238,0.4)]",
    cardStyle: "border-cyan-500/25 pro-pulse",
    features: [
      "Unlimited AI generations",
      "Gemini 1.5 Pro + GPT-4o",
      "Claude Sonnet access",
      "GitHub sync & push",
      "Version history (30 days)",
      "Priority support",
      "5 active projects",
      "Custom domain preview",
    ],
    locked: ["Claude Opus", "Team collab", "SSO / SAML"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    iconColor: "text-purple-400",
    monthlyPrice: 99,
    yearlyDiscount: 0.75,
    description: "For teams and enterprise organizations",
    badge: null,
    cta: "Contact Sales",
    ctaStyle: "glass border border-purple-500/30 text-purple-300 hover:border-purple-500/60",
    cardStyle: "border-white/7",
    features: [
      "Everything in Pro",
      "All AI models incl. Claude Opus",
      "Unlimited projects",
      "Team collaboration",
      "Live multiplayer editing",
      "SSO / SAML auth",
      "Custom AI fine-tuning",
      "Dedicated support SLA",
      "On-premise deployment",
    ],
    locked: [],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    const discounted = plan.monthlyPrice * (1 - (yearly ? plan.yearlyDiscount : 0));
    return Math.round(discounted);
  };

  const getSavings = (plan: typeof plans[0]) => Math.round(plan.yearlyDiscount * 100);

  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full bg-cyan-500/4 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-slate-400 mb-5">
            💳 Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50 mb-4">
            Choose your <span className="gradient-text">power level</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${!yearly ? "text-slate-100" : "text-slate-500"}`}>Monthly</span>
          <button
            id="pricing-toggle"
            onClick={() => setYearly((v) => !v)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? "bg-linear-to-r from-cyan-500 to-purple-600" : "bg-white/10"}`}
          >
            <motion.span
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow"
              animate={{ x: yearly ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${yearly ? "text-slate-100" : "text-slate-500"}`}>Yearly</span>
          <AnimatePresence>
            {yearly && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full"
              >
                Save up to 75%
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);
            return (
              <motion.div
                key={plan.id}
                id={`plan-${plan.id}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative glass rounded-2xl border p-7 flex flex-col ${plan.cardStyle} transition-all duration-300`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-bold bg-linear-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon & name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl glass glass-hover border border-white/10 flex items-center justify-center">
                    <Icon size={18} className={plan.iconColor} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">{plan.name}</div>
                    <div className="text-xs text-slate-500">{plan.description}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-extrabold text-slate-50">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-slate-500 text-sm mb-1.5">/mo</span>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {yearly && plan.monthlyPrice > 0 && (
                      <motion.div
                        key="savings"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-emerald-400 font-semibold mt-1"
                      >
                        🎉 {savings}% off · Save ${Math.round(plan.monthlyPrice * plan.yearlyDiscount * 12)}/yr
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA */}
                <Link
                  href={
                    plan.id === "starter"
                      ? (isLoggedIn ? "/dashboard" : "/auth?mode=signup")
                      : `/checkout?plan=${plan.id}&billing=${yearly ? "yearly" : "monthly"}`
                  }
                  id={`plan-cta-${plan.id}`}
                  className={`shimmer-btn w-full py-3 rounded-xl text-sm font-semibold text-center mb-7 hover:scale-[1.02] active:scale-100 transition-transform duration-200 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>

                {/* Included features */}
                <div className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <Lock size={13} className="text-slate-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-500 line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="text-center text-slate-600 text-sm mt-10">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
