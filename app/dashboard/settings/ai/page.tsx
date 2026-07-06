"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Save, Trash2, CheckCircle2, XCircle, Loader2, Activity, Info, ChevronDown } from "lucide-react";

type SupportedProvider = "gemini" | "groq" | "openai" | "claude";

interface ProviderConfig {
    model: string;
    hasKey: boolean;
}

interface SettingsState {
    generationMode: "auto" | "manual";
    selectedProvider: SupportedProvider;
    providers: Record<SupportedProvider, ProviderConfig>;
}

const BRAND_COLORS = {
    gemini: {
        text: "text-blue-400",
        border: "border-blue-500/10",
        borderHover: "hover:border-blue-500/30",
        bg: "bg-blue-600 hover:bg-blue-500",
        bgLight: "bg-blue-500/10",
        glow: "shadow-[0_0_15px_rgba(59,130,246,0.35)]",
        cardHover: "hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] hover:border-blue-500/25",
        badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        iconBg: "from-blue-500/10 to-blue-500/[0.02] border-blue-500/20",
        focus: "focus:ring-blue-500/20 focus:border-blue-500/30"
    },
    claude: {
        text: "text-orange-400",
        border: "border-orange-500/10",
        borderHover: "hover:border-orange-500/30",
        bg: "bg-orange-600 hover:bg-orange-500",
        bgLight: "bg-orange-500/10",
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.35)]",
        cardHover: "hover:shadow-[0_0_30px_rgba(249,115,22,0.08)] hover:border-orange-500/25",
        badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",
        iconBg: "from-orange-500/10 to-orange-500/[0.02] border-orange-500/20",
        focus: "focus:ring-orange-500/20 focus:border-orange-500/30"
    },
    openai: {
        text: "text-emerald-400",
        border: "border-emerald-500/10",
        borderHover: "hover:border-emerald-500/30",
        bg: "bg-emerald-600 hover:bg-emerald-500",
        bgLight: "bg-emerald-500/10",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.35)]",
        cardHover: "hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] hover:border-emerald-500/25",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        iconBg: "from-emerald-500/10 to-emerald-500/[0.02] border-emerald-500/20",
        focus: "focus:ring-emerald-500/20 focus:border-emerald-500/30"
    },
    groq: {
        text: "text-purple-400",
        border: "border-purple-500/10",
        borderHover: "hover:border-purple-500/30",
        bg: "bg-purple-600 hover:bg-purple-500",
        bgLight: "bg-purple-500/10",
        glow: "shadow-[0_0_15px_rgba(168,85,247,0.35)]",
        cardHover: "hover:shadow-[0_0_30px_rgba(168,85,247,0.08)] hover:border-purple-500/25",
        badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",
        iconBg: "from-purple-500/10 to-purple-500/[0.02] border-purple-500/20",
        focus: "focus:ring-purple-500/20 focus:border-purple-500/30"
    }
};

