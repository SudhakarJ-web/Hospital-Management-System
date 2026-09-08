"use client";

import React, { useState } from "react";
import { SharedAppointment } from "@/lib/sync/appointmentsSync";
import EditAppointmentModal from "./EditAppointmentModal";
import { Search, Edit2, Trash2, Calendar, Clock, User, Phone, CheckCircle2 } from "lucide-react";

interface AppointmentsViewProps {
  appointments: SharedAppointment[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onDeleteAppointment: (id: string) => void;
  onRefresh?: () => void;
}

export default function AppointmentsView({
  appointments,
  searchTerm,
  onSearchChange,
  onDeleteAppointment,
  onRefresh,
}: AppointmentsViewProps) {
  const [editingAppointment, setEditingAppointment] = useState<SharedAppointment | null>(null);

  const filtered = appointments.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.patient_name.toLowerCase().includes(q) ||
      a.reference_id.toLowerCase().includes(q) ||
      a.assigned_doctor.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      (a.department && a.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">
            Online Appointment Reservations
          </h3>
          <p className="text-xs text-slate-500">
            Real-time outpatient consultation schedule • {appointments.length} scheduled visits
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, phone, or doctor..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Assigned Physician</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs italic">
                    No appointments registered in the database.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id || appt.reference_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {appt.reference_id}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {appt.patient_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {appt.phone}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {appt.assigned_doctor}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {appt.department}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {appt.appointment_date}
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-700 font-bold">
                      {appt.time_slot}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          appt.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : appt.status === "Completed"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setEditingAppointment(appt)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit / Reschedule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => appt.id && onDeleteAppointment(appt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Cancel / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Appointment Dialog */}
      <EditAppointmentModal
        isOpen={!!editingAppointment}
        appointment={editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onSaved={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}