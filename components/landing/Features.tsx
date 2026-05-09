"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit, MonitorPlay, Package, Layers3, GitBranch, Users,
} from "lucide-react";

const features = [
  {
    id: "ai-logic",
    icon: BrainCircuit,
    iconColor: "text-cyan-400",
    iconBg: "from-cyan-500/20 to-cyan-500/5",
    accent: "group-hover:border-cyan-500/40",
    title: "AI Logic Engine",
    description:
      "Multi-model reasoning with Gemini, GPT-4o, and Claude. AutoStack selects the optimal model per task — architecture, UI, and APIs each get expert treatment.",
    tag: "Core AI",
    tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    wide: true,
  },
  {
    id: "live-sandbox",
    icon: MonitorPlay,
    iconColor: "text-purple-400",
    iconBg: "from-purple-500/20 to-purple-500/5",
    accent: "group-hover:border-purple-500/40",
    title: "Live Sandbox Preview",
    description:
      "Instant hot-reload preview inside a real iframe with responsive viewport controls.",
    tag: "Preview",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    wide: false,
  },
  {
    id: "export",
    icon: Package,
    iconColor: "text-emerald-400",
    iconBg: "from-emerald-500/20 to-emerald-500/5",
    accent: "group-hover:border-emerald-500/40",
    title: "One-Click Export",
    description:
      "Download a production-ready ZIP or push directly to GitHub with one click.",
    tag: "Export",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    wide: false,
  },
  {
    id: "multi-model",
    icon: Layers3,
    iconColor: "text-amber-400",
    iconBg: "from-amber-500/20 to-amber-500/5",
    accent: "group-hover:border-amber-500/40",
    title: "Multi-Model Routing",
    description:
      "Switch between AI providers on the fly. Upgrade your plan to unlock GPT-4o and Claude Opus for maximum capability.",
    tag: "Pro Feature",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    wide: false,
  },
  {
    id: "versions",
    icon: GitBranch,
    iconColor: "text-pink-400",
    iconBg: "from-pink-500/20 to-pink-500/5",
    accent: "group-hover:border-pink-500/40",
    title: "Version Control",
    description:
      "Every generation is versioned. Rollback, compare diffs, or branch into new iterations without losing your work.",
    tag: "Versioning",
    tagColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    wide: false,
  },
  {
    id: "collab",
    icon: Users,
    iconColor: "text-blue-400",
    iconBg: "from-blue-500/20 to-blue-500/5",
    accent: "group-hover:border-blue-500/40",
    title: "Team Collaboration",
    description:
      "Invite team members, assign roles, and build together with live presence indicators and shared project workspaces.",
    tag: "Enterprise",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    wide: true,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      {/* Section glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-slate-400 mb-5">
            ⚡ Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50 mb-4">
            Everything you need to{" "}
            <span className="gradient-text">ship faster</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            AutoStack combines AI code generation with a professional IDE experience, live preview, and deployment tools in one unified platform.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.id}
                variants={item}
                id={`feature-${f.id}`}
                className={`group relative glass glass-hover rounded-2xl p-6 cursor-default border border-white/7 ${f.accent} transition-all duration-300 ${f.wide ? "md:col-span-2" : "md:col-span-1"
                  }`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${f.iconBg} flex items-center justify-center mb-5 border border-white/6`}>
                  <Icon size={20} className={f.iconColor} />
                </div>

                {/* Tag */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${f.tagColor} mb-3`}>
                  {f.tag}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                  {f.description}
                </p>

                {/* Animated bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/40 transition-all duration-500 rounded-b-2xl" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
