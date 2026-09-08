"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SharedDoctor, getSharedDoctors } from "@/lib/sync/doctorsSync";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";
import AuthModal from "@/components/AuthModal";
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Building2,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<SharedDoctor | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"admin" | "doctor" | "medical" | "support">("doctor");

  useEffect(() => {
    async function loadDoctors() {
      const data = await getSharedDoctors();
      setDoctors(data);
    }
    loadDoctors();

    // Check if user was redirected to login
    const loginQuery = searchParams.get("login");
    if (loginQuery && ["admin", "doctor", "medical", "support"].includes(loginQuery)) {
      setAuthRole(loginQuery as any);
      setAuthModalOpen(true);
    }
  }, [searchParams]);

  const openBooking = (doc?: SharedDoctor) => {
    setSelectedDoctor(doc || null);
    setBookingModalOpen(true);
  };

  const openAuth = (role: "admin" | "doctor" | "medical" | "support") => {
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-6 py-2 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-teal-400" />
            <span>Emergency 24/7: <strong>+91 0240 2484 000</strong></span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center space-x-1.5 hidden sm:flex">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Hadapsar, Pune, Maharashtra</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-teal-400">
          DPDP ACT 2023 COMPLIANT NODE
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900">
              GAVANE HOSPITAL
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-teal-700">
              Care & Clinical Excellence
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
          <a href="#specialists" className="hover:text-teal-700 transition-colors">Our Specialists</a>
          <a href="#facilities" className="hover:text-teal-700 transition-colors">Facilities</a>
          <a href="#about" className="hover:text-teal-700 transition-colors">About Us</a>
        </nav>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => openAuth("doctor")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Staff Login</span>
          </button>
          <button
            onClick={() => openBooking()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Book OPD
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full text-teal-800 text-xs font-extrabold">
          <Award className="w-4 h-4 text-teal-600" />
          <span>Multi-Specialty Tertiary Healthcare Facility</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Comprehensive Medical Care <br />
          <span className="text-teal-600">Driven by Clinical Excellence</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Gavane Hospital & Research Centre brings together board-certified physicians,
          cutting-edge diagnostic imaging, round-the-clock emergency triage, and modernized inpatient care.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openBooking()}
            className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>Schedule Outpatient Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#specialists"
            className="px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all"
          >
            Explore Specialist Directory
          </a>
        </div>

        {/* Highlight KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-left space-y-1">
            <div className="text-2xl font-black text-slate-900">24/7</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emergency Triage</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-left space-y-1">
            <div className="text-2xl font-black text-slate-900">{doctors.length}+ Specialists</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Medical Board</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-left space-y-1">
            <div className="text-2xl font-black text-slate-900">100%</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paperless OPD EHR</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-left space-y-1">
            <div className="text-2xl font-black text-slate-900">NABH</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Standard Compliance</div>
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section id="specialists" className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Medical Board
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Our Specialist Doctors
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Board-certified clinicians offering multidisciplinary outpatient consultations and surgery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 rounded-3xl border border-slate-200 p-5 flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow"
              >
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600 bg-slate-200 shadow-xs"
                />
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-slate-900">{doc.name}</h4>
                  <p className="text-xs font-bold text-teal-700">{doc.degree}</p>
                  <span className="text-[11px] text-slate-500 block font-medium">{doc.department}</span>
                </div>

                <div className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 w-full">
                  OPD Fee: <strong className="text-teal-700">{doc.fee}</strong>
                </div>

                <button
                  onClick={() => openBooking(doc)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Book with {doc.name.split(" ")[1] || doc.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-6 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-white">Gavane Hospital & Research Centre</span> • Hadapsar, Pune.
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Powered by Shourya Technologies • NABH Standard Infrastructure
          </div>
        </div>
      </footer>

      {/* Outpatient Booking Dialog */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        selectedDoctor={selectedDoctor}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Staff Authentication Gateway Dialog */}
      <AuthModal
        isOpen={authModalOpen}
        defaultRole={authRole}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}