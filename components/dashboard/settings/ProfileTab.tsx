"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Camera, Loader2 } from "lucide-react";

interface ProfileTabProps {
  userName: string;
  userEmail: string;
  userAvatar: string;
  onUpdateUser?: (data: { name?: string; email?: string; avatar?: string }) => void;
  showToast: (type: "success" | "error", msg: string) => void;
}

export default function ProfileTab({ userName, userEmail, userAvatar, onUpdateUser, showToast }: ProfileTabProps) {
  const [profileName, setProfileName] = useState(userName);
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [avatarPreview, setAvatarPreview] = useState(userAvatar);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setProfileName(userName); setProfileEmail(userEmail); }, [userName, userEmail]);
  useEffect(() => { setAvatarPreview(userAvatar); }, [userAvatar]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("error", "Image size must be less than 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) { showToast("error", "Name and email are required"); return; }
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ name: profileName.trim(), email: profileEmail.trim(), avatar: avatarPreview })
      });
      const data = await response.json();
      if (data.success) {
        showToast("success", "Profile updated successfully!");
        onUpdateUser?.({ name: data.user.name, email: data.user.email, avatar: data.user.avatar });
      } else { showToast("error", data.message || "Failed to update profile"); }
    } catch (err) { console.error(err); showToast("error", "An error occurred while updating profile"); }
    finally { setIsSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { showToast("error", "Please fill in all password fields"); return; }
    if (newPassword !== confirmPassword) { showToast("error", "New passwords do not match"); return; }
    if (newPassword.length < 6) { showToast("error", "New password must be at least 6 characters"); return; }
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (data.success) { showToast("success", "Password changed successfully!"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
      else { showToast("error", data.message || "Failed to change password"); }
    } catch (err) { console.error(err); showToast("error", "An error occurred while changing password"); }
    finally { setIsChangingPassword(false); }
  };

  return (
    <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-6">Profile Information</h3>
        <div className="flex items-center gap-4 md:gap-8 mb-6 md:mb-8">
          <div onClick={handleUploadClick} className="relative group cursor-pointer shrink-0">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-linear-to-br from-cyan-500/20 to-purple-600/20 border-2 border-dashed border-white/10 flex items-center justify-center text-slate-400 group-hover:border-cyan-500/40 transition-all overflow-hidden">
              {avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" /> : <User size={24} />}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-3xl">
              <Camera size={16} className="text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-sm md:text-base">Profile Photo</h4>
            <p className="text-xs text-slate-500 mt-1 mb-2 md:mb-3">JPG, GIF or PNG. Max 2MB.</p>
            <button onClick={handleUploadClick} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">Upload New Photo</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-end">
        <button onClick={handleSaveProfile} disabled={isSavingProfile} className="shimmer-btn px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm cursor-pointer disabled:opacity-55 flex items-center gap-2">
          {isSavingProfile && <Loader2 size={14} className="animate-spin" />}
          Save Changes
        </button>
      </div>

      <div className="pt-8 border-t border-white/5 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Password & Security</h3>
          <p className="text-xs text-slate-500">Update your password directly, or request a reset link if you've forgotten it.</p>
        </div>
        <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
              <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/30 transition-all" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-white/10 text-slate-200 font-bold text-sm cursor-pointer hover:border-cyan-500/30 transition-all disabled:opacity-55 flex items-center justify-center gap-2">
              {isChangingPassword && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass p-4 md:p-6 rounded-2xl border border-white/5">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Forgot Current Password?</h4>
            <p className="text-xs text-slate-500 mt-1">Proceed to the secure password reset page to recover and change your credentials via email.</p>
          </div>
          <a href="/auth/forgot-password" className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold text-sm hover:bg-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 shrink-0">
            Send Reset Link
          </a>
        </div>
      </div>
    </motion.div>
  );
}
