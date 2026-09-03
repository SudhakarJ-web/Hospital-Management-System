"use client";

import React, { useState } from "react";
import { SharedAppointment, saveSharedAppointment } from "@/lib/sync/appointmentsSync";

interface AppointmentsViewProps {
  appointments: SharedAppointment[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onDeleteAppointment: (id: string, name: string) => void;
}

export default function AppointmentsView({
  appointments,
  searchTerm,
  onSearchChange,
  onDeleteAppointment,
}: AppointmentsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("General Medicine & Pediatrics");
  const [doctorName, setDoctorName] = useState("Hospital Specialist");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 10:30 AM");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await saveSharedAppointment({
        patient_name: patientName.trim(),
        phone: phone.trim(),
        department,
        assigned_doctor: doctorName,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        reason: reason.trim() || "Consultation",
        status: "Confirmed",
      });

      setShowModal(false);
      setPatientName("");
      setPhone("");
      setReason("");
      window.location.reload();
    } catch {
      alert("Failed to book appointment in Supabase.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.patient_name.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.assigned_doctor.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 text-slate-800">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Online Appointment Reservations
          </h3>
          <p className="text-xs text-slate-500">
            Real-time outpatient consultation schedule • {filtered.length} scheduled visits
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search patient, phone, or doctor..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none w-full sm:w-64"
          />
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
          >
            <span>+ Book Slot</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Ref ID</th>
              <th className="py-2.5 px-3">Patient Name</th>
              <th className="py-2.5 px-3">Contact</th>
              <th className="py-2.5 px-3">Assigned Physician</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Scheduled Date</th>
              <th className="py-2.5 px-3">Time Slot</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                  No appointments registered in the database.
                </td>
              </tr>
            ) : (
              filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">{apt.reference_id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{apt.patient_name}</td>
                  <td className="py-2.5 px-3 font-mono">{apt.phone}</td>
                  <td className="py-2.5 px-3 font-semibold text-teal-800">{apt.assigned_doctor}</td>
                  <td className="py-2.5 px-3">{apt.department}</td>
                  <td className="py-2.5 px-3 font-mono">{apt.appointment_date}</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">{apt.time_slot}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        apt.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : apt.status === "Completed"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteAppointment(apt.id, apt.patient_name)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Schedule Patient Consultation</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Patil"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Clinical Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="Cardiology & Cardiac Sciences">Cardiology & Cardiac Sciences</option>
                    <option value="General Surgery & Trauma">General Surgery & Trauma</option>
                    <option value="General Medicine & Pediatrics">General Medicine & Pediatrics</option>
                    <option value="Orthopedics & Joint Replacement">Orthopedics & Joint Replacement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Time Window *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chest discomfort, post-operative follow-up"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {submitting ? "Confirming..." : "Confirm & Save Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}