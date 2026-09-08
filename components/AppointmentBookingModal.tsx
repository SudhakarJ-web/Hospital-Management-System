"use client";

import React, { useState, useEffect } from "react";
import { SharedDoctor, getSharedDoctors } from "@/lib/sync/doctorsSync";
import { saveSharedAppointment } from "@/lib/sync/appointmentsSync";
import { saveSharedPatient } from "@/lib/sync/patientsSync";
import { X, Calendar, User, Phone, Clock, FileText } from "lucide-react";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  selectedDoctor?: SharedDoctor | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIME_SLOTS = [
  "09:30 AM - 10:00 AM",
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:30 AM - 12:00 PM",
  "04:00 PM - 04:30 PM",
  "04:30 PM - 05:00 PM",
  "05:30 PM - 06:00 PM",
];

export default function AppointmentBookingModal({
  isOpen,
  selectedDoctor,
  onClose,
  onSuccess,
}: AppointmentBookingModalProps) {
  const [doctorsList, setDoctorsList] = useState<SharedDoctor[]>([]);
  const [chosenDoctorId, setChosenDoctorId] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Fetch live active doctors from Supabase
  useEffect(() => {
    async function loadDoctors() {
      const data = await getSharedDoctors();
      setDoctorsList(data);
    }
    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen]);

  // 2. Synchronize selected doctor on modal open or doctor switch
  useEffect(() => {
    if (selectedDoctor?.id) {
      setChosenDoctorId(selectedDoctor.id);
    } else if (doctorsList.length > 0 && !chosenDoctorId) {
      setChosenDoctorId(doctorsList[0].id);
    }
  }, [selectedDoctor, doctorsList, chosenDoctorId]);

  if (!isOpen) return null;

  // Active doctor derived directly from the current dropdown selection
  const activeDoctor =
    doctorsList.find((d) => d.id === chosenDoctorId) || selectedDoctor || doctorsList[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    const doctorName = activeDoctor?.name || "Consultant Physician";
    const doctorDepartment = activeDoctor?.department || "General Medicine";

    try {
      // 1. Write outpatient record to public.appointments
      await saveSharedAppointment({
        patient_name: patientName.trim(),
        phone: phone.trim(),
        department: doctorDepartment,
        assigned_doctor: doctorName,
        doctor_id: activeDoctor?.id,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        reason: reason.trim() || "OPD Consultation",
        status: "Confirmed",
      });

      // 2. Register / link patient to doctor's clinical caseload in public.patients
      await saveSharedPatient({
        full_name: patientName.trim(),
        phone: phone.trim(),
        department: doctorDepartment,
        assigned_doctor: doctorName,
        doctor_id: activeDoctor?.id,
        notes: `Online Visit: ${appointmentDate} (${timeSlot}) - ${reason.trim() || "OPD"}`,
        status: "Active",
      });

      setStatusMessage({
        type: "success",
        text: `Consultation confirmed with ${doctorName} on ${appointmentDate}!`,
      });

      setTimeout(() => {
        setPatientName("");
        setPhone("");
        setReason("");
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      console.error("Booking error details:", err);
      const detail =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : JSON.stringify(err);

      setStatusMessage({
        type: "error",
        text: `Failed: ${detail}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 space-y-4 my-auto relative text-slate-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Instant Outpatient Booking
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            Book with {activeDoctor?.name || "Specialist Physician"}
          </h2>
          <p className="text-xs text-slate-500">
            Department: <strong className="text-teal-700">{activeDoctor?.department || "Clinical OPD"}</strong> • Consultation Fee: <strong>{activeDoctor?.fee || "₹500"}</strong>
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold whitespace-pre-wrap break-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Patient Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Contact Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Desired Consultation Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Doctor / Consultant *
              </label>
              <select
                value={chosenDoctorId}
                onChange={(e) => setChosenDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.department.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Preferred Time Slot *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Symptoms / Reason for Visit
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={`Describe symptoms or notes for ${activeDoctor?.name || "the doctor"}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
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
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>{submitting ? "Confirming..." : `Confirm Booking with ${activeDoctor?.name || "Doctor"}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}