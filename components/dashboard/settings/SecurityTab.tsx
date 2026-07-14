"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function SecurityTab() {
  return (
    <motion.div
      key="security"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full text-center py-12"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-500">
        <Shield size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">Security Settings</h3>
      <p className="text-sm text-slate-500 max-w-xs mt-2">Advanced security features like 2FA, API keys, and session management are coming soon.</p>
    </motion.div>
  );
}
