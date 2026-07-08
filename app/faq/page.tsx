"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const categories = [
  {
    label: "Plans & Billing",
    emoji: "💳",
    faqs: [
      {
        id: "b-1",
        question: "Is there a free plan? What are its limits?",
        answer:
          "Yes! Our Starter plan is permanently free. You get 20 AI generations per month, access to Gemini 1.5 Flash, a live preview sandbox, and basic ZIP export. No credit card required — just sign up and start building instantly.",
      },
      {
        id: "b-2",
        question: "Do you offer discounts for annual billing?",
        answer:
          "Yes! Switching to yearly billing saves you up to 75% compared to monthly pricing. The exact savings depend on the plan: Pro saves 50% and Enterprise saves 75%. Toggle the billing switch on the Pricing section to see the discounted rates.",
      },
      {
        id: "b-3",
        question: "Can I cancel or downgrade my plan at any time?",
        answer:
          "Absolutely. You can cancel or downgrade your subscription from your account settings at any time with no penalty. If you cancel, you retain access to paid features until the end of your current billing period.",
      },
      {
        id: "b-4",
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for Enterprise contracts. All payments are processed securely via Stripe.",
      },
      {
        id: "b-5",
        question: "What is the 14-day free trial for paid plans?",
        answer:
          "Every paid plan comes with a 14-day free trial — no credit card needed to start. During the trial you get full access to every feature of the plan you chose. We'll remind you before the trial ends so there are no surprises.",
      },
    ],
  },
  {
    label: "AI Models & Features",
    emoji: "🤖",
    faqs: [
      {
        id: "m-1",
        question: "What AI models does AutoStack support?",
        answer:
          "AutoStack integrates with the leading frontier models — Gemini 1.5 Flash (free tier), Gemini 1.5 Pro, GPT-4o, Claude Sonnet, and Claude Opus (Enterprise). We continuously add new models as they become available.",
      },
      {
        id: "m-2",
        question: "How many AI generations do I get per month?",
        answer:
          "The Starter plan includes 20 generations per month. Pro and Enterprise plans include unlimited generations. Each generation produces a complete, runnable component or page depending on your prompt.",
      },
      {
        id: "m-3",
        question: "Can I customize the generated code?",
        answer:
          "Yes — all generated code is fully editable inside the AutoStack editor. You can modify, refactor, or extend it just like any normal codebase. The output is clean, human-readable code with no lock-in.",
      },
      {
        id: "m-4",
        question: "Does AutoStack support custom AI fine-tuning?",
        answer:
          "Custom AI fine-tuning is available on the Enterprise plan. You can train the model on your company's design system, coding standards, and component library so every generation feels native to your codebase.",
      },
    ],
  },
  {
    label: "Integrations & Collaboration",
    emoji: "🔗",
    faqs: [
      {
        id: "i-1",
        question: "How does GitHub sync work?",
        answer:
          "On the Pro and Enterprise plans, AutoStack connects directly to your GitHub account via OAuth. You can push generated code to any repository, create pull requests, and sync version history — all from inside the editor without leaving the platform.",
      },
      {
        id: "i-2",
        question: "Does AutoStack support team collaboration?",
        answer:
          "Real-time team collaboration, including live multiplayer editing, is available on the Enterprise plan. Pro users can share project previews and invite collaborators with view access. Role-based permissions and SSO/SAML are Enterprise features.",
      },
      {
        id: "i-3",
        question: "Can I export my projects?",
        answer:
          "Yes. All plans support ZIP export. Pro and Enterprise plans also support GitHub push, custom domain preview, and CI/CD pipeline integrations. Your code is always yours — no vendor lock-in.",
      },
      {
        id: "i-4",
        question: "What frameworks and tech stacks does AutoStack generate?",
        answer:
          "AutoStack primarily generates Next.js, React, and TypeScript projects with Tailwind CSS. We're actively expanding support to include Vue, Svelte, and plain HTML/CSS/JS. Framework preferences can be set in your project settings.",
      },
    ],
  },
  {
    label: "Security & Privacy",
    emoji: "🔐",
    faqs: [
      {
        id: "s-1",
        question: "Is my code and data secure?",
        answer:
          "Security is a first-class priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We do not use your code to train AI models. Enterprise customers can opt for on-premise deployment for maximum data sovereignty.",
      },
      {
        id: "s-2",
        question: "Does AutoStack use my code to train its AI models?",
        answer:
          "No. Your code and project data are never used to train our AI models. We take your intellectual property seriously. All data is isolated per account and never shared across tenants.",
      },
      {
        id: "s-3",
        question: "Is AutoStack SOC 2 compliant?",
        answer:
          "AutoStack is currently working toward SOC 2 Type II certification. Enterprise customers can request our latest security documentation and sign an NDA to review our security posture in detail.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-cyan-500/4 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/3 right-0 w-[500px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Link
            href="/#faq"
            className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors duration-200"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            Back to home
          </Link>
        </motion.div>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-slate-400 mb-5">
            🙋 Help Center
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50 mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Everything you need to know about AutoStack — plans, features,
            security, and more. Can't find your answer?{" "}
            <a
              href="mailto:support@autostack.dev"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              Contact our support team.
            </a>
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-col gap-14">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: ci * 0.08 }}
            >
              {/* Category heading */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{cat.emoji}</span>
                <h2 className="text-xl font-bold text-slate-100">
                  {cat.label}
                </h2>
                <div className="flex-1 h-px bg-white/6 ml-2" />
              </div>

              {/* Accordion */}
              <Accordion className="w-full flex flex-col gap-3">
                {cat.faqs.map((faq, i) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    <AccordionItem
                      value={faq.id}
                      className="glass border border-white/8 rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.06)] not-last:border-b-0"
                    >
                      <AccordionTrigger
                        id={faq.id}
                        className="px-6 py-5 text-slate-100 text-sm font-semibold hover:no-underline hover:text-cyan-300 transition-colors duration-200"
                      >
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5">
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 glass border border-white/8 rounded-2xl p-10 text-center"
        >
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Our support team is happy to help. We typically respond within a few
            hours on business days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:support@autostack.dev"
              id="faq-contact-support"
              className="shimmer-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-100 transition-transform duration-200"
            >
              Email Support
            </a>
            <Link
              href="/#pricing"
              id="faq-compare-plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-slate-200 text-sm font-semibold hover:border-cyan-500/30 hover:text-cyan-300 transition-all duration-300"
            >
              Compare Plans
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
