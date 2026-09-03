"use client";

import React, { useState } from "react";
import { 
  getSharedDoctors, 
  setCurrentDoctorSession, 
  generateDoctorSlug 
} from "@/lib/sync/doctorsSync";

type AppRole = "admin" | "doctor" | "support" | "medical" | "patient";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<AppRole>("doctor");
  const [email, setEmail] = useState("sudhir@gavanehospital.in");
  const [password, setPassword] = useState("Password@123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleTabClick = (role: AppRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === "admin") {
      setEmail("admin@gavanehospital.in");
      setPassword("password123");
    } else if (role === "doctor") {
      setEmail("sudhir@gavanehospital.in");
      setPassword("Password@123");
    } else if (role === "support") {
      setEmail("support@gavanehospital.in");
      setPassword("password123");
    } else if (role === "medical") {
      setEmail("medical@gavanehospital.in");
      setPassword("password123");
    } else if (role === "patient") {
      setEmail("patient@gavanehospital.in");
      setPassword("Patient@2026");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    try {
      if (selectedRole === "doctor") {
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

        setCurrentDoctorSession(matchedDoctor);
        const targetSlug = matchedDoctor.slug || generateDoctorSlug(matchedDoctor.name);
        window.location.href = `/dashboard/${targetSlug}`;
        return;
      }

      if (selectedRole === "admin") {
        if (inputEmail === "admin@gavanehospital.in" && inputPass === "password123") {
          window.location.href = "/dashboard/admin";
          return;
        }
        setErrorMsg("Invalid Admin credentials.");
        setLoading(false);
        return;
      }

      if (selectedRole === "support") {
        if (inputEmail.includes("support") && inputPass === "password123") {
          window.location.href = "/dashboard/support";
          return;
        }
        setErrorMsg("Invalid Support Staff credentials.");
        setLoading(false);
        return;
      }

      if (selectedRole === "medical") {
        if (inputEmail.includes("medical") && inputPass === "password123") {
          window.location.href = "/dashboard/medical";
          return;
        }
        setErrorMsg("Invalid Pharmacy / Medical credentials.");
        setLoading(false);
        return;
      }

      if (selectedRole === "patient") {
        window.location.href = "/dashboard/patient";
        return;
      }
    } catch {
      setErrorMsg("Authentication error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl border border-teal-200 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
            🩺
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">Gavane Hospital & Research Centre</p>
        </div>

        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          {(["admin", "doctor", "support", "medical", "patient"] as AppRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleTabClick(r)}
              className={`py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                selectedRole === r ? "bg-white text-teal-800 shadow-xs font-black" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Registered {selectedRole} Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
          >
            {loading ? "Verifying..." : `Login as ${selectedRole}`}
          </button>
        </form>
      </div>
    </div>
  );
}