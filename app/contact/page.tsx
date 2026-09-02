"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Phone, Mail, MapPin, Clock, Calendar, ShieldCheck, 
  CheckCircle2, Sparkles, Send, Stethoscope, AlertTriangle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { saveSharedAppointment, SharedAppointment } from "@/lib/sync/appointmentsSync";
import { saveSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";

const DEPARTMENTS = [
  "Cardiology & Cardiac Sciences",
  "General Surgery & Trauma",
  "General Medicine & Pediatrics",
  "Orthopedics & Joint Replacement",
  "Neurology & Neurosciences",
  "Radiology & Imaging",
  "Pathology Laboratory",
];

const DOCTOR_MAPPING: Record<string, string[]> = {
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

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [doctor, setDoctor] = useState(DOCTOR_MAPPING[DEPARTMENTS[0]][0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<SharedAppointment | null>(null);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setDepartment(selected);
    const docs = DOCTOR_MAPPING[selected] || ["Dr. Priya"];
    setDoctor(docs[0]);
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
      message: message.trim() || "Consultation requested through web contact portal",
      status: "Active",
      created_at: new Date().toLocaleDateString("en-IN"),
    };

    // 1. Sync to central appointment desk
    await saveSharedAppointment(newAppointment);

    // 2. Sync to active triage and patient registry
    const newPt: SharedPatient = {
      id: `pat-${Date.now()}`,
      reference_id: `GH-2026-REG${randomSuffix}`,
      full_name: name.trim(),
      phone: phone.trim(),
      department,
      assigned_doctor: doctor,
      notes: `Web Booking: ${date || "Today"} (${timeSlot}) • Email: ${email.trim() || "N/A"}`,
      status: "Active",
      created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };
    await saveSharedPatient(newPt);

    setLoading(false);
    setConfirmedBooking(newAppointment);
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setName("");
    setEmail("");
    setPhone("");
    setDate("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6f4f7] via-[#f0f9fa] to-[#f8fafc] py-14 sm:py-20 px-4 sm:px-6 border-b border-teal-100/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-teal-300/60 px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-teal-800">
              24/7 PATIENT SUPPORT & OUTPATIENT REGISTRATION
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Connect with Our Clinical Staff
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Have a question, require emergency assistance, or need to schedule an in-person consultation? Fill out the booking form below or reach our 24/7 triage helpline.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-12 sm:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Campus Information & Quick Contacts (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 24/7 Trauma Emergency Card */}
            <div className="bg-gradient-to-br from-rose-50 to-white rounded-3xl p-6 sm:p-7 border border-rose-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Immediate Response</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">Emergency & Trauma Triage</h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For ambulance dispatch, acute trauma admissions, or ICU care, call our priority emergency line directly:
              </p>
              <a
                href="tel:+9102402484888"
                className="mt-4 flex items-center justify-between p-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-md transition-colors text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 0240 2484 888</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">24/7 Line</span>
              </a>
            </div>

            {/* Hospital Contact Info Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-black text-slate-900 border-l-4 border-teal-500 pl-3">
                Hospital Campus & Coordinates
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Hospital Address</div>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Gavane Hospital & Research Centre, Pune-Solapur Road, Hadapsar, Pune, Maharashtra 411028
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">General Inquiries & Billing</div>
                    <p className="text-slate-500 mt-0.5">info@gavanehospital.in</p>
                    <p className="text-slate-500">support@gavanehospital.in</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Working Hours</div>
                    <p className="text-slate-500 mt-0.5">OPD Clinics: 08:30 AM – 08:00 PM (Mon – Sat)</p>
                    <p className="text-teal-700 font-semibold mt-0.5">Casualty & Emergency: Open 24/7 Every Day</p>
                  </div>
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-extrabold text-slate-600">
                <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>NABH Accredited</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>DPDP 2023 Compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Appointment & Booking Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              
              {confirmedBooking ? (
                /* Success Confirmation State */
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Booking Confirmed
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      Appointment Booked Successfully!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Your consultation token is registered and synchronized with {confirmedBooking.assigned_doctor}&apos;s clinical OPD schedule and the front desk triage desk.
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-xs max-w-lg mx-auto">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Booking Reference:</span>
                      <span className="font-extrabold text-teal-700">{confirmedBooking.reference_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Patient Full Name:</span>
                      <span className="font-bold text-slate-900">{confirmedBooking.patient_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Attending Consultant:</span>
                      <span className="font-bold text-slate-900">{confirmedBooking.assigned_doctor}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Specialty Department:</span>
                      <span className="font-medium text-slate-800">{confirmedBooking.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Slot:</span>
                      <span className="font-bold text-teal-800">{confirmedBooking.appointment_date} • {confirmedBooking.time_slot}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={handleReset}
                      type="button"
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Book Another Appointment
                    </button>
                    <Link
                      href="/"
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Back to Homepage
                    </Link>
                  </div>
                </div>
              ) : (
                /* Interactive Form State */
                <>
                  <div className="mb-6 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                      Outpatient Portal
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                      Schedule a Specialist Consultation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select your preferred clinical department and physician to confirm an active OPD consultation slot.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Patient Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kulkarni"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Contact Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. patient@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Clinical Department *
                        </label>
                        <select
                          value={department}
                          onChange={handleDepartmentChange}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                        >
                          {DEPARTMENTS.map((dept, idx) => (
                            <option key={idx} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Consultant Doctor *
                        </label>
                        <select
                          value={doctor}
                          onChange={(e) => setDoctor(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                        >
                          {(DOCTOR_MAPPING[department] || ["Dr. Priya"]).map((docName, idx) => (
                            <option key={idx} value={docName}>{docName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Desired Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Time Slot *
                        </label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
                        >
                          {TIME_SLOTS.map((slot, idx) => (
                            <option key={idx} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Symptoms / Clinical Concerns
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe your symptoms, existing medical reports, or previous history..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? "Confirming Consultation..." : "Submit & Confirm Appointment"}</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#0b1b2b] text-slate-400 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-white font-black text-base tracking-tight mb-3">
              GAVANE <span className="text-teal-400">HOSPITAL</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NABH-accredited multi-specialty healthcare institution offering emergency trauma, digital clinical management, and dedicated outpatient care.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-teal-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact & Appointments</Link></li>
              <li><Link href="/dashboard/patient" className="hover:text-teal-400 transition-colors">Citizen Vault</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Campus Contact</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-teal-400 shrink-0" /> Hadapsar, Pune, MH</li>
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2 text-teal-400 shrink-0" /> +91 0240 2484 888</li>
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2 text-teal-400 shrink-0" /> info@gavanehospital.in</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Emergency Triage</h4>
            <p className="text-xs text-slate-400 leading-relaxed">24/7 Trauma, ICU, and Ambulance Service available.</p>
            <p className="text-teal-400 font-extrabold mt-2 text-base">Call: +91 0240 2484 888</p>
          </div>
        </div>
        <div className="text-center text-xs border-t border-slate-800/80 mt-10 pt-6 text-slate-500">
          Designed & Engineered by Shourya Technologies • Gavane Hospital & Research Centre
        </div>
      </footer>
    </div>
  );
}