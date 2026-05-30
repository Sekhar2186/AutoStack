"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, Book, MessageSquare, ExternalLink,
  ChevronRight, Mail, GitBranch, Globe, Loader2, Check
} from "lucide-react";

export default function HelpView() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I export my project?", a: "You can export your project as a ZIP file or push it directly to GitHub from the 'Export' tab in the IDE panel." },
    { q: "Can I use my own API keys?", a: "Yes, you can configure your own Gemini, OpenAI, or Anthropic keys in Settings > Security (coming soon)." },
    { q: "What models are supported?", a: "We currently support Gemini 1.5 Pro/Flash, GPT-4o, and Claude 3.5 Sonnet/Opus." },
    { q: "Is there a limit on free generations?", a: "The Starter plan includes 20 generations per month. Pro plan users get unlimited generations." },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setToast({ type: "error", msg: "Please fill out all fields" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({ subject, message })
      });

      const data = await response.json();
      if (data.success) {
        setToast({ type: "success", msg: data.message });
        setSubject("");
        setMessage("");
      } else {
        setToast({ type: "error", msg: data.message || "Something went wrong" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", msg: "Failed to submit support ticket" });
    } finally {
      setIsSending(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const openResource = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Help & Support</h2>
        <p className="text-slate-500 text-sm">Find answers, learn the platform, or contact our team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resource Cards */}
        <div className="space-y-4">
          <div
            onClick={() => openResource("https://docs.github.com")}
            className="glass glass-hover p-6 rounded-2xl border border-white/10 flex items-start gap-4 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Book size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">Documentation</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">Learn everything about building, deploying, and managing apps with AutoStack.</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Read Docs <ExternalLink size={10} />
              </div>
            </div>
          </div>

          <div
            onClick={() => openResource("https://discord.com")}
            className="glass glass-hover p-6 rounded-2xl border border-white/10 flex items-start gap-4 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <MessageSquare size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1 group-hover:text-purple-400 transition-colors">Community Forum</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">Join our Discord and GitHub discussions to share ideas and get help from other devs.</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Join Community <ExternalLink size={10} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="glass p-6 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Mail size={18} className="text-amber-400" />
            Contact Support
          </h3>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</label>
              <input
                type="text"
                placeholder="I need help with..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all"
              />
            </div>
            <div className="space-y-2 grow flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message</label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all resize-none flex-1"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="shimmer-btn w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-sm mt-6 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>

      {/* FAQs */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                onClick={() => setActiveFaq(isOpen ? null : i)}
                className="p-5 glass rounded-2xl border border-white/5 cursor-pointer select-none transition-all duration-300 hover:border-white/15"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">{faq.q}</h4>
                  <ChevronRight
                    size={16}
                    className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-90 text-cyan-400" : ""}`}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-white/5">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-auto pt-8 flex items-center justify-center gap-8 border-t border-white/5">
        <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-slate-200 transition-colors">
          <GitBranch size={18} />
          <span className="text-xs font-medium">GitHub</span>
        </a>
        <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-slate-200 transition-colors">
          <Globe size={18} />
          <span className="text-xs font-medium">Twitter</span>
        </a>
        <a href="mailto:support@autostack.dev" className="flex items-center gap-2 text-slate-500 hover:text-slate-200 transition-colors">
          <Mail size={18} />
          <span className="text-xs font-medium">support@autostack.dev</span>
        </a>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-semibold backdrop-blur-md ${toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}