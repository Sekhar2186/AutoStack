"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronDown, Wand2, Loader2, Send,
} from "lucide-react";

const uiLibraries = ["Tailwind CSS", "Shadcn/UI", "Material UI", "Chakra UI", "Ant Design", "Bootstrap"];
const aiModels = [
  { id: "gemini-3.0-flash", name: "Gemini 3.0 Flash", locked: false },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", locked: false },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", locked: false },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", locked: false },
  { id: "gpt4o", name: "GPT-4o", locked: true },
  { id: "claude-sonnet", name: "Claude Sonnet", locked: true },
];
const stylePresets = [
  { id: "glass", label: "🪟 Glassmorphism" },
  { id: "minimal", label: "◻ Minimal" },
  { id: "vibrant", label: "🎨 Vibrant" },
  { id: "dark", label: "🌑 Dark Pro" },
  { id: "corporate", label: "🏢 Corporate" },
];
const examplePrompts = [
  "Build a SaaS dashboard with auth, charts, and billing",
  "Create an e-commerce store with product catalog and cart",
  "Make a social media app with posts, likes, and comments",
  "Build a portfolio site with animations and contact form",
];

interface PromptEngineProps {
  onGenerate: (data: { prompt: string; template: string; selectedModel: string }) => void;
  isGenerating: boolean;
}

export default function PromptEngine({ onGenerate, isGenerating }: PromptEngineProps) {
  const [prompt, setPrompt] = useState("");
  const [uiLib, setUiLib] = useState("Tailwind CSS");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [style, setStyle] = useState("glass");
  const [uiDropOpen, setUiDropOpen] = useState(false);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;

    // Map style to actual directory names in ui-templates
    const styleMap: Record<string, string> = {
      glass: "glassy-ui",
      minimal: "minimal-ui",
      vibrant: "animated-ui",
      dark: "modern-ui",
      corporate: "modern-ui",
    };

    onGenerate({
      prompt: prompt.trim(),
      template: styleMap[style] || "glassy-ui",
      selectedModel: model,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
  };

  const selectedModel = aiModels.find((m) => m.id === model)!;

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Wand2 size={15} className="text-cyan-400" />
            Prompt Engine
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">Describe what you want to build</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-500">AI Ready</span>
        </div>
      </div>

      {/* Prompt textarea */}
      <div className="relative flex-1 min-h-0">
        <div className={`relative h-full glass rounded-xl border transition-all duration-300 ${prompt ? "border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.08)]" : "border-white/7"
          }`}>
          <textarea
            ref={textareaRef}
            id="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your web app in detail…

e.g. Build a SaaS analytics dashboard with dark mode, user authentication, real-time charts, and a subscription billing page using Stripe."
            disabled={isGenerating}
            className="w-full h-full min-h-[200px] resize-none bg-transparent p-4 text-sm text-slate-200 placeholder-slate-600 outline-none leading-relaxed terminal-font rounded-xl"
          />
          {/* Char count */}
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-700">
            {prompt.length} chars
          </div>
        </div>
      </div>

      {/* Example prompts */}
      <div>
        <p className="text-[11px] text-slate-600 mb-2 font-medium">Quick examples:</p>
        <div className="flex flex-col gap-1.5">
          {examplePrompts.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-left text-[11px] text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white/4 transition-all duration-150 border border-transparent hover:border-white/6 truncate"
            >
              → {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Style presets */}
      <div>
        <p className="text-[11px] text-slate-500 mb-2 font-medium">UI Style</p>
        <div className="flex flex-wrap gap-2">
          {stylePresets.map((s) => (
            <button
              key={s.id}
              id={`style-${s.id}`}
              onClick={() => setStyle(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border ${style === s.id
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                : "glass border-white/6 text-slate-500 hover:text-slate-300 hover:border-white/15"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdowns row */}
      <div className="grid grid-cols-2 gap-3">
        {/* UI Library */}
        <div className="relative">
          <p className="text-[11px] text-slate-500 mb-1.5 font-medium">UI Library</p>
          <button
            id="ui-lib-dropdown"
            onClick={() => { setUiDropOpen((v) => !v); setModelDropOpen(false); }}
            className="w-full flex items-center justify-between glass rounded-xl px-3 py-2 border border-white/7 hover:border-cyan-500/20 transition-colors"
          >
            <span className="text-[12px] text-slate-300 truncate">{uiLib}</span>
            <ChevronDown size={13} className={`text-slate-500 shrink-0 ml-1 transition-transform ${uiDropOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {uiDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 right-0 glass rounded-xl border border-white/8 p-1 z-50 shadow-xl"
              >
                {uiLibraries.map((lib) => (
                  <button
                    key={lib}
                    onClick={() => { setUiLib(lib); setUiDropOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors ${uiLib === lib ? "text-cyan-400 bg-cyan-500/10" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                  >
                    {lib}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Model */}
        <div className="relative">
          <p className="text-[11px] text-slate-500 mb-1.5 font-medium">AI Model</p>
          <button
            id="model-dropdown"
            onClick={() => { setModelDropOpen((v) => !v); setUiDropOpen(false); }}
            className="w-full flex items-center justify-between glass rounded-xl px-3 py-2 border border-white/7 hover:border-cyan-500/20 transition-colors"
          >
            <span className="text-[12px] text-slate-300 truncate">{selectedModel.name}</span>
            <ChevronDown size={13} className={`text-slate-500 shrink-0 ml-1 transition-transform ${modelDropOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {modelDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 right-0 glass rounded-xl border border-white/8 p-1 z-50 shadow-xl"
              >
                {aiModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { if (!m.locked) { setModel(m.id); setModelDropOpen(false); } }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors flex items-center justify-between ${m.locked
                      ? "text-slate-600 cursor-not-allowed"
                      : model === m.id
                        ? "text-cyan-400 bg-cyan-500/10"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                  >
                    {m.name}
                    {m.locked && <span className="text-[10px] text-amber-500">Pro</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Generate button */}
      <button
        id="generate-btn"
        onClick={handleSubmit}
        disabled={!prompt.trim() || isGenerating}
        className={`shimmer-btn w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${prompt.trim() && !isGenerating
          ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-100"
          : "bg-white/4 text-slate-600 cursor-not-allowed border border-white/6"
          }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate App
            <span className="text-[10px] opacity-60 ml-1">⌘↵</span>
          </>
        )}
      </button>

      {/* Hint */}
      <p className="text-center text-[10px] text-slate-700">
        Using <span className="text-slate-500">{selectedModel.name}</span> · {uiLib} · {stylePresets.find(s => s.id === style)?.label}
      </p>
    </div>
  );
}