const PROVIDERS: { id: SupportedProvider; name: string; desc: string; defaultModels: string[]; color: string; icon: React.ReactNode }[] = [
    {
        id: "gemini",
        name: "Gemini",
        desc: "Google Generative AI",
        defaultModels: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"],
        color: "text-blue-500",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500">
                <path d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
    {
        id: "claude",
        name: "Claude",
        desc: "Anthropic AI",
        defaultModels: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
        color: "text-orange-500",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-500">
                <path d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
    {
        id: "openai",
        name: "OpenAI",
        desc: "OpenAI API",
        defaultModels: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
        color: "text-green-500",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500">
                <path d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
    {
        id: "groq",
        name: "Groq",
        desc: "Groq Cloud",
        defaultModels: ["llama-3.3-70b-versatile", "llama-3.1-8b", "mixtral-8x7b-32768"],
        color: "text-purple-500",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-500">
                <path d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z" fill="currentColor" />
            </svg>
        ),
    },
];

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};


export default function AISettingsPage() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<SettingsState>({
        generationMode: "auto",
        selectedProvider: "gemini",
        providers: {
            gemini: { model: "gemini-2.5-flash", hasKey: false },
            groq: { model: "llama-3.3-70b-versatile", hasKey: false },
            openai: { model: "gpt-4o", hasKey: false },
            claude: { model: "claude-3-5-sonnet", hasKey: false },
        },
    });

    // State to hold user edits before they hit save for Generation Mode
    const [localMode, setLocalMode] = useState<"auto" | "manual">("auto");
    const [localProvider, setLocalProvider] = useState<SupportedProvider>("gemini");
    const [savingMode, setSavingMode] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/ai-settings", {
                headers: authHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.settings) {
                    setSettings(data.settings);
                    setLocalMode(data.settings.generationMode || "auto");
                    setLocalProvider(data.settings.selectedProvider || "gemini");
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
            showToast("Failed to load AI settings.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const saveGenerationMode = async () => {
        setSavingMode(true);
        try {
            const pData = settings.providers[localProvider] || settings.providers["gemini"];
            const res = await fetch("/api/user/ai-settings", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    provider: localProvider,
                    model: pData.model,
                    generationMode: localMode,
                    selectedProvider: localProvider,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
                showToast("Preferences saved successfully.", "success");
            } else {
                showToast("Unable to save preferences. Please try again.", "error");
            }
        } catch (err) {
            showToast("Unable to save preferences. Please try again.", "error");
        } finally {
            setSavingMode(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 text-white h-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">AI Settings</h1>
                <p className="text-gray-400 mb-8">Configure your AI providers and set your intelligent fallbacks.</p>

                {/* Generation Mode Section */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-100">Generation Mode</h2>
                        <motion.button
                            whileHover={(localMode !== settings.generationMode || localProvider !== settings.selectedProvider) ? { scale: 1.02 } : {}}
                            whileTap={(localMode !== settings.generationMode || localProvider !== settings.selectedProvider) ? { scale: 0.98 } : {}}
                            onClick={saveGenerationMode}
                            disabled={savingMode || (localMode === settings.generationMode && localProvider === settings.selectedProvider)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${(localMode !== settings.generationMode || localProvider !== settings.selectedProvider)
                                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-400"
                                : "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                                }`}
                        >
                            {savingMode && <Loader2 className="w-4 h-4 animate-spin" />}
                            {savingMode ? "Saving..." : "Save Preferences"}
                        </motion.button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-20 w-full" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div
                                onClick={() => setLocalMode('auto')}
                                className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 ${localMode === 'auto'
                                    ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                                        Auto <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">Recommended</span>
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1">Uses AutoStack intelligent fallback. Gemini → Groq</div>
                                </div>
                            </div>
                            <div
                                onClick={() => setLocalMode('manual')}
                                className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${localMode === 'manual'
                                    ? "border-white bg-white/5 ring-1 ring-white"
                                    : "border-white/10 bg-black hover:border-white/30 hover:bg-white/5"
                                    }`}
                            >
                                <div className="font-bold text-slate-100">Manual Selection</div>
                                <div className="text-sm text-slate-400">Choose a specific provider for AI generation.</div>

                                {localMode === 'manual' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                                        {PROVIDERS.map((provider) => {
                                            const brand = BRAND_COLORS[provider.id as SupportedProvider] || BRAND_COLORS.gemini;
                                            const isSelected = localProvider === provider.id;
                                            return (
                                                <div
                                                    key={provider.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLocalProvider(provider.id);
                                                    }}
                                                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 ${isSelected
                                                        ? "border-slate-200 bg-white/10 shadow-lg shadow-black/40 ring-1 ring-white/10"
                                                        : "border-white/5 bg-slate-950/40 hover:border-white/20 hover:bg-white/5"
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isSelected ? brand.text.replace('text-', 'bg-') : 'bg-transparent border border-white/20'}`} />
                                                    <div className="text-sm font-semibold text-slate-200">{provider.name}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <hr className="border-white/10 mb-10" />

                {/* Providers Grid Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-6">Providers</h2>
                    {loading ? (
                        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}
                        </div>
                    ) : (
                        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                            {PROVIDERS.map((provider) => (
                                <ProviderCard
                                    key={provider.id}
                                    providerInfo={provider}
                                    config={settings.providers[provider.id as SupportedProvider]}
                                    onUpdate={(newSettings) => setSettings(newSettings)}
                                    showToast={showToast}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Security Info */}
                <section className="mt-16 bg-white/5 border border-white/10 rounded-xl p-6 text-sm text-gray-400">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Security
                    </h3>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> API keys are encrypted using AES-256-GCM</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Keys are never shown after saving</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Keys are never shared with other users</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> You can remove them at any time</li>
                    </ul>
                </section>
            </motion.div>

            {/* Toast Container */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl font-medium border ${toast.type === "success" ? "bg-green-950/80 border-green-500/50 text-green-400" : "bg-red-950/80 border-red-500/50 text-red-400"
                            } backdrop-blur-md z-50`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// -------------------------------------------------------------
// Provider Card Component
// -------------------------------------------------------------
function ProviderCard({
    providerInfo,
    config,
    onUpdate,
    showToast
}: {
    providerInfo: typeof PROVIDERS[0];
    config: ProviderConfig;
    onUpdate: (s: SettingsState) => void;
    showToast: (m: string, t: "success" | "error") => void;
}) {
    const [localConfig, setLocalConfig] = useState(config);
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ status: "success" | "error", message: string } | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Sync if upstream changes
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = async () => {
        setValidationError(null);
        if (!config.hasKey && !apiKey.trim()) {
            setValidationError("API Key is required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/user/ai-settings", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    provider: providerInfo.id,
                    apiKey: apiKey.trim(),
                    model: localConfig.model || providerInfo.defaultModels[0],
                }),
            });
            const data = await res.json();
            if (data.success) {
                onUpdate(data.settings);
                setApiKey("");
                showToast("Settings saved successfully.", "success");
            } else {
                showToast("Unable to save settings. Please try again.", "error");
            }
        } catch (e) {
            showToast("Unable to save settings. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this API key?")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/user/ai-settings?provider=${providerInfo.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                onUpdate(data.settings);
                setApiKey("");
                showToast("API key removed.", "success");
            } else {
                showToast("Failed to remove API key.", "error");
            }
        } catch (e) {
            showToast("Failed to remove API key.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        setValidationError(null);

        if (!apiKey.trim() && !config.hasKey) {
            setValidationError("API Key is required to test connection.");
            setTesting(false);
            return;
        }

        try {
            const res = await fetch("/api/user/ai-settings/test", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    provider: providerInfo.id,
                    apiKey: apiKey.trim(),
                    model: localConfig.model || providerInfo.defaultModels[0],
                }),
            });

            if (res.ok) {
                setTestResult({ status: "success", message: "Connection successful" });
                showToast("Connection Successful", "success");
            } else {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.message || "Invalid API key or network error.";
                setTestResult({ status: "error", message: errMsg });
                showToast("Connection Failed", "error");
            }
        } catch (e: unknown) {
            setTestResult({ status: "error", message: "Connection failed. Please check your network." });
            showToast("Connection Failed", "error");
        } finally {
            setTesting(false);
        }
    };

    const isDirty = apiKey.length > 0 || localConfig.model !== config.model;

    const brand = BRAND_COLORS[providerInfo.id as SupportedProvider] || BRAND_COLORS.gemini;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-linear-to-b from-slate-950/80 to-slate-900/60 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 relative flex flex-col transition-all duration-500 shadow-xl shadow-black/40 group ${brand.cardHover}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-3">
                <div className="flex items-center gap-4">
                    <div className={`p-3 bg-linear-to-br ${brand.iconBg} rounded-xl border transition-all duration-300 relative`}>
                        <div className={`absolute inset-0 bg-linear-to-br ${brand.iconBg.replace('border-', '')} blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative z-10">
                            {providerInfo.icon}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                            {providerInfo.name}
                            <Tooltip content={`Use your personal ${providerInfo.name} API key. Your key is encrypted before being stored.`}>
                                <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help transition-colors" />
                            </Tooltip>
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">{providerInfo.desc}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={`whitespace-nowrap px-1.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all duration-300 ${config.hasKey ? brand.badge : "bg-white/5 border-white/10 text-slate-400"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.hasKey ? brand.text.replace('text-', 'bg-') : "bg-slate-500"}`} />
                        {config.hasKey ? "API Key Configured" : "No API Key Configured"}
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">API Key</label>
                    <div className="relative flex items-center">
                        <input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setValidationError(null);
                            }}
                            placeholder="Enter API Key"
                            autoComplete="off"
                            className={`w-full bg-white/2 backdrop-blur-sm border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-300 font-mono placeholder:font-sans pr-10 ${validationError
                                ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/40'
                                : `border-white/10 ${brand.focus}`
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {validationError && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> {validationError}
                        </p>
                    )}
                </div>

                {/* Model */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Model</label>
                    <div className="relative group/select">
                        <select
                            value={localConfig.model}
                            onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                            className={`w-full bg-white/2 backdrop-blur-sm border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer ${brand.focus}`}
                        >
                            {providerInfo.defaultModels.map(m => (
                                <option key={m} value={m} className="bg-neutral-950 text-slate-200">{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover/select:text-slate-200 transition-colors" />
                    </div>
                </div>

            </div>

            {/* Actions Stack */}
            <div className="mt-8 flex flex-col gap-2.5 w-full">
                {/* Primary Action: Save */}
                <motion.button
                    whileHover={{ scale: (saving || (!isDirty && config.hasKey)) ? 1 : 1.01 }}
                    whileTap={{ scale: (saving || (!isDirty && config.hasKey)) ? 1 : 0.99 }}
                    onClick={handleSave}
                    disabled={saving || (!isDirty && config.hasKey)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isDirty || !config.hasKey
                        ? `${brand.bg} text-white shadow-md ${brand.glow}`
                        : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                        } disabled:opacity-50`}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Settings</span>
                </motion.button>

                {/* Secondary Actions Row */}
                <div className="flex gap-2 w-full">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleTestConnection}
                        disabled={testing || (!apiKey && !config.hasKey)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" /> : <Activity className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Test Connection</span>
                    </motion.button>

                    {config.hasKey && (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleDelete}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span>Delete Key</span>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
                <div className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${testResult.status === 'success' ? 'bg-green-950/40 text-green-400' : 'bg-red-950/40 text-red-400'}`}>
                    {testResult.status === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                    <span>{testResult.message}</span>
                </div>
            )}
        </motion.div>
    );
}

// -------------------------------------------------------------
// UI Utilities
// -------------------------------------------------------------
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded-xl border border-white/10 ${className}`} />;
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-neutral-800 text-white text-xs rounded shadow-lg z-10 text-center pointer-events-none"
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

