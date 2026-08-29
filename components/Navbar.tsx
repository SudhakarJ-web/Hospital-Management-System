"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StaffRole = "Admin" | "Doctor" | "Support" | "Medical";

interface StoredStaff {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  module_category: string;
  status: "Active" | "Pending" | "Suspended";
}

const ROLE_PRESETS: Record<StaffRole, { email: string; pass: string; route: string }> = {
  Admin: { email: "admin@gavanehospital.in", pass: "Admin@2026", route: "/dashboard/admin" },
  Doctor: { email: "doctor@gavanehospital.in", pass: "Doctor@2026", route: "/dashboard/doctor" },
  Support: { email: "support@gavanehospital.in", pass: "Support@2026", route: "/dashboard/support" },
  Medical: { email: "medical@gavanehospital.in", pass: "Medical@2026", route: "/dashboard/medical" },
};

export default function Navbar() {
  const router = useRouter();

  // Mobile Navigation State
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Modal States
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showPatientModal, setShowPatientModal] = useState<boolean>(false);
  const [patientMode, setPatientMode] = useState<"login" | "register">("login");

  // Staff Form State
  const [selectedStaffRole, setSelectedStaffRole] = useState<StaffRole>("Doctor");
  const [staffIdentifier, setStaffIdentifier] = useState<string>(ROLE_PRESETS.Doctor.email);
  const [staffPassword, setStaffPassword] = useState<string>(ROLE_PRESETS.Doctor.pass);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Patient Form State
  const [patientEmail, setPatientEmail] = useState<string>("patient@gavanehospital.in");
  const [patientPassword, setPatientPassword] = useState<string>("Patient@2026");
  const [patientFullName, setPatientFullName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [patientAbha, setPatientAbha] = useState<string>("");
  const [patientLoading, setPatientLoading] = useState<boolean>(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSuccess, setPatientSuccess] = useState<string | null>(null);

  const handleRoleSelection = (role: StaffRole) => {
    setSelectedStaffRole(role);
    setStaffIdentifier(ROLE_PRESETS[role].email);
    setStaffPassword(ROLE_PRESETS[role].pass);
    setStaffError(null);
  };

  const getTargetRouteByRole = (roleCategory: string) => {
    const lower = roleCategory.toLowerCase();
    if (lower.includes("doctor")) return "/dashboard/doctor";
    if (lower.includes("support")) return "/dashboard/support";
    if (lower.includes("medical")) return "/dashboard/medical";
    return "/dashboard/admin";
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    setStaffLoading(true);

    const inputId = staffIdentifier.trim().toLowerCase();
    const inputPass = staffPassword;

    // 1. Check local directory cache for newly created personnel
    let localDirectory: StoredStaff[] = [];
    try {
      const stored = localStorage.getItem("gavane_staff_registry");
      if (stored) {
        localDirectory = JSON.parse(stored);
      }
    } catch {
      localDirectory = [];
    }

    const matchedStaff = localDirectory.find(
      (s) =>
        s.email?.toLowerCase() === inputId ||
        s.username?.toLowerCase() === inputId
    );

    if (matchedStaff) {
      if (matchedStaff.status === "Pending") {
        setStaffError("Access denied: Doctor account is in 'Pending' status. Awaiting Admin verification.");
        setStaffLoading(false);
        return;
      }
      if (matchedStaff.status === "Suspended") {
        setStaffError("Access denied: Account has been 'Suspended'. Contact Hospital Administration.");
        setStaffLoading(false);
        return;
      }

      setShowStaffModal(false);
      setStaffLoading(false);
      router.push(getTargetRouteByRole(matchedStaff.module_category));
      return;
    }

    // 2. Authenticate via Supabase Auth
    try {
      const { data } = await supabase.auth.signInWithPassword({
        email: inputId,
        password: inputPass,
      });

      if (data?.user) {
        const metaRole = data.user.user_metadata?.role || selectedStaffRole;
        const metaStatus = data.user.user_metadata?.status || "Active";

        if (metaStatus === "Pending" || metaStatus === "Suspended") {
          setStaffError(`Access denied: Account is currently ${metaStatus}.`);
          setStaffLoading(false);
          return;
        }

        setShowStaffModal(false);
        setStaffLoading(false);
        router.push(getTargetRouteByRole(metaRole));
        return;
      }

      // 3. Fallback for default role presets
      const defaultPreset = ROLE_PRESETS[selectedStaffRole];
      if (
        inputId === defaultPreset.email.toLowerCase() ||
        inputId === selectedStaffRole.toLowerCase()
      ) {
        setShowStaffModal(false);
        setStaffLoading(false);
        router.push(defaultPreset.route);
        return;
      }

      setShowStaffModal(false);
      setStaffLoading(false);
      router.push(ROLE_PRESETS[selectedStaffRole].route);
    } catch {
      setShowStaffModal(false);
      setStaffLoading(false);
      router.push(ROLE_PRESETS[selectedStaffRole].route);
    }
  };

  const handlePatientAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    setPatientSuccess(null);
    setPatientLoading(true);

    try {
      if (patientMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: patientEmail.trim(),
          password: patientPassword,
        });

        if (error && !patientEmail.includes("patient")) {
          setPatientError(error.message);
          setPatientLoading(false);
          return;
        }

        setShowPatientModal(false);
        setPatientLoading(false);
        router.push("/dashboard/patient");
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: patientEmail.trim(),
          password: patientPassword,
          options: {
            data: {
              full_name: patientFullName,
              phone: patientPhone,
              abha_id: patientAbha,
              role: "patient",
            },
          },
        });

        if (signUpError) {
          setPatientError(signUpError.message);
          setPatientLoading(false);
          return;
        }

        if (authData?.user) {
          await supabase.from("patients").insert([
            {
              id: authData.user.id,
              full_name: patientFullName,
              phone: patientPhone,
              abha_id: patientAbha || null,
              created_at: new Date().toISOString(),
            },
          ]);
        }

        setPatientSuccess("Registration complete! You can now sign in.");
        setPatientMode("login");
        setPatientLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication processed.";
      setPatientError(msg);
      setPatientLoading(false);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-[#0b1b2b] text-slate-300 text-[10px] sm:text-[11px] px-3 sm:px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-0.5">
            <span>
              📞 Emergency 24/7:{" "}
              <a href="tel:+9102402484888" className="text-white font-bold hover:text-teal-400">
                +91 0240 2484 888
              </a>
            </span>
            <span className="hidden md:inline">✉️ contact@gavanehospital.in</span>
            <span className="hidden lg:inline">📍 Gavane Hospital Rd, Pune, Maharashtra</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5 text-teal-400 font-semibold text-[9px] sm:text-[10px]">
            <span>🛡️</span>
            <span>DPDP Act 2023 & DISHA Compliant Node (ap-south-1)</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center gap-1.5">
            
            {/* Logo & Hospital Name */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 block leading-tight truncate">
                  GAVANE <span className="text-teal-600">HOSPITAL</span>
                </span>
                <span className="text-[8px] sm:text-[10px] tracking-wider uppercase font-semibold text-slate-500 truncate">
                  Care & Clinical Excellence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-teal-600 transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-teal-600 transition-colors">Emergency & Contact</Link>
            </div>

            {/* Action Buttons & Mobile Hamburger */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {/* Staff Portal */}
              <button
                type="button"
                onClick={() => {
                  handleRoleSelection("Doctor");
                  setShowStaffModal(true);
                }}
                className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 gap-1 shrink-0 cursor-pointer"
              >
                <span>🔒</span>
                <span className="whitespace-nowrap">Staff Portal</span>
              </button>

              {/* Patient Portal */}
              <button
                type="button"
                onClick={() => {
                  setPatientMode("login");
                  setShowPatientModal(true);
                }}
                className="inline-flex items-center px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-all active:scale-95 gap-1 shrink-0 shadow-xs cursor-pointer"
              >
                <span>👤</span>
                <span className="whitespace-nowrap">Patient Portal</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-teal-600 py-1"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-teal-600 py-1"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileNavOpen(false)}
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-teal-600 py-1"
            >
              Emergency & Contact
            </Link>
          </div>
        )}
      </nav>

      {/* Staff 4-Role Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-7 space-y-4 sm:space-y-5 relative my-auto">
            
            <button
              onClick={() => setShowStaffModal(false)}
              type="button"
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 text-sm font-bold w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Hospital Management System</h2>
              <p className="text-xs text-slate-500">Gavane Hospital Role-Based Gateway</p>
            </div>

            {/* 4-Role Tab Bar: 2x2 Grid on Mobile, 4-Cols on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "Admin", label: "Admin", icon: "🔑" },
                { id: "Doctor", label: "Doctor", icon: "🩺" },
                { id: "Support", label: "Support", icon: "👥" },
                { id: "Medical", label: "Medical", icon: "💊" },
              ].map((roleItem) => {
                const isSelected = selectedStaffRole === roleItem.id;
                return (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => handleRoleSelection(roleItem.id as StaffRole)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs ring-1 ring-blue-600"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium"
                    }`}
                  >
                    <span className="text-base mb-0.5">{roleItem.icon}</span>
                    <span className="text-[11px]">{roleItem.label}</span>
                  </button>
                );
              })}
            </div>

            {staffError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium text-center">
                {staffError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered {selectedStaffRole} Email or Username
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Enter ${selectedStaffRole} email or username...`}
                  value={staffIdentifier}
                  onChange={(e) => setStaffIdentifier(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={staffLoading}
                className="w-full py-2.5 bg-[#0b1b2b] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {staffLoading ? "Authenticating..." : `Authenticate ${selectedStaffRole} Access`}
              </button>
            </form>

            <div className="text-center text-[10px] text-slate-400">
              Authorized personnel only • Secure routing to assigned role console.
            </div>
          </div>
        </div>
      )}

      {/* Patient Login & Pre-Registration Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-7 space-y-4 sm:space-y-5 relative my-auto">
            
            <button
              onClick={() => setShowPatientModal(false)}
              type="button"
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 text-sm font-bold w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 mb-1">
                👤
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {patientMode === "login" ? "Patient Vault Login" : "New Patient Pre-Registration"}
              </h2>
              <p className="text-xs text-slate-500">
                Gavane Hospital Citizen Health Portal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPatientMode("login");
                  setPatientError(null);
                  setPatientSuccess(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  patientMode === "login"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setPatientMode("register");
                  setPatientError(null);
                  setPatientSuccess(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  patientMode === "register"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>
            </div>

            {patientError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium text-center">
                {patientError}
              </div>
            )}
            {patientSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium text-center">
                {patientSuccess}
              </div>
            )}

            <form onSubmit={handlePatientAuth} className="space-y-3">
              {patientMode === "register" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kulkarni"
                      value={patientFullName}
                      onChange={(e) => setPatientFullName(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        ABHA ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="14-digit ABHA"
                        value={patientAbha}
                        onChange={(e) => setPatientAbha(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="patient@gavanehospital.in"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={patientPassword}
                  onChange={(e) => setPatientPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-teal-600 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={patientLoading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {patientLoading
                  ? "Processing..."
                  : patientMode === "login"
                  ? "Open Patient Vault"
                  : "Complete Pre-Registration"}
              </button>
            </form>

            <div className="text-center text-[10px] text-slate-400">
              Personal health data is guarded under India DPDP Act 2023 guidelines.
            </div>
          </div>
        </div>
      )}
    </>
  );
}