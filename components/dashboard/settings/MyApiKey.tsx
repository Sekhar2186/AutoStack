"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Key, CheckCircle2, XCircle, Loader2, Zap, Trash2, Star,
    ExternalLink, ShieldCheck, AlertCircle, Eye, EyeOff
} from "lucide-react";

type SupportedProvider = "gemini" | "groq" | "openai" | "claude";

interface ProviderKeyInfo {
    provider: SupportedProvider;
    name: string;
    description: string;
    model: string;
    hasKey: boolean;
    maskedKey: string;
    isActive: boolean;
    color: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
    docsUrl: string;
    icon: React.ReactNode;
}

const PROVIDER_META: Record<SupportedProvider, {
    name: string; description: string; color: string; textColor: string;
    borderColor: string; bgColor: string; docsUrl: string; icon: React.ReactNode;
}> = {
    gemini: {
        name: "Gemini",
        description: "Google Generative AI",
        color: "from-blue-500/20 to-blue-600/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/10",
        docsUrl: "https://aistudio.google.com/app/apikey",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-400">
                <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
    claude: {
        name: "Claude",
        description: "Anthropic AI",
        color: "from-orange-500/20 to-orange-600/10",
        textColor: "text-orange-400",
        borderColor: "border-orange-500/20",
        bgColor: "bg-orange-500/10",
        docsUrl: "https://console.anthropic.com/settings/keys",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-orange-400">
                <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
    openai: {
        name: "OpenAI",
        description: "OpenAI API",
        color: "from-emerald-500/20 to-emerald-600/10",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/10",
        docsUrl: "https://platform.openai.com/api-keys",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-400">
                <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
    groq: {
        name: "Groq",
        description: "Groq Cloud",
        color: "from-purple-500/20 to-purple-600/10",
        textColor: "text-purple-400",
        borderColor: "border-purple-500/20",
        bgColor: "bg-purple-500/10",
        docsUrl: "https://console.groq.com/keys",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-purple-400">
                <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
};

const PROVIDERS: SupportedProvider[] = ["gemini", "groq", "openai", "claude"];

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
});

export default function MyApiKeys() {
    const [loading, setLoading] = useState(true);
    const [keys, setKeys] = useState<ProviderKeyInfo[]>([]);
    const [activeProvider, setActiveProvider] = useState<SupportedProvider>("gemini");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [deletingProvider, setDeletingProvider] = useState<SupportedProvider | null>(null);
    const [activatingProvider, setActivatingProvider] = useState<SupportedProvider | null>(null);
    const [showKeyProviders, setShowKeyProviders] = useState<Record<SupportedProvider, boolean>>({
        gemini: false, groq: false, openai: false, claude: false
    });

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchKeys = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/ai-settings", { headers: authHeaders() });
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            if (data.success && data.settings) {
                const currentActive: SupportedProvider = data.settings.selectedProvider ?? "gemini";
                setActiveProvider(currentActive);
                const built: ProviderKeyInfo[] = PROVIDERS.map((p) => {
                    const cfg = data.settings.providers?.[p] ?? { model: "", hasKey: false, maskedKey: "" };
                    const meta = PROVIDER_META[p];
                    return {
                        provider: p,
                        ...meta,
                        model: cfg.model || "",
                        hasKey: Boolean(cfg.hasKey),
                        maskedKey: cfg.maskedKey || "••••••••••••••••",
                        isActive: p === currentActive,
                    };
                });
                setKeys(built);
            }
        } catch {
            showToast("Failed to load API keys.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleUseKey = async (provider: SupportedProvider) => {
        setActivatingProvider(provider);
        try {
            const res = await fetch("/api/user/ai-settings", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    provider,
                    model: keys.find(k => k.provider === provider)?.model || "",
                    generationMode: "manual",
                    selectedProvider: provider,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setActiveProvider(provider);
                setKeys(prev => prev.map(k => ({ ...k, isActive: k.provider === provider })));
                showToast(`Now using ${PROVIDER_META[provider].name} as your active provider.`, "success");
            } else {
                showToast("Failed to switch provider.", "error");
            }
        } catch {
            showToast("Failed to switch provider.", "error");
        } finally {
            setActivatingProvider(null);
        }
    };

    const handleDelete = async (provider: SupportedProvider) => {
        if (!confirm(`Remove your ${PROVIDER_META[provider].name} API key?`)) return;
        setDeletingProvider(provider);
        try {
            const res = await fetch(`/api/user/ai-settings?provider=${provider}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setKeys(prev => prev.map(k => k.provider === provider ? { ...k, hasKey: false, isActive: false } : k));
                showToast(`${PROVIDER_META[provider].name} API key removed.`, "success");
            } else {
                showToast("Failed to remove API key.", "error");
            }
        } catch {
            showToast("Failed to remove API key.", "error");
        } finally {
            setDeletingProvider(null);
        }
    };

    const toggleShowKey = (provider: SupportedProvider) => {
        setShowKeyProviders(prev => ({ ...prev, [provider]: !prev[provider] }));
    };

    const configuredKeys = keys.filter(k => k.hasKey);
    const notConfiguredKeys = keys.filter(k => !k.hasKey);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Key className="w-5 h-5 text-cyan-400" />
                        My API Keys
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Keys added in AI Providers appear here. Click &quot;Use this key&quot; to set your active provider.
                    </p>
                </div>
                <a
                    href="/dashboard/settings?tab=ai"
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg"
                >
                    <Zap className="w-3.5 h-3.5" />
                    Manage Providers
                </a>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Configured Keys */}
                    {configuredKeys.length > 0 ? (
                        <div className="space-y-3">
                            {configuredKeys.map((keyInfo) => (
                                <motion.div
                                    key={keyInfo.provider}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`relative rounded-2xl border p-5 flex flex-col xl:flex-row xl:items-center gap-6 transition-all duration-300 mt-2 ${keyInfo.isActive
                                            ? `${keyInfo.borderColor} bg-slate-900/40 shadow-lg shadow-blue-900/10`
                                            : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {keyInfo.isActive && (
                                        <div className="absolute -top-3 right-4">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/50 shadow-sm backdrop-blur-md`}>
                                                ACTIVE
                                            </span>
                                        </div>
                                    )}

                                    {/* Provider Icon & Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${keyInfo.bgColor} border ${keyInfo.borderColor}`}>
                                            {keyInfo.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-100">{keyInfo.name}</p>
                                                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                                            </div>
                                            <p className="text-xs text-slate-400">{keyInfo.description}</p>
                                            {keyInfo.model && (
                                                <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                                                    Model: {keyInfo.model}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Key Display & Actions */}
                                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                                        
                                        {/* Key Masked Display */}
                                        <div className="flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-black/40 rounded-xl border border-white/5 shadow-inner min-w-[240px]">
                                            <Key className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span className="text-sm font-mono text-slate-300 tracking-[0.2em] flex-1 mt-1">
                                                {showKeyProviders[keyInfo.provider] ? keyInfo.maskedKey : "••••••••••••••••"}
                                            </span>
                                            <button 
                                                onClick={() => toggleShowKey(keyInfo.provider)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-all shrink-0"
                                            >
                                                {showKeyProviders[keyInfo.provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        {!keyInfo.isActive ? (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleUseKey(keyInfo.provider)}
                                                disabled={activatingProvider === keyInfo.provider}
                                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 disabled:opacity-50 min-w-[110px]`}
                                            >
                                                {activatingProvider === keyInfo.provider ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Star className="w-4 h-4" />
                                                )}
                                                Use key
                                            </motion.button>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800/40 text-slate-300 border border-slate-700/50 min-w-[110px]">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                In use
                                            </div>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(keyInfo.provider)}
                                            disabled={deletingProvider === keyInfo.provider}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 hover:border-red-500/50 transition-all disabled:opacity-50 shrink-0"
                                            title="Delete API Key"
                                        >
                                            {deletingProvider === keyInfo.provider ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/10 bg-white/2 text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-slate-300 font-medium">No API keys configured</p>
                                <p className="text-slate-500 text-sm mt-1">Add your keys in the AI Providers section to use your own API.</p>
                            </div>
                            <a
                                href="/dashboard/settings?tab=ai"
                                className="mt-1 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Go to AI Providers
                            </a>
                        </div>
                    )}

                    {/* Not configured providers */}
                    {notConfiguredKeys.length > 0 && configuredKeys.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Not Configured</p>
                            <div className="grid grid-cols-2 gap-2">
                                {notConfiguredKeys.map((keyInfo) => (
                                    <a
                                        key={keyInfo.provider}
                                        href={keyInfo.docsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all group"
                                    >
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 shrink-0">
                                            {keyInfo.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{keyInfo.name}</p>
                                            <p className="text-[10px] text-slate-600 truncate">Add key →</p>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security note */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-white/2 border border-white/5 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>All API keys are encrypted with AES-256-GCM and are never exposed after saving. Only you can use them.</span>
                    </div>
                </>
            )}

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium backdrop-blur-md ${toast.type === "success"
                                ? "bg-green-950/80 border-green-500/40 text-green-400"
                                : "bg-red-950/80 border-red-500/40 text-red-400"
                            }`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
