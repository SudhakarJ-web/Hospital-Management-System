"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { SharedAppointment } from "@/lib/sync/appointmentsSync";

interface AppointmentsViewProps {
  appointments: SharedAppointment[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onDeleteAppointment: (id: string, name: string) => void | Promise<void>;
}

export default function AppointmentsView({
  appointments,
  searchTerm,
  onSearchChange,
  onDeleteAppointment,
}: AppointmentsViewProps) {
  const filtered = (appointments || []).filter(
    (a) =>
      a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assigned_doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.appointment_date?.includes(searchTerm)
  );

  const totalCount = filtered.length;
  const activeCount = filtered.filter((a) => a.status === "Active").length;
  const pendingCount = filtered.filter((a) => a.status !== "Active").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            Outpatient (OPD) Appointment Bookings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Live Central Schedule • Showing {filtered.length} Booked Appointment(s)
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search patient, doctor, or date..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <MetricsStrip
        totalCount={totalCount}
        activeCount={activeCount}
        pendingCount={pendingCount}
        totalLabel="Total Bookings Received"
        activeLabel="Confirmed Slots"
        pendingLabel="Past / Cancelled"
      />

      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 min-w-[850px]">
          <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Booking Ref</th>
              <th className="px-4 py-3.5">Patient Details</th>
              <th className="px-4 py-3.5">Consultant Doctor</th>
              <th className="px-4 py-3.5">Specialty Department</th>
              <th className="px-4 py-3.5">Date & Time Slot</th>
              <th className="px-4 py-3.5">Clinical Note / Reason</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                  No appointments booked for this query.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.reference_id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900">{item.patient_name}</div>
                    <div className="text-[10px] text-slate-500">{item.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.assigned_doctor}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{item.department}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-extrabold text-teal-900">{item.appointment_date}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{item.time_slot}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{item.message || "Routine Consultation"}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onDeleteAppointment(item.id, item.patient_name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Cancel / Delete Appointment"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}