"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SharedDoctor, getSharedDoctors } from "@/lib/sync/doctorsSync";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";
import AuthModal from "@/components/AuthModal";
import {
  Stethoscope,
  HeartPulse,
  Activity,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
} from "lucide-react";

export default function HomePage() {
  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<SharedDoctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const liveDoctors = await getSharedDoctors();
        setDoctors(liveDoctors);
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, []);

  const handleBookDoctor = (doc: SharedDoctor) => {
    setSelectedDoctor(doc);
    setIsBookingOpen(true);
  };

  const handleGeneralBooking = () => {
    setSelectedDoctor(doctors.length > 0 ? doctors[0] : null);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Emergency Utility Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-medium py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-teal-400">
            <Phone className="w-3 h-3 inline" />
            <span>Emergency 24/7: +91 0240 2484 000</span>
          </span>
          <span className="hidden sm:inline-block text-slate-500">•</span>
          <span className="hidden sm:inline-block text-slate-400">
            Hadapsar, Pune, Maharashtra
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-mono tracking-wider bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
            DPDP ACT 2023 COMPLIANT NODE
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black shadow-sm group-hover:bg-teal-800 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                GAVANE HOSPITAL
              </span>
              <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">
                Care & Clinical Excellence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="#about" className="hover:text-teal-700 transition-colors">
              About Us
            </a>
            <a href="#doctors" className="hover:text-teal-700 transition-colors">
              Our Specialists
            </a>
            <a href="#services" className="hover:text-teal-700 transition-colors">
              Facilities
            </a>
            <a href="#contact" className="hover:text-teal-700 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Staff Login</span>
            </button>
            <button
              onClick={handleGeneralBooking}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Book OPD
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white via-teal-50/20 to-slate-50 py-16 sm:py-24 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-teal-800 shadow-2xs">
            <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
            <span>Multi-Specialty Tertiary Healthcare Facility</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-none">
            Comprehensive Medical Care Driven by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">
              Clinical Excellence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Gavane Hospital & Research Centre brings together board-certified physicians, 
            cutting-edge diagnostic imaging, round-the-clock emergency triage, and modernized inpatient care.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleGeneralBooking}
              className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Schedule Outpatient Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#doctors"
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-2"
            >
              <span>Explore Specialist Directory</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-900">24/7</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emergency Triage</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-teal-700">{doctors.length}+ Specialists</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Medical Board</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paperless OPD EHR</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-emerald-600">NABH</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Standard Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist Doctors Section */}
      <section id="doctors" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[10px] font-black uppercase text-teal-700 tracking-widest bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Medical Board
          </span>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">
            Our Specialist Doctors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Board-certified clinicians offering multidisciplinary outpatient consultations and surgery.
          </p>
        </div>

        {loadingDoctors ? (
          <div className="py-16 text-center text-xs font-bold text-slate-400">
            Fetching active specialists from Supabase cluster...
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400 italic bg-white border border-slate-200 rounded-2xl">
            No specialists listed in the database yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => {
              const displayName = doc.name.replace(/^Dr\.?\s*/i, "");
              const firstName = displayName.split(" ")[0] || displayName;

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3 flex flex-col items-center">
                    <img
                      src={doc.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"}
                      alt={doc.name}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600 shadow-xs bg-slate-100 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {doc.degree}
                      </p>
                    </div>

                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {doc.department}
                    </span>

                    <p className="text-xs font-mono font-bold text-slate-700">
                      OPD Fee: <span className="text-teal-700 font-extrabold">{doc.fee || "₹500"}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookDoctor(doc)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                  >
                    Book with {firstName}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Facilities & Services Section */}
      <section id="services" className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] font-black uppercase text-teal-700 tracking-widest bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Clinical Infrastructure
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Hospital Facilities & Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Equipped with modern surgical, diagnostic, and emergency infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Modern Operation Theatres (OT)</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                HEPA-filtered laminar airflow surgical suites outfitted for minimally invasive laparoscopy, trauma repair, and emergency procedures.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Digital Radiology & Pathology</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                High-resolution ultrasound, digital X-Ray imaging, and automated clinical laboratories integrated directly with outpatient electronic health records.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Inpatient & Critical Care (IPD)</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Continuous multipara telemetry monitoring, intensive care beds, and compassionate bedside nursing protocol 24 hours a day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <Building2 className="w-5 h-5 text-teal-500" />
              <span className="font-black text-sm tracking-tight">GAVANE HOSPITAL</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Dedicated to compassionate, ethical, and clinically rigorous healthcare delivery in Pune and surrounding regions.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#about" className="hover:text-teal-400 transition-colors">About Facility</a></li>
              <li><a href="#doctors" className="hover:text-teal-400 transition-colors">Specialist Medical Board</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">Clinical Diagnostic Labs</a></li>
              <li><button onClick={() => setIsAuthOpen(true)} className="hover:text-teal-400 transition-colors cursor-pointer">Staff Access Gateway</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Contact Desk</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5 text-teal-500" /><span>+91 0240 2484 000</span></li>
              <li className="flex items-center space-x-2"><Mail className="w-3.5 h-3.5 text-teal-500" /><span>care@gavanehospital.in</span></li>
              <li className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-teal-500" /><span>Hadapsar, Pune, MH</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Compliance & Governance</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Digital Personal Data Protection (DPDP) Act 2023 compliant encrypted node. All clinical health records are strictly authenticated.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 py-4 px-4 text-center text-[10px] text-slate-600">
          © {new Date().getFullYear()} Gavane Hospital & Research Centre. Engineered by Shourya Technologies. All rights reserved.
        </div>
      </footer>

      {/* Outpatient Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        selectedDoctor={selectedDoctor}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedDoctor(null);
        }}
      />

      {/* Staff Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}