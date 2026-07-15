"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Sparkles, Globe, Code2, Cpu, MessageSquare, Network, Database, Rocket, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { Play } from "lucide-react";
import Ferrofluid from "@/components/Ferrofluid";
import TextType from "@/components/TextType";
import LogoLoop from "@/components/LogoLoop";

const stats = [
  { value: "10x", label: "Faster Development" },
  { value: "50k+", label: "Apps Generated" },
  { value: "99.9%", label: "Uptime SLA" },
];

const techBadges = ["Next.js", "React", "TypeScript", "Tailwind", "PostgreSQL", "Prisma"];

const processSteps = [
  {
    node: (
      <div className="group relative flex items-center gap-5 px-7 py-5 rounded-[2rem] bg-slate-950/80 backdrop-blur-xl border border-white/10 min-w-[340px] transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_10px_40px_-10px_rgba(6,182,212,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <MessageSquare size={21} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-cyan-400 transition-colors">Describe</h3>
            <span className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest bg-cyan-500/10 px-2 py-1 rounded-lg">Step 01</span>
          </div>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Plain English prompt</p>
        </div>
      </div>
    )
  },
  {
    node: (
      <div className="group relative flex items-center gap-5 px-7 py-5 rounded-[2rem] bg-slate-950/80 backdrop-blur-xl border border-white/10 min-w-[340px] transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <Network size={21} className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-purple-400 transition-colors">Architecture</h3>
            <span className="text-[10px] font-black text-purple-500/50 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-lg">Step 02</span>
          </div>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">AI plans the stack</p>
        </div>
      </div>
    )
  },
  {
    node: (
      <div className="group relative flex items-center gap-5 px-7 py-5 rounded-[2rem] bg-slate-950/80 backdrop-blur-xl border border-white/10 min-w-[340px] transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <LayoutTemplate size={21} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-blue-400 transition-colors">Scaffold</h3>
            <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-lg">Step 03</span>
          </div>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Next.js & UI setup</p>
        </div>
      </div>
    )
  },
  {
    node: (
      <div className="group relative flex items-center gap-5 px-7 py-5 rounded-[2rem] bg-slate-950/80 backdrop-blur-xl border border-white/10 min-w-[340px] transition-all duration-500 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <Database size={21} className="text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-green-400 transition-colors">Database</h3>
            <span className="text-[10px] font-black text-green-500/50 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-lg">Step 04</span>
          </div>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Prisma schemas generated</p>
        </div>
      </div>
    )
  },
  {
    node: (
      <div className="group relative flex items-center gap-5 px-7 py-5 rounded-[2rem] bg-slate-950/80 backdrop-blur-xl border border-white/10 min-w-[340px] transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <Rocket size={21} className="text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-orange-400 transition-colors">Deploy</h3>
            <span className="text-[10px] font-black text-orange-500/50 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded-lg">Step 05</span>
          </div>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Instant Vercel deployment</p>
        </div>
      </div>
    )
  }
];

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
      {/* Ambient Ferrofluid background */}
      <div className="absolute inset-0 z-0">
        <Ferrofluid
          colors={['#06B6D4', '#9333EA', '#0ea5e9']}
          speed={0.5}
          scale={1.2}
          turbulence={0.8}
          fluidity={0.2}
          mouseInteraction={true}
          opacity={0.6}
          className=""
          dpr={undefined}
          mixBlendMode={undefined}
        />
      </div>

      {/* Radial glow center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[700px] h-[700px] rounded-full bg-gradient-radial from-cyan-500/10 via-purple-600/5 to-transparent blur-3xl" />
      </div>

      {/* Floating orbs */}
      <div className="orb absolute top-24 left-[12%] w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none z-0" />
      <div className="orb-delay absolute bottom-32 right-[10%] w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none z-0" />
      <div className="orb absolute top-1/2 right-[20%] w-48 h-48 rounded-full bg-cyan-400/5 blur-[60px] pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Text & Stats */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge */}
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-semibold text-cyan-400 mb-6 border border-cyan-500/20">
              <Sparkles size={13} className="text-cyan-400" />
              AI Agents for App Generation &amp; More
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6">
              <span className="text-slate-50">AutoStack</span>
              <br />
              <span className="text-slate-400">The Future of</span>
              <br />
              <span className="text-slate-50">Web Dev</span>
            </motion.h1>

            {/* Sub */}
            <motion.p {...fadeUp(0.2)} className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed mb-8">
              Describe your app in plain English. AutoStack&apos;s AI engine generates the complete
              full-stack codebase, live preview, and deployment pipeline — in under 60 seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 mb-10 w-full">
              <Link
                href={isLoggedIn ? "/dashboard" : "/auth?mode=signup"}
                id="hero-cta-primary"
                className="shimmer-btn flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl glass border border-white/10 text-slate-200 font-semibold text-sm hover:scale-105 hover:border-white/600 active:scale-100 transition-all duration-200"
              //className="shimmer-btn flex items-center justify-center gap-1 px-6 py-3.5 rounded-2xl bg-linear-to-r from-white to-white text-black font-semibold text-md hover:scale-105 active:scale-100 transition-transform duration-200 shadow-[0_0_24px_rgba(34,211,238,0.4)]"
              >
                <Zap size={16} className="fill-white text-white" />
                Start Building for Free
              </Link>
              <button
                id="hero-cta-demo"
                className="shimmer-btn flex items-center justify-center gap-1 px-6 py-3.5 rounded-2xl glass border border-white/10 text-slate-200 font-semibold text-sm hover:scale-105 hover:border-cyan-500/30 active:scale-100 transition-all duration-200"
              >
                <Play size={15} className="fill-slate-200 text-slate-200" />
                Watch Demo
              </button>
            </motion.div>


          </div>

          {/* Right Column: Mock IDE Window */}
          <div className="lg:col-span-6 w-full animate-fade-in">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-2xl border border-white/[0.07] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] w-full"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-4.5 border-b border-white/6 bg-white/2">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="ml-3 flex-1 h-6 rounded-lg glass flex items-center px-3">
                  <Globe size={10} className="text-slate-600 mr-2" />
                  <span className="text-[11px] text-slate-500 truncate">app.autostack.dev/dashboard</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-cyan-400 font-medium">Live Preview</span>
                </div>
              </div>

              {/* Mock prompt area */}
              <div className="p-6 flex flex-col gap-5 min-h-[390px] bg-linear-to-b from-white/2 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu size={12} className="text-white" />
                  </div>
                  <div className="flex-1 glass rounded-xl px-3.5 py-4.5 text-[15px] text-slate-400 text-left leading-relaxed font-sans">
                    <span className="text-cyan-400 font-semibold">User:</span> Build me a SaaS dashboard with dark mode, user auth, a Stripe billing page, and a real-time analytics chart.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-linear-to-br from-purple-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Code2 size={12} className="text-white" />
                  </div>
                  <div className="flex-1 glass rounded-xl px-3.5 py-4.5 text-[15px] text-left font-sans">
                    <span className="text-purple-400 font-semibold mr-1">AutoStack AI:</span>
                    <TextType
                      text="Generating your SaaS application — Planning architecture, scaffolding Next.js 14, setting up Prisma + Auth.js, creating Stripe webhooks, and live chart components"
                      typingSpeed={30}
                      className="text-slate-300 inline"
                      cursorClassName="text-cyan-400"
                      loop={false}
                      variableSpeed={undefined}
                      onSentenceComplete={undefined}
                    />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="glass rounded-xl px-3.5 py-4.5 mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Generating Components</span>
                    <span className="text-cyan-400 font-medium">77%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div className="h-full w-[77%] rounded-full bg-linear-to-r from-cyan-500 to-purple-600" />
                  </div>
                </div>
              </div>
            </motion.div>


          </div>

        </div>

        {/* Bottom Section: Tech Badges & Stats */}
        <div className="mt-20 flex flex-col items-center">
          {/* Tech badges */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <span className="text-xs text-slate-600 mr-2">Generates code in</span>
            {techBadges.map((t) => (
              <span key={t} className="px-4 py-1.5 rounded-full glass text-[12px] text-slate-400 font-medium border border-white/6">
                {t}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.5)} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl px-4 py-4 text-center border border-white/6 shadow-xl">
                <div className="text-3xl md:text-4xl font-extrabold text-zinc-100 mb-2">{s.value}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Generation Process Loop */}
        <motion.div {...fadeUp(0.6)} className="mt-32 w-full relative z-20">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
              <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 uppercase">
                Under the Hood
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">The AutoStack Generation Process</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm md:text-base">Watch how our multi-agent AI system transforms your prompt into a production-ready application.</p>
          </div>
          <div className="w-screen relative left-1/2 -translate-x-1/2">
            {/* @ts-ignore */}
            <LogoLoop
              logos={processSteps}
              speed={40}
              direction="left"
              gap={24}
              logoHeight={80}
              pauseOnHover={true}
              fadeOut={true}
              fadeOutColor="#020617" // Using a dark slate color that matches the vibe
            />
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div {...fadeUp(1.0)} className="mt-16 flex flex-col items-center gap-2">
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