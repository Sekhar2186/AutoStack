"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CreditCard, Check, Shield, Star, Building2, Zap,
  User, Mail, Lock, Sparkles
} from "lucide-react";

const planDetails: Record<string, any> = {
  pro: {
    name: "Pro",
    icon: Star,
    iconColor: "text-cyan-400",
    monthlyPrice: 29,
    yearlyPrice: 15,
    features: [
      "Unlimited AI generations",
      "Gemini 1.5 Pro + GPT-4o",
      "Claude Sonnet access",
      "GitHub sync & push",
      "Version history (30 days)",
      "Priority support",
      "5 active projects",
      "Custom domain preview",
    ],
  },
  enterprise: {
    name: "Enterprise",
    icon: Building2,
    iconColor: "text-purple-400",
    monthlyPrice: 99,
    yearlyPrice: 25,
    features: [
      "Everything in Pro",
      "All AI models incl. Claude Opus",
      "Unlimited projects",
      "Team collaboration",
      "Live multiplayer editing",
      "SSO / SAML auth",
      "Custom AI fine-tuning",
      "Dedicated support SLA",
      "On-premise deployment",
    ],
  },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan") || "pro";
  const billing = searchParams.get("billing") || "monthly";

  const plan = planDetails[planId] || planDetails.pro;
  const isYearly = billing === "yearly";
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const total = isYearly ? price * 12 : price;
  const Icon = plan.icon;

  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    // Call upgrade API
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planId,
          duration: isYearly ? 12 : 1,
        }),
      });
    } catch (e) {
      console.error("Upgrade API error:", e);
    }

    setLoading(false);
    setStep("success");
  };

  // ─── SUCCESS SCREEN ──────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            <Check size={40} className="text-white" />
          </motion.div>

          <h1 className="text-3xl font-extrabold text-white">Payment Successful!</h1>
          <p className="text-slate-400">
            Welcome to <span className="text-cyan-400 font-bold">AutoStack {plan.name}</span>! Your account has been upgraded.
          </p>

          <div className="glass rounded-2xl border border-white/10 p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Plan</span>
              <span className="text-white font-bold">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Billing</span>
              <span className="text-white">{isYearly ? "Yearly" : "Monthly"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount Paid</span>
              <span className="text-cyan-400 font-bold">${total}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 rounded-2xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02] transition-all"
          >
            <Sparkles size={18} /> Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/#pricing"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 mb-8 text-sm transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Pricing
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT — Form */}
          <div className="lg:col-span-3 space-y-6">
            <h1 className="text-3xl font-extrabold">
              Upgrade to <span className="gradient-text">{plan.name}</span>
            </h1>

            {/* Step Indicator */}
            <div className="flex items-center gap-3 text-sm">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${step === "details" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "text-slate-500"}`}>
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold">1</span>
                Your Details
              </div>
              <div className="w-6 h-px bg-slate-700" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${step === "payment" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "text-slate-500"}`}>
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold">2</span>
                Payment
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "details" && (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleProceedToPayment}
                  className="glass rounded-2xl border border-white/10 p-8 space-y-5"
                >
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <User size={18} className="text-cyan-400" /> Account Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@company.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Company (Optional)</label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Acme Inc."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  >
                    Proceed to Payment <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </motion.form>
              )}

              {step === "payment" && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePay}
                  className="glass rounded-2xl border border-white/10 p-8 space-y-5"
                >
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <CreditCard size={18} className="text-cyan-400" /> Payment Information
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                    <input
                      required
                      value={form.cardNumber}
                      onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-all font-mono tracking-widest"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expiry</label>
                      <input
                        required
                        value={form.expiry}
                        onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                        placeholder="MM / YY"
                        maxLength={7}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CVV</label>
                      <input
                        required
                        type="password"
                        value={form.cvv}
                        onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Shield size={14} className="text-green-400" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="px-6 py-4 rounded-xl glass border border-white/10 text-slate-300 font-medium hover:border-white/20 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard size={18} /> Pay ${total}{isYearly ? "/yr" : "/mo"}
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl border border-white/10 p-6 sticky top-8 space-y-6">
              <h2 className="text-lg font-bold">Order Summary</h2>

              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                  <Icon size={20} className={plan.iconColor} />
                </div>
                <div>
                  <p className="font-bold">AutoStack {plan.name}</p>
                  <p className="text-xs text-slate-500">{isYearly ? "Annual" : "Monthly"} subscription</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Plan price</span>
                  <span className="text-white">${price}/mo</span>
                </div>
                {isYearly && (
                  <div className="flex justify-between text-slate-400">
                    <span>Billed annually</span>
                    <span className="text-white">${price} × 12</span>
                  </div>
                )}
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="gradient-text">${total}{isYearly ? "/yr" : "/mo"}</span>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">What you get</p>
                <div className="space-y-2">
                  {plan.features.slice(0, 5).map((f: string) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={13} className="text-cyan-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.features.length > 5 && (
                    <p className="text-xs text-slate-500">+ {plan.features.length - 5} more features</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <CheckoutContent />
    </Suspense>
  );
}
