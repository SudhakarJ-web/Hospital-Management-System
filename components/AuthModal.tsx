"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: "admin" | "doctor" | "support" | "medical";
}

export default function AuthModal({ isOpen, onClose, initialRole = "doctor" }: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Route to corresponding dashboard
    router.push(`/dashboard/${selectedRole}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 my-auto overflow-hidden border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 text-xl shadow-inner">
            🛡️
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Hospital Management System
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Gavane Hospital Role-Based Gateway
          </p>
        </div>

        {/* 4 Role Selector Tabs (2x2 on Mobile, 4x1 on Tablets/Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {[
            { id: "admin", label: "Admin", icon: "🔑" },
            { id: "doctor", label: "Doctor", icon: "🩺" },
            { id: "support", label: "Support", icon: "👥" },
            { id: "medical", label: "Medical", icon: "💊" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRole(tab.id as any)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                selectedRole === tab.id
                  ? "border-teal-500 bg-teal-50/70 text-teal-800 shadow-sm ring-1 ring-teal-500"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black tracking-wider text-slate-700 uppercase mb-1.5">
              Registered {selectedRole} Email or ID
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${selectedRole}@gavanehospital.in`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black tracking-wider text-slate-700 uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase text-white bg-[#0b1b2b] hover:bg-[#122b45] active:scale-[0.99] transition-all shadow-md mt-2 cursor-pointer"
          >
            {loading ? "Authenticating..." : `Authenticate ${selectedRole} Access`}
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-5">
          Authorized personnel only • Secure routing to assigned role console.
        </p>
      </div>
    </div>
  );
}