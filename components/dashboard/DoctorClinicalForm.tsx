"use client";

import React, { useState } from "react";
import { SharedPatient } from "@/lib/sync/patientsSync";
import { saveSharedPrescription, SharedPrescription } from "@/lib/sync/prescriptionsSync";

interface DoctorClinicalFormProps {
  doctorName: string;
  patients: SharedPatient[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const COMMON_INVESTIGATIONS = [
  "Complete Blood Count (CBC)",
  "Fasting Blood Sugar (FBS)",
  "Postprandial Blood Sugar (PPBS)",
  "Chest X-Ray",
  "Abdominal Sonography (USG)",
  "Lipid Profile",
  "Liver Function Test (LFT)",
  "Kidney Function Test (KFT)",
  "Thyroid Panel (TSH, T3, T4)",
  "Urine Routine & Microscopic",
];

export default function DoctorClinicalForm({
  doctorName,
  patients,
  onSuccess,
  onError,
}: DoctorClinicalFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [medications, setMedications] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleTestToggle = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedPatient) {
      onError("Please select a valid registered patient record.");
      return;
    }

    if (!diagnosis.trim()) {
      onError("Clinical Assessment & Diagnosis field is mandatory.");
      return;
    }

    setSubmitting(true);

    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newRx: SharedPrescription = {
        id: `rx-${Date.now()}`,
        rx_id: `GH-RX-2026-${randomSuffix}`,
        patient_id: selectedPatient.reference_id || selectedPatient.id,
        patient_name: selectedPatient.full_name,
        age_gender: "Adult / Citizen",
        prescribing_doctor: doctorName,
        department: selectedPatient.department || "General Medicine",
        diagnosis: diagnosis.trim(),
        medications: medications.trim() || "Clinical observation & review prescribed.",
        dosage_notes: notes.trim() + (selectedTests.length > 0 ? `\nLab Orders: ${selectedTests.join(", ")}` : ""),
        status: "Pending Dispense",
        issued_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      await saveSharedPrescription(newRx);
      onSuccess(`Prescription & EHR record for ${selectedPatient.full_name} generated and sent to Pharmacy.`);
      
      // Reset form
      setSelectedPatientId("");
      setDiagnosis("");
      setSelectedTests([]);
      setMedications("");
      setNotes("");
    } catch {
      onError("Failed to dispatch prescription record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePrescriptionSubmit} className="space-y-6 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
            Physician Clinical Chart Console
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Attending Physician: <strong className="text-teal-700 font-bold">{doctorName}</strong> • Gavane Hospital EHR
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
          ● DPDP Act 2023 Compliant Node
        </span>
      </div>

      {/* 1. Patient Selector */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-700 uppercase">
          1. Select Registered Patient Record *
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
        >
          <option value="">-- Choose Registered Patient ({patients.length} available) --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} ({p.phone}) [{p.department}] • Assigned: {p.assigned_doctor}
            </option>
          ))}
        </select>
        {selectedPatient && (
          <div className="p-2.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs flex flex-wrap items-center justify-between text-teal-900 gap-2 mt-2">
            <div>
              Ref: <strong className="font-mono">{selectedPatient.reference_id}</strong> • Vitals: {selectedPatient.notes || "Standard Triage Cleared"}
            </div>
            <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-teal-300">
              Active Triage
            </span>
          </div>
        )}
      </div>

      {/* 2. Clinical Diagnosis */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-700 uppercase">
          2. Clinical Assessment & Diagnosis *
        </label>
        <textarea
          rows={3}
          required
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Enter clinical examination notes, observed vitals (BP, Pulse, SpO2), symptoms, and primary diagnosis..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none resize-none"
        />
      </div>

      {/* 3. Diagnostic Investigations */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-700 uppercase">
          3. Diagnostic Investigations (Suggested Lab Tests)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {COMMON_INVESTIGATIONS.map((test, i) => {
            const isChecked = selectedTests.includes(test);
            return (
              <label
                key={i}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  isChecked
                    ? "bg-teal-50 border-teal-400 text-teal-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTestToggle(test)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span className="truncate">{test}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Pharmacological Prescriptions */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-700 uppercase">
          4. Pharmacological Prescriptions (Medications, Dosage, Regimen)
        </label>
        <textarea
          rows={3}
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          placeholder="e.g.&#10;1. Tab. Paracetamol 650mg — 1-0-1 (After meals) — 5 Days&#10;2. Tab. Pantoprazole 40mg — 1-0-0 (Empty stomach) — 5 Days"
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none resize-none"
        />
      </div>

      {/* 5. Doctor Advice & Dietary Advice */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-700 uppercase">
          5. Dietary Guidelines & Follow-Up Advice
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Low sodium diet. Drink 3L water. Review with reports in 3 days."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
        />
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
        >
          <span>{submitting ? "Transmitting..." : "✓ Generate E-Prescription & Commit Record"}</span>
        </button>
      </div>
    </form>
  );
}