"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, Mail, Stethoscope, Users, Pill, KeyRound, AlertCircle, Key 
} from "lucide-react";
import { getSharedDoctors, setCurrentDoctorSession, generateDoctorSlug, SharedDoctor } from "@/lib/sync/doctorsSync";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RoleType = "Admin" | "Doctor" | "Support" | "Medical";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeRole, setActiveRole] = useState<RoleType>("Doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<SharedDoctor[]>([]);

  useEffect(() => {
    async function loadDocs() {
      const docs = await getSharedDoctors();
      const activeDocs = docs.filter((d) => d.status === "Active");
      setAvailableDoctors(activeDocs);
      if (activeDocs.length > 0 && !email) {
        setEmail(activeDocs[0].email);
        setPassword(activeDocs[0].password || "password123");
      }
    }
    if (isOpen) {
      loadDocs();
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleRoleSelect = (role: RoleType) => {
    setActiveRole(role);
    setErrorMsg(null);
    if (role === "Admin") {
      setEmail("admin@gavanehospital.in");
      setPassword("password123");
    } else if (role === "Doctor") {
      const first = availableDoctors[0];
      setEmail(first?.email || "sudhir@gavanehospital.in");
      setPassword(first?.password || "Password@123");
    } else if (role === "Support") {
      setEmail("support@gavanehospital.in");
      setPassword("password123");
    } else if (role === "Medical") {
      setEmail("medical@gavanehospital.in");
      setPassword("password123");
    }
  };

  const handleSelectDoctorPreset = (doc: SharedDoctor) => {
    setEmail(doc.email);
    setPassword(doc.password || "password123");
    setErrorMsg(null);
  };

  const executeLogin = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter an email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    try {
      if (activeRole === "Doctor") {
        const doctors = await getSharedDoctors();
        const matchedDoctor = doctors.find(
          (d) => d.email.trim().toLowerCase() === inputEmail
        );

        if (!matchedDoctor) {
          setErrorMsg("No doctor profile registered with this email address.");
          setLoading(false);
          return;
        }

        const validPassword = matchedDoctor.password || "password123";
        if (inputPass !== validPassword) {
          setErrorMsg("Incorrect password. Please verify your credentials.");
          setLoading(false);
          return;
        }

        // 1. Lock doctor session
        setCurrentDoctorSession(matchedDoctor);
        onClose();

        // 2. Resolve destination slug
        const targetSlug = matchedDoctor.slug || generateDoctorSlug(matchedDoctor.name);
        
        // 3. Direct window relocation to explicit doctor route
        window.location.replace(`/dashboard/${targetSlug}`);
        return;
      }

      if (activeRole === "Admin") {
        if (inputEmail === "admin@gavanehospital.in" && inputPass === "password123") {
          onClose();
          window.location.replace("/dashboard/admin");
          return;
        } else {
          setErrorMsg("Invalid Admin credentials.");
          setLoading(false);
          return;
        }
      }

      if (activeRole === "Support") {
        if (inputEmail.includes("support") && inputPass === "password123") {
          onClose();
          window.location.replace("/dashboard/support");
          return;
        } else {
          setErrorMsg("Invalid Support Staff credentials.");
          setLoading(false);
          return;
        }
      }

      if (activeRole === "Medical") {
        if (inputEmail.includes("medical") && inputPass === "password123") {
          onClose();
          window.location.replace("/dashboard/medical");
          return;
        } else {
          setErrorMsg("Invalid Pharmacy / Medical Officer credentials.");
          setLoading(false);
          return;
        }
      }
    } catch {
      setErrorMsg("Authentication service temporarily unavailable. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-5 text-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl border border-teal-200 flex items-center justify-center mx-auto shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Staff Access Gateway
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Gavane Hospital Enterprise Network
            </p>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-[11px] font-bold">
          {[
            { id: "Admin", label: "Admin", icon: Key },
            { id: "Doctor", label: "Doctor", icon: Stethoscope },
            { id: "Support", label: "Support", icon: Users },
            { id: "Medical", label: "Medical", icon: Pill },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRoleSelect(tab.id as RoleType)}
                className={`py-2 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-teal-800 shadow-sm border border-slate-200/60 font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-teal-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Pick Buttons for Registered Doctors */}
        {activeRole === "Doctor" && availableDoctors.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-600 uppercase">
              Select Physician Account:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {availableDoctors.map((d) => {
                const isCurrent = email.toLowerCase() === d.email.toLowerCase();
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectDoctorPreset(d)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      isCurrent
                        ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="truncate">{d.name.replace(/^dr\.?\s*/i, "")}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container with Enter Key Prevention */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Registered {activeRole} Email / Username *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    executeLogin();
                  }
                }}
                placeholder={`Enter your ${activeRole.toLowerCase()} email...`}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Portal Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    executeLogin();
                  }
                }}
                placeholder="Enter password..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={executeLogin}
              className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? "Authenticating..." : `Authenticate ${activeRole} Access`}
            </button>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            Gavane Hospital EHR • DPDP Act 2023 Encrypted Node
          </p>
        </div>
      </div>
    </div>
  );
}