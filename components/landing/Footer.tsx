"use client";

import { Zap, GitBranch, Send, Globe, Heart } from "lucide-react";
import Link from "next/link";

const links = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Developers: ["Documentation", "API Reference", "Templates", "Examples"],
  Company: ["About", "Blog", "Careers", "Press Kit"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

const socials = [
  { icon: GitBranch, href: "#", label: "GitHub" },
  { icon: Send, href: "#", label: "Twitter" },
  { icon: Globe, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/6 pt-16 pb-8 overflow-hidden">
      {/* Ambient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-purple-600/4 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                <Zap size={15} className="text-white fill-white" />
              </div>
              <span className="font-bold text-[17px] gradient-text">AutoStack</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
              The AI-powered platform for building full-stack web applications from a single prompt.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl glass border border-white/7 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{cat}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            © 2025 AutoStack, Inc. Built with
            <Heart size={11} className="text-rose-500 fill-rose-500" />
            for developers worldwide.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
