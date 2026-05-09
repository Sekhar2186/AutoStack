"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, GitBranch, Globe, ChevronLeft, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    setIsLogin(mode !== "signup");
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signUp";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (isLogin) {
          localStorage.setItem("token", data.token);
          router.push("/dashboard");
        } else {
          // After signup, switch to login
          setIsLogin(true);
          setError("");
          alert("Account created successfully! Please sign in.");
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    setLoading(true);
    // Simulate social auth
    setTimeout(() => {
      localStorage.setItem("token", `mock_${provider}_token_${Date.now()}`);
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <main className="min-h-screen w-full bg-[#020617] text-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      {/* Back to Home */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium z-20"
      >
        <ChevronLeft size={16} />
        Back to Home
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
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-500">
            {isLogin ? "Enter your credentials to access your workspace" : "Join 10,000+ developers building with AI"}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/30 focus:bg-white/7 transition-all"
                  />
                </div>
              </motion.div>
            )}

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
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/30 focus:bg-white/7 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/30 focus:bg-white/7 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="shimmer-btn w-full py-4 rounded-2xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-100 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Get Started"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 bg-[#020617] text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleSocialAuth("github")}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all text-sm font-medium text-slate-300 disabled:opacity-50"
            >
              <GitBranch size={18} />
              GitHub
            </button>
            <button 
              type="button"
              onClick={() => handleSocialAuth("google")}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all text-sm font-medium text-slate-300 disabled:opacity-50"
            >
              <Globe size={18} />
              Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-cyan-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <AuthContent />
    </Suspense>
  );
}
