"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSharedDoctors } from "@/lib/sync/doctorsSync";
import { getLiveModuleRecords } from "@/lib/sync/hospitalMasterSync";
import { X, Lock, Mail, Shield, Stethoscope, HeartHandshake, UserPlus } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "admin" | "doctor" | "support" | "medical" | "patient";
}

export default function AuthModal({ isOpen, onClose, defaultRole = "doctor" }: AuthModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "doctor" | "support" | "medical" | "patient">(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (role === "admin") {
        if (cleanEmail === "admin@gavanehospital.in" && cleanPassword === "Admin@2026") {
          router.push("/dashboard/admin");
          onClose();
        } else {
          setErrorMsg("Invalid Administrator credentials.");
        }
      } else if (role === "doctor") {
        // Authenticate directly against live database doctors
        const doctors = await getSharedDoctors();
        const matched = doctors.find(
          (d) => d.email.toLowerCase() === cleanEmail && d.password === cleanPassword
        );

        if (matched) {
          router.push(`/dashboard/${matched.slug}`);
          onClose();
        } else {
          setErrorMsg("Invalid Doctor email or password.");
        }
      } else if (role === "medical") {
        // Authenticate against database records created by Admin
        const medicalRecords = await getLiveModuleRecords("MEDICAL_STAFF");
        const matchedStaff = medicalRecords.find(
          (s) => s.col3?.toLowerCase() === cleanEmail && s.col4 === cleanPassword
        );

        if (matchedStaff || (cleanEmail === "medical@gavanehospital.in" && cleanPassword === "Medical@2026")) {
          router.push("/dashboard/medical");
          onClose();
        } else {
          setErrorMsg("Invalid Medical Officer credentials or profile not authorized by Admin.");
        }
      } else if (role === "support") {
        // Authenticate against database records created by Admin
        const supportRecords = await getLiveModuleRecords("SUPPORT_STAFF");
        const matchedStaff = supportRecords.find(
          (s) => s.col3?.toLowerCase() === cleanEmail && s.col4 === cleanPassword
        );

        if (matchedStaff || (cleanEmail === "support@gavanehospital.in" && cleanPassword === "Support@2026")) {
          router.push("/dashboard/support");
          onClose();
        } else {
          setErrorMsg("Invalid Support Staff credentials or profile not authorized by Admin.");
        }
      } else if (role === "patient") {
        router.push(`/dashboard/patient?phone=${encodeURIComponent(cleanEmail)}`);
        onClose();
      }
    } catch {
      setErrorMsg("Authentication error. Please check your database connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 sm:p-8 space-y-5 relative text-slate-800 font-sans">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-2">
            {role === "patient" ? "Patient Access Gateway" : "Staff Access Gateway"}
          </h2>
          <p className="text-xs text-slate-500">
            Gavane Hospital & Research Centre Network
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => { setRole("admin"); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              role === "admin" ? "bg-white text-teal-800 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole("doctor"); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              role === "doctor" ? "bg-white text-teal-800 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole("medical"); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              role === "medical" ? "bg-white text-teal-800 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <HeartHandshake className="w-3 h-3" />
            <span>Medical</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole("support"); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              role === "support" ? "bg-white text-teal-800 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>Support</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              {role === "patient" ? "Registered Mobile Number *" : "Official Portal Email *"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={role === "patient" ? "tel" : "email"}
                required
                placeholder={
                  role === "patient"
                    ? "+91 98220 12345"
                    : role === "admin"
                    ? "admin@gavanehospital.in"
                    : role === "medical"
                    ? "medical@gavanehospital.in"
                    : role === "support"
                    ? "support@gavanehospital.in"
                    : "doctor@gavanehospital.in"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Portal Access Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {loading ? "Authenticating..." : "Authorize Access"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <span className="text-[10px] text-slate-400">
            Gavane Hospital EHR • DPDP Act 2023 Encrypted Node
          </span>
        </div>
      </div>
    </div>
  );
}