"use client";

import React, { useState } from "react";
import { SharedPatient } from "@/lib/sync/patientsSync";
import { saveSharedPrescription } from "@/lib/sync/prescriptionsSync";

interface DoctorClinicalFormProps {
  doctorName: string;
  doctorId?: string;
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
  doctorId,
  patients,
  onSuccess,
  onError,
}: DoctorClinicalFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [clinicalAssessment, setClinicalAssessment] = useState<string>("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [medications, setMedications] = useState<string>("");
  const [dietAdvice, setDietAdvice] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      onError("Please select a registered patient record.");
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) {
      onError("Selected patient record could not be found.");
      return;
    }

    if (!medications.trim()) {
      onError("Please provide at least one pharmacological prescription medication.");
      return;
    }

    setSubmitting(true);

    try {
      await saveSharedPrescription({
        patient_name: patient.full_name,
        patient_phone: patient.phone,
        prescribing_doctor: doctorName,
        doctor_id: doctorId,
        department: patient.department,
        clinical_notes: clinicalAssessment,
        investigations: selectedTests.join(", "),
        medications,
        diet_instructions: dietAdvice,
        status: "Pending Dispensation" as const,
      });

      onSuccess(`Consultation finalized and Rx transmitted to Pharmacy for ${patient.full_name}.`);

      // Reset form fields
      setSelectedPatientId("");
      setClinicalAssessment("");
      setSelectedTests([]);
      setMedications("");
      setDietAdvice("");
    } catch {
      onError("Failed to submit clinical consultation to the database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            PHYSICIAN CLINICAL CHART CONSOLE
          </h2>
          <p className="text-xs text-slate-500">
            Attending Physician: <strong className="text-teal-700">{doctorName}</strong> • Gavane Hospital EHR
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full">
          DPDP ACT 2023 COMPLIANT NODE
        </span>
      </div>

      {/* 1. Patient Picker */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase text-slate-700 tracking-wider mb-1.5">
          1. Select Registered Patient Record *
        </label>
        <select
          required
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
        >
          <option value="">
            -- Choose Registered Patient ({patients.length} available in your caseload) --
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} • {p.phone} • Ref: {p.reference_id} ({p.notes})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Clinical Assessment */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase text-slate-700 tracking-wider mb-1.5">
          2. Clinical Assessment & Diagnosis *
        </label>
        <textarea
          required
          rows={3}
          value={clinicalAssessment}
          onChange={(e) => setClinicalAssessment(e.target.value)}
          placeholder="Enter clinical examination notes, observed vitals (BP, Pulse, SpO2), symptoms, and primary diagnosis..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
        />
      </div>

      {/* 3. Diagnostic Tests */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase text-slate-700 tracking-wider mb-1.5">
          3. Diagnostic Investigations (Suggested Lab Tests)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {COMMON_INVESTIGATIONS.map((test) => {
            const checked = selectedTests.includes(test);
            return (
              <label
                key={test}
                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  checked
                    ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTest(test)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span className="truncate">{test}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Medications */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase text-slate-700 tracking-wider mb-1.5">
          4. Pharmacological Prescriptions (Medications, Dosage, Regimen) *
        </label>
        <textarea
          required
          rows={3}
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          placeholder="e.g. 1. Tab. Paracetamol 650mg — 1-0-1 (After meals) — 5 Days&#10;2. Tab. Pantoprazole 40mg — 1-0-0 (Empty stomach) — 5 Days"
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
        />
      </div>

      {/* 5. Dietary & Follow-up */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase text-slate-700 tracking-wider mb-1.5">
          5. Dietary Guidelines & Follow-Up Advice
        </label>
        <textarea
          rows={2}
          value={dietAdvice}
          onChange={(e) => setDietAdvice(e.target.value)}
          placeholder="e.g. Low sodium diet. Drink 3L water daily. Review with diagnostic reports in 3 days."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
        >
          <span>{submitting ? "Transmitting..." : "Sign & Transmit Consultation to Pharmacy"}</span>
        </button>
      </div>
    </form>
  );
}