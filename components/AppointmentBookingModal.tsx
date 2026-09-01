"use client";

import React, { useState, useEffect } from "react";
import { saveSharedAppointment, SharedAppointment } from "@/lib/sync/appointmentsSync";
import { saveSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
  initialDoctor?: string;
  initialDepartment?: string;
}

const DEPARTMENTS = [
  "Cardiology & Cardiac Sciences",
  "General Surgery & Trauma",
  "General Medicine & Pediatrics",
  "Orthopedics & Joint Replacement",
  "Neurology & Neurosciences",
  "Radiology & Imaging",
  "Pathology Laboratory",
];

const DOCTOR_TO_DEPARTMENT: Record<string, string> = {
  "Dr. Ananya Rao": "Cardiology & Cardiac Sciences",
  "Dr. Sudhir Gavane": "General Surgery & Trauma",
  "Dr. Priya": "General Medicine & Pediatrics",
  "Dr. Rajesh Kumar": "Orthopedics & Joint Replacement",
  "Dr. Elena Rostova": "Neurology & Neurosciences",
};

const DEPARTMENT_TO_DOCTORS: Record<string, string[]> = {
  "Cardiology & Cardiac Sciences": ["Dr. Ananya Rao", "Dr. Priya"],
  "General Surgery & Trauma": ["Dr. Sudhir Gavane"],
  "General Medicine & Pediatrics": ["Dr. Priya", "Dr. Ananya Rao"],
  "Orthopedics & Joint Replacement": ["Dr. Sudhir Gavane", "Dr. Rajesh Kumar"],
  "Neurology & Neurosciences": ["Dr. Elena Rostova"],
  "Radiology & Imaging": ["Dr. Ananya Rao"],
  "Pathology Laboratory": ["Dr. Priya"],
};

const TIME_SLOTS = [
  "09:00 AM - 09:30 AM",
  "09:30 AM - 10:00 AM",
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:30 AM - 12:00 PM",
  "12:00 PM - 12:30 PM",
  "02:30 PM - 03:00 PM",
  "03:30 PM - 04:00 PM",
  "04:30 PM - 05:00 PM",
];

export default function AppointmentBookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialDoctor = "Dr. Ananya Rao",
  initialDepartment,
}: AppointmentBookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [doctor, setDoctor] = useState(initialDoctor);
  const [department, setDepartment] = useState(
    initialDepartment || DOCTOR_TO_DEPARTMENT[initialDoctor] || DEPARTMENTS[0]
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<SharedAppointment | null>(null);

  // Sync state whenever modal opens with a different doctor
  useEffect(() => {
    if (isOpen) {
      const selectedDoc = initialDoctor || "Dr. Ananya Rao";
      const matchingDept =
        initialDepartment || DOCTOR_TO_DEPARTMENT[selectedDoc] || DEPARTMENTS[0];
      setDoctor(selectedDoc);
      setDepartment(matchingDept);
      setConfirmedBooking(null);
    }
  }, [isOpen, initialDoctor, initialDepartment]);

  if (!isOpen) return null;

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDoc = e.target.value;
    setDoctor(selectedDoc);
    const matchingDept = DOCTOR_TO_DEPARTMENT[selectedDoc];
    if (matchingDept) {
      setDepartment(matchingDept);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDept = e.target.value;
    setDepartment(selectedDept);
    const availableDocs = DEPARTMENT_TO_DOCTORS[selectedDept] || ["Dr. Ananya Rao"];
    if (!availableDocs.includes(doctor)) {
      setDoctor(availableDocs[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const refId = `GH-APT-2026-${randomSuffix}`;

    const newAppointment: SharedAppointment = {
      id: `apt-${Date.now()}`,
      reference_id: refId,
      patient_name: name.trim(),
      phone: phone.trim(),
      department,
      assigned_doctor: doctor,
      appointment_date: date || new Date().toISOString().split("T")[0],
      time_slot: timeSlot,
      message: message.trim() || "Routine Clinical Consultation",
      status: "Active",
      created_at: new Date().toLocaleDateString("en-IN"),
    };

    // 1. Save to central appointments ledger (synced with doctor & admin)
    await saveSharedAppointment(newAppointment);

    // 2. Automatically register patient in triage if new
    const newPt: SharedPatient = {
      id: `pat-${Date.now()}`,
      reference_id: `GH-2026-REG${randomSuffix}`,
      full_name: name.trim(),
      phone: phone.trim(),
      department,
      assigned_doctor: doctor,
      notes: `Appt: ${date || "Today"} (${timeSlot}) • ${message.trim() || "Booked Online"}`,
      status: "Active",
      created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };
    await saveSharedPatient(newPt);

    setLoading(false);
    setConfirmedBooking(newAppointment);

    if (onSuccess) {
      onSuccess(`Appointment booked successfully with ${doctor}! Ref: ${refId}`);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedBooking(null);
    setName("");
    setPhone("");
    setDate("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto text-slate-800">
        
        {confirmedBooking ? (
          /* Confirmation Success Card */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Booking Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Appointment Scheduled with {confirmedBooking.assigned_doctor}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your consultation token is active and synchronized with {confirmedBooking.assigned_doctor}&apos;s clinical OPD queue.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-bold text-teal-700">{confirmedBooking.reference_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Patient Legal Name:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.patient_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Consultant Physician:</span>
                <span className="font-bold text-teal-900">{confirmedBooking.assigned_doctor}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Specialty Department:</span>
                <span className="font-medium text-slate-800">{confirmedBooking.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date & Slot:</span>
                <span className="font-bold text-teal-800">{confirmedBooking.appointment_date} • {confirmedBooking.time_slot}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              type="button"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              Done / Return to Portal
            </button>
          </div>
        ) : (
          /* Interactive Booking Form */
          <>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Instant Outpatient Booking
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Book with {doctor}
                </h3>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Patient Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Desired Consultation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Doctor / Consultant *
                  </label>
                  <select
                    value={doctor}
                    onChange={handleDoctorChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    {Object.keys(DOCTOR_TO_DEPARTMENT).map((docName, idx) => (
                      <option key={idx} value={docName}>{docName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Specialty Department *
                  </label>
                  <select
                    value={department}
                    onChange={handleDepartmentChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    {DEPARTMENTS.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Select Time Slot *
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  {TIME_SLOTS.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Symptoms / Custom Message for {doctor}
                </label>
                <textarea
                  rows={2}
                  placeholder={`Describe your symptoms, previous reports, or notes for ${doctor}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {loading ? "Confirming Slot..." : `Confirm Booking with ${doctor.split(" ")[1] || "Doctor"}`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}