"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Play, ArrowRight, Sparkles, Globe, Code2, Cpu } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "10x", label: "Faster Development" },
  { value: "50k+", label: "Apps Generated" },
  { value: "99.9%", label: "Uptime SLA" },
];

const techBadges = ["Next.js", "React", "TypeScript", "Tailwind", "PostgreSQL", "Prisma"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Radial glow center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full bg-gradient-radial from-cyan-500/10 via-purple-600/5 to-transparent blur-3xl" />
      </div>

      {/* Floating orbs */}
      <div className="orb absolute top-24 left-[12%] w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
      <div className="orb-delay absolute bottom-32 right-[10%] w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="orb absolute top-1/2 right-[20%] w-48 h-48 rounded-full bg-cyan-400/5 blur-[60px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-semibold text-cyan-400 mb-8 border border-cyan-500/20">
          <Sparkles size={13} className="text-cyan-400" />
          Powered by Gemini, GPT-4o &amp; Claude
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6">
          <span className="text-slate-50">AutoStack:</span>
          <br />
          <span className="gradient-text">The Future of</span>
          <br />
          <span className="text-slate-50">Web Dev</span>
        </motion.h1>

        {/* Sub */}
        <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Describe your app in plain English. AutoStack&apos;s AI engine generates the complete
          full-stack codebase, live preview, and deployment pipeline — in under 60 seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href={isLoggedIn ? "/dashboard" : "/auth?mode=signup"}
            id="hero-cta-primary"
            className="shimmer-btn flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-semibold text-base hover:scale-105 active:scale-100 transition-transform duration-200 shadow-[0_0_24px_rgba(34,211,238,0.4)]"
          >
            <Zap size={16} className="fill-white text-white" />
            Start Building for Free
          </Link>
          <button
            id="hero-cta-demo"
            className="shimmer-btn flex items-center gap-2 px-7 py-3.5 rounded-2xl glass border border-white/10 text-slate-200 font-semibold text-base hover:scale-105 hover:border-cyan-500/30 active:scale-100 transition-all duration-200"
          >
            <Play size={15} className="fill-slate-200 text-slate-200" />
            Watch Demo
          </button>
        </motion.div>

        {/* Tech badges */}
        <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-2 mb-16">
          <span className="text-xs text-slate-600 mr-2">Generates code in</span>
          {techBadges.map((t) => (
            <span key={t} className="px-3 py-1 rounded-full glass text-xs text-slate-400 font-medium border border-white/6">
              {t}
            </span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.5)} className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-4 py-4 text-center border border-white/6">
              <div className="text-2xl font-extrabold gradient-text mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Hero visual — mock IDE window */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 glass rounded-2xl border border-white/[0.07] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-white/2">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="ml-3 flex-1 h-6 rounded-lg glass flex items-center px-3">
              <Globe size={10} className="text-slate-600 mr-2" />
              <span className="text-xs text-slate-500">app.autostack.dev/dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-cyan-400 font-medium">Live Preview</span>
            </div>
          </div>

          {/* Mock prompt area */}
          <div className="p-6 flex flex-col gap-4 bg-linear-to-b from-white/2 to-transparent">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu size={13} className="text-white" />
              </div>
              <div className="flex-1 glass rounded-xl px-4 py-3 text-sm text-slate-400 text-left leading-relaxed">
                <span className="text-cyan-400 font-semibold">User:</span> Build me a SaaS dashboard with dark mode, user auth, a Stripe billing page, and a real-time analytics chart.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                <Code2 size={13} className="text-white" />
              </div>
              <div className="flex-1 glass rounded-xl px-4 py-3 text-sm text-left">
                <span className="text-purple-400 font-semibold">AutoStack AI:</span>
                <span className="text-slate-300"> Generating your SaaS application</span>
                <span className="text-slate-500"> — Planning architecture, scaffolding Next.js 14, setting up Prisma + Auth.js, creating Stripe webhooks, and live chart components</span>
                <span className="cursor" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="glass rounded-xl px-4 py-3">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Generating Components</span>
                <span className="text-cyan-400 font-medium">67%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                <div className="h-full w-[67%] rounded-full bg-linear-to-r from-cyan-500 to-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div {...fadeUp(1.0)} className="mt-12 flex flex-col items-center gap-2">
          <span className="text-xs text-slate-600">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-cyan-400"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}