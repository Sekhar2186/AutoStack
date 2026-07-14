"use client";

import { Shield } from "lucide-react";

export default function SecurityTab() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-500">
        <Shield size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest">Security Settings</h3>
      <p className="text-sm text-slate-500 max-w-xs mt-2">Advanced security features like 2FA, API keys, and session management are coming soon.</p>
    </div>
  );
}

