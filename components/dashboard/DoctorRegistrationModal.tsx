"use client";

import React, { useState, useEffect } from "react";

export interface DoctorRecord {
  id: string;
  reference_id: string;
  name: string;
  degree?: string;
  username?: string;
  email: string;
  password?: string;
  module_category: string;
  department: string;
  consultation_fee?: number;
  access_level: string;
  status: "Active" | "Pending" | "Suspended";
  created_at?: string;
}

interface DoctorRegistrationModalProps {
  isOpen: boolean;
  isEditing: boolean;
  initialData?: DoctorRecord | null;
  onClose: () => void;
  onSave: (doctor: DoctorRecord) => void;
}

export default function DoctorRegistrationModal({
  isOpen,
  isEditing,
  initialData,
  onClose,
  onSave,
}: DoctorRegistrationModalProps) {
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("Cardiology Dept");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [consultationFee, setConsultationFee] = useState<number>(500);
  const [status, setStatus] = useState<"Active" | "Pending" | "Suspended">("Active");
  const [accessLevel, setAccessLevel] = useState("Full Admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setName(initialData.name);
      setDegree(initialData.degree || "");
      setDepartment(initialData.department);
      setEmail(initialData.email);
      setUsername(initialData.username || initialData.email.split("@")[0]);
      setPassword("");
      setConsultationFee(initialData.consultation_fee || 500);
      setStatus(initialData.status);
      setAccessLevel(initialData.access_level || "Full Admin");
    } else {
      setName("");
      setDegree("");
      setDepartment("Cardiology Dept");
      setEmail("");
      setUsername("");
      setPassword("");
      setConsultationFee(500);
      setStatus("Active");
      setAccessLevel("Full Admin");
    }
  }, [isEditing, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const doctorObj: DoctorRecord = {
      id: initialData?.id || `doc-${Date.now()}`,
      reference_id: initialData?.reference_id || `GH-2026-${randomSuffix}`,
      name,
      degree,
      email: email.trim(),
      username: username.trim() || email.split("@")[0],
      password: password || initialData?.password,
      module_category: "Doctors",
      department,
      consultation_fee: Number(consultationFee),
      access_level: accessLevel,
      status,
      created_at: initialData?.created_at || new Date().toISOString(),
    };

    onSave(doctorObj);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Doctors Management
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              {isEditing ? "Edit Doctor Profile" : "Register Consultant / Doctor"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Doctor Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Sudhir Gavane"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing && !username) {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "."));
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Degree / Qual. *</label>
              <input
                type="text"
                required
                placeholder="e.g. MBBS, MD, MS"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Department *</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Consultation Fee (₹) *</label>
              <input
                type="number"
                required
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="doctor@gavanehospital.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Assigned Username *</label>
              <input
                type="text"
                required
                placeholder="e.g. sudhir.gavane"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                {isEditing ? "Password (Unchanged if blank)" : "Password *"}
              </label>
              <input
                type="password"
                required={!isEditing}
                placeholder={isEditing ? "Unchanged" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Pending" | "Suspended")}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              >
                <option value="Active">Active (Permitted Login)</option>
                <option value="Pending">Pending (Awaiting Approval)</option>
                <option value="Suspended">Suspended (Blocked Access)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Commit Doctor Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}