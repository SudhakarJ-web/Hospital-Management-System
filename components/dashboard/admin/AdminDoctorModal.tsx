"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SharedDoctor, generateDoctorSlug } from "@/lib/sync/doctorsSync";
import { X, Lock, Mail, Stethoscope, Award, IndianRupee, ShieldCheck } from "lucide-react";

interface AdminDoctorModalProps {
  isOpen: boolean;
  doctor: SharedDoctor | null;
  onClose: () => void;
  onSaved: () => void;
}

const DEPARTMENTS = [
  "Cardiology & Cardiac Sciences",
  "General Surgery & Trauma",
  "General Medicine & Pediatrics",
  "Orthopedics & Joint Replacement",
  "Neurology & Neurosurgery",
  "Obstetrics & Gynecology",
  "Dermatology & Cosmetology",
  "ENT & Head-Neck Surgery",
];

export default function AdminDoctorModal({
  isOpen,
  doctor,
  onClose,
  onSaved,
}: AdminDoctorModalProps) {
  const [fullName, setFullName] = useState("");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fee, setFee] = useState("₹500");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<"Active" | "Pending" | "Suspended">("Active");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (doctor) {
      setFullName(doctor.name || "");
      setDegree(doctor.degree || "");
      setDepartment(doctor.department || DEPARTMENTS[0]);
      setEmail(doctor.email || "");
      setPassword(doctor.password || "password123");
      setFee(doctor.fee || "₹500");
      setImage(doctor.image || "");
      setStatus(doctor.status || "Active");
    } else {
      // New Doctor Defaults
      setFullName("");
      setDegree("MBBS, MD");
      setDepartment(DEPARTMENTS[0]);
      setEmail("");
      setPassword("Doctor@2026");
      setFee("₹500");
      setImage("https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80");
      setStatus("Active");
    }
    setErrorMsg(null);
  }, [doctor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const computedSlug = doctor?.slug || generateDoctorSlug(cleanName);

    try {
      if (doctor?.id) {
        // UPDATE EXISTING DOCTOR IN SUPABASE
        const { error } = await supabase
          .from("doctors")
          .update({
            name: cleanName,
            degree: degree.trim(),
            department,
            email: cleanEmail,
            password: password.trim(),
            fee: fee.trim(),
            image: image.trim() || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
            status,
            slug: computedSlug,
          })
          .eq("id", doctor.id);

        if (error) throw error;
      } else {
        // CREATE NEW DOCTOR IN SUPABASE
        const randomRef = `GH-2026-${Math.floor(100 + Math.random() * 900)}`;

        const { error } = await supabase
          .from("doctors")
          .insert([
            {
              reference_id: randomRef,
              name: cleanName,
              slug: computedSlug,
              degree: degree.trim(),
              department,
              email: cleanEmail,
              password: password.trim(),
              fee: fee.trim(),
              image: image.trim() || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
              status,
              created_at: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to persist doctor record in Supabase.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-4 my-auto relative text-slate-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Target: Doctors Management Console
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            {doctor ? `Edit Credentials: ${doctor.name}` : "Onboard New Specialist Physician"}
          </h2>
          <p className="text-[11px] text-slate-500">
            Changes update the Supabase database immediately.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Doctor Full Name & Title *
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Degree / Qualification *
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, MS (General Surgery)"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Clinical Specialty Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                OPD Consultation Fee *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹500"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Portal Login Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="doctor.name@gavanehospital.in"
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
                  type="text"
                  required
                  placeholder="Enter new password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-teal-900 focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Doctor Portrait Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Account Status Flag</span>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Pending" | "Suspended")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                <option value="Active">Active / Approved</option>
                <option value="Pending">Pending Verification</option>
                <option value="Suspended">Suspended / Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? "Saving to Supabase..." : doctor ? "Save Changes" : "Register Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}