"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, ChevronLeft, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState(""); // dev only

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl); // dev mode only
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#020617] text-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      <Link
        href="/auth"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium z-20"
      >
        <ChevronLeft size={16} />
        Back to Sign In
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight gradient-text">AutoStack</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Forgot Password?</h1>
          <p className="text-slate-500 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="glass rounded-3xl border border-white/10 p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/30 focus:bg-white/7 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="shimmer-btn w-full py-4 rounded-2xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">Check Your Email</h3>
                <p className="text-sm text-slate-500">
                  If <span className="text-cyan-400 font-medium">{email}</span> exists in our system, you&apos;ll receive a reset link shortly.
                </p>
              </div>

              {/* Dev mode: show clickable reset link */}
              {resetUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left"
                >
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                    🛠 Dev Mode — Reset Link
                  </p>
                  <a
                    href={resetUrl}
                    className="text-xs text-cyan-400 hover:text-cyan-300 break-all underline underline-offset-2 transition-colors"
                  >
                    {resetUrl}
                  </a>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Configure SMTP in .env.local to send real emails in production.
                  </p>
                </motion.div>
              )}

              <Link
                href="/auth"
                className="inline-block mt-4 text-sm text-slate-500 hover:text-cyan-400 transition-colors"
              >
                ← Back to Sign In
              </Link>
            </motion.div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
            Remembered your password? Sign in
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
