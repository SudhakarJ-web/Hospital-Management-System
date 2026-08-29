"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { bookPatientAppointmentAction } from "../../../app/actions";

interface PrescriptionItem {
  name: string;
  dosage: string;
  duration: string;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  diagnosis: string;
  lab_tests: string[];
  prescriptions: PrescriptionItem[];
  created_at: string;
}

interface AppointmentRecord {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  department: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

interface BillingRecord {
  id: string;
  patient_id: string;
  amount: number;
  currency: string;
  description: string;
  status: "unpaid" | "paid";
  payment_method?: string;
  paid_at?: string;
  created_at: string;
}

interface PatientProfile {
  id: string;
  full_name: string;
  phone?: string;
  abha_id?: string;
}

const DEPARTMENTS = [
  "General OPD & Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology & Obstetrics",
  "Dermatology",
  "ENT & Ophthalmology",
];

const TIME_SLOTS = [
  "09:30 AM - 10:00 AM",
  "10:30 AM - 11:00 AM",
  "11:30 AM - 12:00 PM",
  "02:00 PM - 02:30 PM",
  "03:30 PM - 04:00 PM",
  "05:00 PM - 05:30 PM",
  "06:30 PM - 07:00 PM",
];

export default function PatientWellnessDashboard() {
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [billingLogs, setBillingLogs] = useState<BillingRecord[]>([]);

  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingDept, setBookingDept] = useState<string>(DEPARTMENTS[0]);
  const [bookingNotes, setBookingNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  const [showComplianceNotice, setShowComplianceNotice] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPatientVault = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setFeedback({
        type: "error",
        text: "User session not authenticated. Please re-login to access your Vault.",
      });
      setLoading(false);
      return;
    }

    // Set fallback patient profile matching auth ID
    const userMetadataName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Patient";
    setPatientProfile({
      id: user.id,
      full_name: userMetadataName,
      phone: user.phone || user.user_metadata?.phone,
      abha_id: user.user_metadata?.abha_id,
    });

