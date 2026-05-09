"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass border-b border-white/6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_24px_rgba(34,211,238,0.6)] transition-shadow duration-300">
              <Zap size={15} className="text-white fill-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight gradient-text">AutoStack</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors duration-200 font-medium"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="shimmer-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                Go to Dashboard
                <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth?mode=login"
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  id="navbar-cta"
                  className="shimmer-btn flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white hover:scale-105 active:scale-100 transition-transform duration-200 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                >
                  Get Started Free
                  <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-xl glass"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-white/6 px-6 py-5 flex flex-col gap-4"
          >
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-slate-300 hover:text-white py-1.5 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="shimmer-btn mt-1 text-sm font-semibold px-5 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white text-center"
                onClick={() => setMobileOpen(false)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth?mode=signup"
                className="shimmer-btn mt-1 text-sm font-semibold px-5 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get Started Free
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
