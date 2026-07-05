"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
  duration?: number;
}

export default function Toast({ show, message, onClose, type = "success", duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl glass border border-white/10 shadow-2xl bg-[#0f172a]"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === "success" ? "bg-emerald-500/20 text-emerald-400" : type === "error" ? "bg-rose-500/20 text-rose-400" : "bg-cyan-500/20 text-cyan-400"}`}>
            {type === "success" ? <Check size={16} /> : <X size={16} />}
          </div>
          <p className="text-sm font-semibold text-slate-100">{message}</p>
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