    // 1. Fetch Appointments filtered strictly by Authenticated Patient ID
    const { data: apptData } = await supabase
      .from("appointments")
      .select("id, patient_id, appointment_date, appointment_time, department, status, notes, created_at")
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: false });

    // 2. Fetch Clinical Medical Records filtered by Authenticated Patient ID
    const { data: recordData } = await supabase
      .from("medical_records")
      .select("id, patient_id, diagnosis, lab_tests, prescriptions, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    // 3. Fetch Billing Statements filtered by Authenticated Patient ID
    const { data: billData } = await supabase
      .from("billing")
      .select("id, patient_id, amount, currency, description, status, payment_method, paid_at, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (apptData) setAppointments(apptData as AppointmentRecord[]);
    if (recordData) setMedicalRecords(recordData as MedicalRecord[]);
    if (billData) setBillingLogs(billData as BillingRecord[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatientVault();
  }, [fetchPatientVault]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!patientProfile?.id) {
      setFeedback({ type: "error", text: "Invalid patient session." });
      return;
    }

    if (!bookingDate || !bookingTime || !bookingDept) {
      setFeedback({ type: "error", text: "Please complete all mandatory appointment fields." });
      return;
    }

    setSubmittingBooking(true);

    const res = await bookPatientAppointmentAction({
      patient_id: patientProfile.id,
      appointment_date: bookingDate,
      appointment_time: bookingTime,
      department: bookingDept,
      notes: bookingNotes,
    });

    setSubmittingBooking(false);

    if (res.success && res.data) {
      setAppointments((prev) => [res.data as AppointmentRecord, ...prev]);
      setBookingDate("");
      setBookingTime("");
      setBookingNotes("");
      setShowComplianceNotice(true);
      setFeedback({
        type: "success",
        text: "Consultation booked successfully. Your slot is flagged as 'pending' for administrative queue clearance.",
      });
    } else {
      setFeedback({ type: "error", text: res.error || "Could not complete booking." });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // Min selectable date: Today
  const todayDateString = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* DPDP Workflow Real-Time Transparency Notice Banner */}
        {showComplianceNotice && (
          <div className="bg-indigo-900 border border-indigo-700 text-indigo-100 p-4 rounded-xl shadow-lg relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-3">
              <span className="flex h-3 w-3 relative mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="text-xs leading-relaxed">
                <span className="font-bold tracking-wide uppercase text-indigo-300 mr-2">[Real-time Notice Log]:</span>
                Verified event change pushed automatically to Admin Desk, Doctor Panel, and Patient Vault in compliance with DPDP data tracking guidelines.
              </div>
            </div>
            <button
              onClick={() => setShowComplianceNotice(false)}
              className="text-indigo-300 hover:text-white text-xs font-semibold uppercase tracking-wider underline shrink-0"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Portal Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Encrypted Citizen Vault (ap-south-1)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome, {patientProfile?.full_name || "Patient"}
            </h1>
            <p className="text-sm text-slate-500">
              Gavane Hospital Patient Self-Service Portal & Electronic Medical History
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-semibold">User Vault ID</span>
              <span className="font-mono font-medium text-slate-800">
                {patientProfile?.id ? `${patientProfile.id.substring(0, 13)}...` : "Loading..."}
              </span>
            </div>
            {patientProfile?.abha_id && (
              <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-semibold">ABHA Address</span>
                <span className="font-mono font-medium text-blue-700">{patientProfile.abha_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-sm font-medium transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-rose-50 border-rose-300 text-rose-900"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Interactive Booking Module */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-teal-800 to-cyan-900 text-white flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Schedule OPD Consultation</h2>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Select your specialized medical department, date, and preferred doctor time-slot
              </p>
            </div>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-xs text-xs font-semibold rounded-lg border border-white/20">
              Online Booking
            </span>
          </div>

          <form onSubmit={handleBookAppointment} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Department Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Specialty Department *
                </label>
                <select
                  value={bookingDept}
                  onChange={(e) => setBookingDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-medium"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day / Calendar Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Date *
                </label>
                <input
                  type="date"
                  min={todayDateString}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-medium"
                />
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Time Slot *
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-medium"
                >
                  <option value="">-- Choose Slot --</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Symptoms Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Primary Symptoms / Reason for Visit (Optional)
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Briefly describe health concerns, current medication, or relevant allergies..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder-slate-400"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingBooking}
                className="w-full sm:w-auto px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submittingBooking ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Locking Slot...
                  </>
                ) : (
                  "Confirm Appointment Slot"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Two-Column Grid: Appointments & Billing History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Column 1: Scheduled Visits */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Your Appointment History</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">
                  {appointments.length} Total
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {appointments.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">
                    {loading ? "Loading appointment records..." : "No appointments booked yet."}
                  </p>
                ) : (
                  appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-slate-900">{appt.department}</div>
                        <div className="text-xs text-slate-500">
                          Date: <span className="font-medium text-slate-700">{appt.appointment_date}</span> • Slot: <span className="font-medium text-slate-700">{appt.appointment_time}</span>
                        </div>
                        {appt.notes && (
                          <div className="text-[11px] text-slate-400 italic">Notes: {appt.notes}</div>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border self-start sm:self-center ${getStatusBadge(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Invoices & Statements */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Invoices & Outpatient Billing</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">
                  {billingLogs.length} Records
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {billingLogs.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">
                    {loading ? "Loading invoices..." : "No billing statements on file."}
                  </p>
                ) : (
                  billingLogs.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-800">{bill.description}</div>
                        <div className="text-xs text-slate-400">
                          Invoice #{bill.id.substring(0, 8).toUpperCase()} • {new Date(bill.created_at).toLocaleDateString("en-IN")}
                        </div>
                        {bill.payment_method && (
                          <div className="text-[11px] font-medium text-emerald-700">
                            Mode: {bill.payment_method}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-slate-900">
                          ₹{bill.amount.toFixed(2)}
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            bill.status === "paid"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Medical Vault & Prescriptions Full Log */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Doctor Prescriptions & Clinical Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct transcripts finalized by attending doctors</p>
            </div>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200">
              Verified EHR
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {medicalRecords.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400">
                {loading ? "Decrypting medical charts..." : "No verified diagnostic records logged yet."}
              </p>
            ) : (
              medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        EHR Record Ref: {record.id.substring(0, 8).toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        Clinical Diagnosis: {record.diagnosis}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Date: {new Date(record.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </span>
                  </div>

                  {/* Diagnostic Tests */}
                  {record.lab_tests && record.lab_tests.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                        Prescribed Diagnostic Investigations
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {record.lab_tests.map((test, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-800 text-xs font-medium px-3 py-1 rounded-md border border-blue-200"
                          >
                            🧪 {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medication Table */}
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                        Prescribed Medications
                      </span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                            <tr>
                              <th className="p-2.5">Medicine</th>
                              <th className="p-2.5">Dosage / Frequency</th>
                              <th className="p-2.5">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                            {record.prescriptions.map((med, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                                <td className="p-2.5">{med.dosage}</td>
                                <td className="p-2.5">{med.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}