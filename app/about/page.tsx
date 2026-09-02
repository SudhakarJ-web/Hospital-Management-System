"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, ShieldCheck, HeartPulse, Stethoscope, Building2, 
  CheckCircle2, Target, Eye, Compass, Phone, Mail, MapPin, 
  ArrowRight, Calendar, Sparkles, Users, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";

export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Ananya Rao");
  const [selectedDepartment, setSelectedDepartment] = useState("Cardiology & Cardiac Sciences");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOpenDoctorBooking = (docName: string, deptName: string) => {
    setSelectedDoctor(docName);
    setSelectedDepartment(deptName);
    setShowBookingModal(true);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Floating Feedback Notification */}
      {feedback && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="ml-3 text-white/80 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6f4f7] via-[#f0f9fa] to-[#f8fafc] py-16 sm:py-24 px-4 sm:px-6 border-b border-teal-100/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-teal-300/60 px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-teal-800">
              PIONEERING HEALTHCARE EXCELLENCE SINCE 2011
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Dedicated to Healing, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-800">
              Driven by Medical Science
            </span>
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Gavane Hospital & Research Centre is an NABH-accredited multi-specialty institution built to provide accessible, ethical, and advanced clinical care to every individual.
          </p>
        </div>
      </section>

      {/* 1. Mission, Vision & Values */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-400/60 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">
                To deliver compassionate, ethical, and evidence-based tertiary healthcare to every citizen through clinical precision, advanced technology, and multidisciplinary expertise.
              </p>
            </div>
            <div className="text-[11px] font-bold text-teal-700 pt-3">Patient-Centered Outcomes</div>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-400/60 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">
                To be recognized as a premier benchmark for surgical safety, diagnostic accuracy, and digitized patient empowerment across Maharashtra and western India.
              </p>
            </div>
            <div className="text-[11px] font-bold text-cyan-700 pt-3">Clinical Precision & Trust</div>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-400/60 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Core Values</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">
                Integrity, clinical transparency, continuous medical education, patient dignity, and uncompromised adherence to statutory data protection standards.
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-700 pt-3">Ethics & Transparency</div>
          </div>
        </div>
      </section>

      {/* 2. Institutional Heritage & Campus Infrastructure */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#f1f7f9] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 h-72 sm:h-96">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80"
              alt="Gavane Hospital Infrastructure"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                  CAMPUS FACILITY
                </span>
                <p className="text-sm sm:text-base font-bold text-white mt-1">
                  200-Bed Tertiary Care Facility with 4 Modular OTs & Dedicated CCU
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">OUR STORY</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A Legacy of Clinical Integrity & Healthcare Innovation
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Established with the fundamental goal of democratizing super-specialty medical services, Gavane Hospital has grown from an acute nursing center into a premier 200-bed multi-specialty institution.
            </p>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Equipped with high-throughput NABL-certified pathology labs, 3 Tesla digital MRI & CT suites, and dedicated round-the-clock emergency triage, our hospital caters to thousands of patients annually with exemplary clinical recovery rates.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                "NABH & NABL Accredited",
                "24/7 Level-1 Trauma Wing",
                "DPDP & DISHA Encrypted EHR",
                "Cashless TPA Empanelment",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Leadership & Medical Board */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">LEADERSHIP TEAM</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Leadership & Specialists
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Guided by distinguished clinicians, surgeons, and medical administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Dr. Sudhir Gavane",
              role: "Chief Surgical Specialist & Founder",
              degree: "MS (General & Laparoscopic Surgery), M.Ch",
              dept: "General Surgery & Trauma",
              image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
              bio: "Over 20 years of surgical experience specializing in minimally invasive laparoscopic abdominal interventions and polytrauma management.",
            },
            {
              name: "Dr. Ananya Rao",
              role: "Chief of Medical Staff",
              degree: "MBBS, MD (Cardiology), FACC",
              dept: "Cardiology & Cardiac Sciences",
              image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
              bio: "Senior Interventional Cardiologist specializing in acute coronary triage, preventative heart care, and critical cardiac interventions.",
            },
            {
              name: "Dr. Priya",
              role: "Director of Clinical Operations",
              degree: "MD (Internal Medicine & Pediatrics)",
              dept: "General Medicine & Pediatrics",
              image: "https://images.unsplash.com/photo-1594824813629-9e8c45f448ea?auto=format&fit=crop&w=800&q=80",
              bio: "Consultant Physician championing evidence-based pediatric care, lifestyle medicine protocols, and automated outpatient workflows.",
            },
          ].map((leader, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-400 transition-all text-center flex flex-col justify-between"
            >
              <div>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-4 overflow-hidden border-3 border-teal-500 shadow-md">
                  <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{leader.name}</h3>
                <p className="text-xs text-teal-700 font-bold mt-0.5">{leader.role}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-teal-50 text-teal-800 text-[10px] font-extrabold rounded-full border border-teal-200">
                  {leader.degree}
                </div>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">{leader.bio}</p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenDoctorBooking(leader.name, leader.dept)}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Book with {leader.name.split(" ")[1] || "Doctor"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Numerical Impact Metrics */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 bg-[#f1f7f9] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-teal-600">50K+</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Patients Treated</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-teal-600">10K+</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Surgeries Concluded</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-teal-600">50+</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Specialist Consultants</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-teal-600">99.4%</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Diagnostic Precision</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Card */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Consult with Our Specialist Clinicians Today
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Schedule an in-person outpatient consultation, access the citizen vault, or reach our 24/7 medical triage team.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3.5 max-w-sm sm:max-w-none mx-auto">
          <button
            type="button"
            onClick={() => handleOpenDoctorBooking("Dr. Ananya Rao", "Cardiology & Cardiac Sciences")}
            className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-600/20 transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            Book Appointment
          </button>
          <Link
            href="/dashboard/patient"
            className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-2xl transition-all active:scale-95 text-xs sm:text-sm"
          >
            Access Patient Vault
          </Link>
        </div>
      </section>

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
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Gavane Hospital</Link></li>
              <li><Link href="/#services" className="hover:text-teal-400 transition-colors">Core Services</Link></li>
              <li><Link href="/#facilities" className="hover:text-teal-400 transition-colors">Medical Facilities</Link></li>
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

      {/* Auto-Populated Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        initialDoctor={selectedDoctor}
        initialDepartment={selectedDepartment}
        onSuccess={(msg) => {
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 6000);
        }}
      />
    </div>
  );
}