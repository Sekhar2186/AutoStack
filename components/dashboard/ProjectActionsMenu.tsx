"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical, ExternalLink, Edit2, Copy, Sparkles, History,
  FileText, Download, CloudRain, Share2, Trash2, X, LucideIcon
} from "lucide-react";

/* ─────────────────────────── Types ──────────────────────────── */
type ActionStatus = "active" | "coming-soon" | "disabled";

interface ActionConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  status: ActionStatus;
  variant?: "default" | "danger";
  handler?: () => void;
}

interface ActionSection {
  id: string;
  items: ActionConfig[];
}

interface ProjectActionsMenuProps {
  projectId: string;
  projectName: string;
  version?: string;
  onOpenProject: () => void;
  onDeleteSuccess: () => void;
}

/* ─────────────── Coming Soon Badge ──────────────── */
function ComingSoonBadge() {
  return (
    <span
      title="This feature will be available in an upcoming update."
      className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0"
    >
      Soon
    </span>
  );
}

/* ─────────────── Single Action Row ──────────────── */
function ActionRow({ action }: { action: ActionConfig }) {
  const isDisabled = action.status !== "active";
  const isDanger = action.variant === "danger";

  return (
    <button
      key={action.id}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDisabled && action.handler) action.handler();
      }}
      disabled={isDisabled}
      className={`
        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isDanger
          ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <action.icon size={16} />
        <span className="font-medium">{action.label}</span>
      </div>
      {action.status === "coming-soon" && <ComingSoonBadge />}
    </button>
  );
}

/* ─────────────── Main Component ──────────────── */
export default function ProjectActionsMenu({
  projectId,
  projectName,
  version = "v1",
  onOpenProject,
  onDeleteSuccess,
}: ProjectActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /* ── Close on Escape ── */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  /* ── Handlers ── */
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setShowDeleteConfirm(false);
        setIsOpen(false);
        onDeleteSuccess();
      } else {
        alert(`Delete failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the project.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const res = await fetch(`/api/download?projectId=${projectId}&version=${version}`);
      if (!res.ok) throw new Error(await res.text() || "Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${projectId}_${version}.zip`,
      });
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    }
  };

  /* ── Data-driven action config ──
   * To enable a future action: change status from "coming-soon" → "active"
   * and add its handler. No other code changes required.
   */
  const sections: ActionSection[] = [
    {
      id: "primary",
      items: [
        {
          id: "open",
          icon: ExternalLink,
          label: "Open Project",
          status: "active",
          handler: () => { onOpenProject(); setIsOpen(false); },
        },
        {
          id: "rename",
          icon: Edit2,
          label: "Rename",
          status: "coming-soon",
        },
        {
          id: "duplicate",
          icon: Copy,
          label: "Duplicate",
          status: "coming-soon",
        },
      ],
    },
    {
      id: "ai",
      items: [
        {
          id: "update-ai",
          icon: Sparkles,
          label: "Update with AI",
          status: "coming-soon",
        },
        {
          id: "version-history",
          icon: History,
          label: "Version History",
          status: "coming-soon",
        },
        {
          id: "generate-docs",
          icon: FileText,
          label: "Generate Documentation",
          status: "coming-soon",
        },
      ],
    },
    {
      id: "distribution",
      items: [
        {
          id: "download",
          icon: Download,
          label: "Download ZIP",
          status: "active",
          handler: () => { handleDownloadZip(); setIsOpen(false); },
        },
        {
          id: "deploy",
          icon: CloudRain,
          label: "Deploy",
          status: "coming-soon",
        },
        {
          id: "share",
          icon: Share2,
          label: "Share",
          status: "coming-soon",
        },
      ],
    },
    {
      id: "danger",
      items: [
        {
          id: "delete",
          icon: Trash2,
          label: "Delete Project",
          status: "active",
          variant: "danger",
          handler: () => setShowDeleteConfirm(true),
        },
      ],
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Three-dot trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        aria-label="Project actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
      >
        <MoreVertical size={18} />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && !showDeleteConfirm && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 origin-top-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 flex flex-col">
              {sections.map((section, sectionIdx) => (
                <div key={section.id}>
                  {sectionIdx > 0 && (
                    <div className="h-px bg-white/10 my-1 mx-2" />
                  )}
                  {section.items.map((action) => (
                    <ActionRow key={action.id} action={action} />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); setIsOpen(false); }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-black rounded-3xl border border-white/10 shadow-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Close dialog"
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); setIsOpen(false); }}
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-5">
                <Trash2 size={24} />
              </div>

              <h3 id="delete-dialog-title" className="text-xl font-bold text-white mb-2">
                Delete Project?
              </h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                This action cannot be undone.
                <br />
                Project: <span className="text-slate-200 font-semibold">{projectName}</span>
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); setIsOpen(false); }}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
