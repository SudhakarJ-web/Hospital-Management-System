"use client";

import React, { useState, useEffect } from "react";
import { SharedAppointment, saveSharedAppointment } from "@/lib/sync/appointmentsSync";
import { SharedDoctor, getSharedDoctors } from "@/lib/sync/doctorsSync";
import { X, Calendar, Clock, User, Phone, CheckCircle2 } from "lucide-react";

interface EditAppointmentModalProps {
  isOpen: boolean;
  appointment: SharedAppointment | null;
  onClose: () => void;
  onSaved: () => void;
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

export default function EditAppointmentModal({
  isOpen,
  appointment,
  onClose,
  onSaved,
}: EditAppointmentModalProps) {
  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [department, setDepartment] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [status, setStatus] = useState<"Confirmed" | "Completed" | "Cancelled">("Confirmed");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      const list = await getSharedDoctors();
      setDoctors(list);
    }
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setPatientName(appointment.patient_name || "");
      setPhone(appointment.phone || "");
      setDoctorId(appointment.doctor_id || "");
      setDoctorName(appointment.assigned_doctor || "");
      setDepartment(appointment.department || "General Medicine");
      setAppointmentDate(appointment.appointment_date || "");
      setTimeSlot(appointment.time_slot || TIME_SLOTS[0]);
      setStatus(appointment.status || "Confirmed");
      setReason(appointment.reason || "");
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleDoctorChange = (selectedId: string) => {
    setDoctorId(selectedId);
    const found = doctors.find((d) => d.id === selectedId);
    if (found) {
      setDoctorName(found.name);
      setDepartment(found.department);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      await saveSharedAppointment({
        id: appointment.id,
        reference_id: appointment.reference_id,
        patient_name: patientName.trim(),
        phone: phone.trim(),
        department,
        assigned_doctor: doctorName,
        doctor_id: doctorId || null,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        reason: reason.trim(),
        status,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update appointment";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
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
            Consultation Desk
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            Modify Appointment: {appointment.reference_id}
          </h2>
          <p className="text-xs text-slate-500">
            Reschedule timing, reassign physician, or update consultation status.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Patient Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Assigned Physician *
              </label>
              <select
                value={doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Consultation Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Scheduled Date *
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

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Time Slot *
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
              Clinical Symptoms / Remarks
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saving ? "Saving Changes..." : "Update Appointment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}