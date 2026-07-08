"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "What AI models does AutoStack support?",
    answer:
      "AutoStack integrates with the leading frontier models — Gemini 1.5 Flash (free tier), Gemini 1.5 Pro, GPT-4o, Claude Sonnet, and Claude Opus (Enterprise). We continuously add new models as they become available so you always have access to the best AI for your stack.",
  },
  {
    id: "faq-2",
    question: "Is there a free plan? What are its limits?",
    answer:
      "Yes! Our Starter plan is permanently free. You get 20 AI generations per month, access to Gemini 1.5 Flash, a live preview sandbox, and basic ZIP export. No credit card required — just sign up and start building instantly.",
  },
  {
    id: "faq-3",
    question: "Can I cancel or downgrade my plan at any time?",
    answer:
      "Absolutely. You can cancel or downgrade your subscription from your account settings at any time with no penalty. If you cancel, you retain access to paid features until the end of your current billing period.",
  },
];

export default function Questions() {
  return (
    <section id="faq" className="relative py-28 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full bg-cyan-500/4 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-slate-400 mb-5">
            🙋 Frequently Asked Questions
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50 mb-4">
            Got questions?{" "}
            <span className="gradient-text">We have answers.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Quick answers to the most common questions about AutoStack.
          </p>
        </motion.div>

        {/* 3 Accordion items */}
        <Accordion className="w-full flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
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

        {/* See more questions → redirect to /faq */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Link
            href="/faq"
            id="see-more-faq"
            className="group shimmer-btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full glass border border-white/10 text-sm font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-all duration-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.14)] active:scale-[0.97]"
          >
            See all frequently asked questions
            <ArrowRight
              size={15}
              className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200"
            />
          </Link>
          <p className="text-slate-600 text-xs">
            Can't find your answer?{" "}
            <a
              href="mailto:support@autostack.dev"
              className="text-cyan-500 hover:text-cyan-400 underline underline-offset-2 transition-colors"
            >
              Contact support
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
