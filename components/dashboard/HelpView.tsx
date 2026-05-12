"use client";

import { motion } from "framer-motion";
import {
  HelpCircle, Book, MessageSquare, ExternalLink,
  ChevronRight, Mail, GitBranch, Globe
} from "lucide-react";

export default function HelpView() {
  const faqs = [
    { q: "How do I export my project?", a: "You can export your project as a ZIP file or push it directly to GitHub from the 'Export' tab in the IDE panel." },
    { q: "Can I use my own API keys?", a: "Yes, you can configure your own Gemini, OpenAI, or Anthropic keys in Settings > Security (coming soon)." },
    { q: "What models are supported?", a: "We currently support Gemini 1.5 Pro/Flash, GPT-4o, and Claude 3.5 Sonnet/Opus." },
    { q: "Is there a limit on free generations?", a: "The Starter plan includes 20 generations per month. Pro plan users get unlimited generations." },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Help & Support</h2>
        <p className="text-slate-500 text-sm">Find answers, learn the platform, or contact our team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resource Cards */}
        <div className="space-y-4">
          <div className="glass glass-hover p-6 rounded-2xl border border-white/10 flex items-start gap-4 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Book size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Documentation</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">Learn everything about building, deploying, and managing apps with AutoStack.</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Read Docs <ExternalLink size={10} />
              </div>
            </div>
          </div>

          <div className="glass glass-hover p-6 rounded-2xl border border-white/10 flex items-start gap-4 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <MessageSquare size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Community Forum</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">Join our Discord and GitHub discussions to share ideas and get help from other devs.</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Join Community <ExternalLink size={10} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Mail size={18} className="text-amber-400" />
            Contact Support
          </h3>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</label>
              <input type="text" placeholder="I need help with..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/30 transition-all" />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message</label>
              <textarea placeholder="Describe your issue in detail..." className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/30 transition-all resize-none" />
            </div>
          </div>
          <button className="shimmer-btn w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-bold text-sm mt-6 hover:bg-white/10 transition-all">
            Send Message
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 glass rounded-2xl border border-white/5"
            >
              <h4 className="text-sm font-bold text-slate-200 mb-2">{faq.q}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-auto py-8 flex items-center justify-center gap-8 border-t border-white/5">
        <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <GitBranch size={18} />
          <span className="text-xs font-medium">GitHub</span>
        </a>
        <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <Globe size={18} />
          <span className="text-xs font-medium">Twitter</span>
        </a>
        <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <Mail size={18} />
          <span className="text-xs font-medium">support@autostack.dev</span>
        </a>
      </div>
    </div>
  );
}