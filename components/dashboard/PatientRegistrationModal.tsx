"use client";

import React, { useState } from "react";
import { SharedPatient, saveSharedPatient } from "../../lib/sync/patientsSync";

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient: SharedPatient) => void;
  defaultDoctor?: string;
}

export default function PatientRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  defaultDoctor = "Dr. Priya",
}: PatientRegistrationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Cardiology Dept");
  const [doctor, setDoctor] = useState(defaultDoctor);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newPt: SharedPatient = {
      id: `pat-${Date.now()}`,
      reference_id: `GH-2026-REG${randomSuffix}`,
      full_name: name,
      phone: phone || "+91 98000 00000",
      department: department || "General OPD",
      assigned_doctor: doctor || defaultDoctor,
      notes: notes || "Registered via Hospital System",
      status: "Active",
      created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    await saveSharedPatient(newPt);
    onSuccess(newPt);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-base font-extrabold text-slate-900 uppercase">Register New Patient</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Patient Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Jadhav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Consultant Doctor</label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Clinical Particulars / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Consultation, Routine checkup..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm">
              {submitting ? "Saving..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}