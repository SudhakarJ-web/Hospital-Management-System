"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Stethoscope, Phone, ShieldCheck, Clock, Award, Mail, Lock } from "lucide-react";
import { saveLiveModuleRecord, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface StaffRegistrationModalProps {
  isOpen: boolean;
  type: "MEDICAL_STAFF" | "SUPPORT_STAFF";
  initialRecord?: UnifiedRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StaffRegistrationModal({
  isOpen,
  type,
  initialRecord,
  onClose,
  onSuccess,
}: StaffRegistrationModalProps) {
  const isMedical = type === "MEDICAL_STAFF";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Staff@2026");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [shift, setShift] = useState("Day Shift (08:00 AM - 04:00 PM)");
  const [qualificationOrId, setQualificationOrId] = useState("");
  const [status, setStatus] = useState("Active");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setFullName(initialRecord.col1 || "");
      
      // Parse designation • department
      const parts = (initialRecord.col2 || "").split("•").map((s) => s.trim());
      setDesignation(parts[0] || "");
      setDepartment(parts[1] || "");

      setEmail(initialRecord.col3 || "");
      setPassword(initialRecord.col4 || "Staff@2026");

      // Parse col5: "phone | Reg/ID | shift"
      const col5Parts = (initialRecord.col5 || "").split("|").map((s) => s.trim());
      setPhone(col5Parts[0] || "");
      if (col5Parts[1]) {
        setQualificationOrId(col5Parts[1].replace(/^(Reg:\s*|ID:\s*)/i, ""));
      } else {
        setQualificationOrId("");
      }
      setShift(col5Parts[2] || "Day Shift (08:00 AM - 04:00 PM)");
      setStatus(initialRecord.status || "Active");
    } else {
      setFullName("");
      setEmail("");
      setPassword("Staff@2026");
      setDesignation("");
      setDepartment("");
      setPhone("");
      setQualificationOrId("");
      setShift("Day Shift (08:00 AM - 04:00 PM)");
      setStatus("Active");
    }
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await saveLiveModuleRecord(type, {
        id: initialRecord?.id,
        reference_id: initialRecord?.reference_id || `GH-${isMedical ? "MED" : "SUP"}-${Math.floor(1000 + Math.random() * 9000)}`,
        col1: fullName.trim(),
        col2: `${designation.trim()} • ${department.trim() || (isMedical ? "Clinical Ward" : "Operations")}`,
        col3: email.trim().toLowerCase(),
        col4: password.trim(),
        col5: `${phone.trim()} | ${isMedical ? "Reg: " + qualificationOrId.trim() : "ID: " + qualificationOrId.trim()} | ${shift}`,
        status: status,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save staff profile";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 space-y-4 my-auto relative text-slate-800 font-sans">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            {isMedical ? <Stethoscope className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Administrative Credentialing
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {initialRecord
                ? isMedical ? "Edit Medical Officer" : "Edit Support Personnel"
                : isMedical ? "Register Medical Staff Member" : "Register Support Personnel"}
            </h2>
            <p className="text-xs text-slate-500">
              Update credentials, login information, duty shifts, or active status.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder={isMedical ? "Dr. Sneha More (MBBS)" : "Mr. Sachin Shinde"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98220 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-teal-50/50 p-3 rounded-2xl border border-teal-100">
            <div>
              <label className="block text-[10px] font-bold text-teal-900 uppercase mb-1">
                Portal Login Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-teal-600 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder={isMedical ? "rmo@gavanehospital.in" : "support@gavanehospital.in"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-teal-900 uppercase mb-1">
                Portal Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Staff@2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                {isMedical ? "Designation / Role *" : "Position / Role *"}
              </label>
              <input
                type="text"
                required
                placeholder={isMedical ? "Resident Medical Officer" : "Billing Executive"}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Department / Ward *
              </label>
              <input
                type="text"
                required
                placeholder={isMedical ? "Emergency & ICU" : "Front Desk Accounts"}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                {isMedical ? "Council Reg / Degree" : "Staff / Employee ID"}
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isMedical ? "MMC-2023-8941" : "GH-STAFF-041"}
                  value={qualificationOrId}
                  onChange={(e) => setQualificationOrId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Duty Shift Timing *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Day Shift (08:00 AM - 04:00 PM)">Day Shift (08:00 AM - 04:00 PM)</option>
                  <option value="Evening Shift (02:00 PM - 10:00 PM)">Evening Shift (02:00 PM - 10:00 PM)</option>
                  <option value="Night Emergency (10:00 PM - 08:00 AM)">Night Emergency (10:00 PM - 08:00 AM)</option>
                  <option value="24-Hour On-Call Rotation">24-Hour On-Call Rotation</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Credential Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            >
              <option value="Active">Active Duty</option>
              <option value="On Leave">On Leave</option>
              <option value="Relieved">Relieved / Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : initialRecord ? "Update Staff Member" : "Record & Authorize Staff Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}