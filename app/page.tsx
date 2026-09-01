"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, Award, ShieldCheck, HeartPulse, Stethoscope, 
  Phone, Mail, MapPin, Star
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Responsive Navbar */}
      <Navbar />

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-16 right-4 z-50 p-3.5 bg-emerald-600 text-white rounded-xl shadow-xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 font-bold hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-14 sm:py-20 text-center px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-bold">
          YOUR HEALTH IS OUR PRIORITY
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mt-4 max-w-4xl mx-auto leading-tight tracking-tight">
          Your Most Trusted Healthcare Partner
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-xs sm:text-sm md:text-base leading-relaxed">
          Providing end-to-end hospital administration, clinical management, real-time doctor portals, patient OPD/IPD tracking, and automated billing workflows.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 text-center text-sm cursor-pointer"
          >
            Book Appointment
          </button>
          <Link
            href="/dashboard/doctor"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold rounded-xl transition-all active:scale-95 text-center text-sm"
          >
            Staff Portal Sign In
          </Link>
        </div>
      </section>

      {/* Core Services */}
      <section id="services" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Our Core Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { title: "24/7 Emergency Care", desc: "Rapid trauma triage, intensive resuscitation units, and dedicated round-the-clock emergency surgeons." },
            { title: "Advanced Surgery", desc: "Minimally invasive laparoscopic, robotic, and precision orthopedic surgical interventions." },
            { title: "Comprehensive Diagnostics", desc: "High-throughput NABL-certified pathology and 3 Tesla digital MRI & CT imaging." },
            { title: "Outpatient Clinics", desc: "Multi-specialty consultations with computerized prescriptions and digital EHR synchronization." },
          ].map((service, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-all group"
            >
              <Stethoscope className="text-cyan-400 w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-base sm:text-lg text-white">{service.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Preview */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white border-l-4 border-cyan-500 pl-3 mb-4">
              About Gavane Hospital
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Gavane Hospital & Research Centre is dedicated to delivering exemplary patient care through clinical innovation, advanced medical technology, and compassionate healthcare solutions.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center text-cyan-400 text-xs sm:text-sm font-semibold mt-4 hover:underline"
            >
              Read More About Us <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 h-60 sm:h-72">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80"
              alt="Gavane Hospital Campus Facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-bold text-white tracking-wide">🏥 Gavane Hospital Campus Facility</span>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Infrastructure */}
      <section id="facilities" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Facilities & Infrastructure
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { name: "Modular Operation Theatres", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80" },
            { name: "24/7 Central Pharmacy", img: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80" },
            { name: "Advanced ICU & CCU Units", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80" },
            { name: "3 Tesla MRI & Diagnostic Wing", img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80" },
          ].map((item, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-all">
              <div className="h-40 overflow-hidden relative">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <span className="text-[11px] text-teal-400 font-semibold mt-1 block">✔ Operational & Verified</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 text-slate-400 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="text-white font-bold text-base mb-3">Gavane Hospital</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              NABH accredited multi-specialty institution offering round-the-clock emergency, digital EHR, and outpatient clinical care.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link href="/#facilities" className="hover:text-cyan-400 transition-colors">Facilities</Link></li>
              <li><Link href="/dashboard/patient" className="hover:text-cyan-400 transition-colors">Patient Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-cyan-400 shrink-0" /> Healthcare City, MH</li>
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2 text-cyan-400 shrink-0" /> +91 0240 2484 888</li>
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2 text-cyan-400 shrink-0" /> info@gavanehospital.in</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Emergency Care</h4>
            <p className="text-xs text-slate-400 leading-relaxed">24/7 Trauma, ICU, and Ambulance Service available.</p>
            <p className="text-cyan-400 font-bold mt-2 text-base sm:text-lg">Call: +91 0240 2484 888</p>
          </div>
        </div>
      </footer>

      {/* Appointment Booking Pop-up Modal */}
      <AppointmentBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={(msg) => {
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 5000);
        }}
      />
    </div>
  );
}