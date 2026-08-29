"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, ShieldCheck, HeartPulse, Stethoscope, Users, Building, 
  CheckCircle2, Target, Eye, Compass, Phone, Mail, MapPin, ArrowRight 
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Responsive Navbar */}
      <Navbar />

      {/* Hero Banner */}
      <section className="relative py-16 sm:py-24 text-center px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3.5 py-1 rounded-full border border-cyan-500/20 font-extrabold">
            Pioneering Healthcare Since 2011
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Compassionate Care Driven by Clinical Innovation
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
            Gavane Hospital & Research Centre is an NABH-accredited multi-specialty institution committed to accessible, world-class medical science, digital EHR integrations, and patient-centered excellence.
          </p>
        </div>
      </section>

      {/* Mission, Vision & Core Values */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              To deliver compassionate, ethical, and evidence-based tertiary healthcare to every citizen through clinical precision, advanced technology, and multidisciplinary expertise.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              To be recognized as a premier benchmark for surgical safety, diagnostic accuracy, and digitized patient empowerment across Maharashtra and western India.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white">Core Values</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Integrity, clinical transparency, continuous medical education, patient dignity, and uncompromised adherence to statutory data protection standards.
            </p>
          </div>
        </div>
      </section>

      {/* Institutional Story & Infrastructure */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 h-72 sm:h-96">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
              alt="Gavane Hospital Infrastructure"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">
                  Infrastructure
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  200-Bed Tertiary Care Facility with 4 Modular OTs & Dedicated CCU
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight border-l-4 border-cyan-500 pl-3">
              A Legacy of Clinical Integrity
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Established with a clear objective to democratize super-specialty medical services, Gavane Hospital has grown from an acute nursing station into a 200-bed tertiary care centre.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Equipped with 3 Tesla MRI systems, high-speed multi-slice CT scanners, digital catheterization labs, and automated pathology suites, our campus serves more than 50,000 outpatients annually while maintaining high clinical survival rates.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                "NABH & NABL Accredited",
                "24/7 Level-1 Trauma Wing",
                "DPDP & DISHA Encrypted EHR",
                "Cashless TPA Empanelment",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Medical Board */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Institutional Leadership
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Guided by distinguished clinicians, surgeons, and healthcare administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Dr. A. Gavane",
              role: "Founder & Chairman",
              qual: "MD, FRCS (General & Laparoscopic Surgery)",
              image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
              bio: "Over 25 years of surgical excellence with international fellowships across minimally invasive abdominal procedures.",
            },
            {
              name: "Dr. Ananya Rao",
              role: "Chief of Medical Staff",
              qual: "MBBS, MD (Cardiology), FACC",
              image: "https://images.unsplash.com/photo-1594824813629-9e8c45f448ea?auto=format&fit=crop&w=800&q=80",
              bio: "Senior Interventional Cardiologist specializing in acute coronary triage and critical cardiac interventions.",
            },
            {
              name: "Dr. Sudhir Gavane",
              role: "Director of Clinical Operations",
              qual: "MS (Orthopedics), M.Ch",
              image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80",
              bio: "Pioneer in robotic joint replacements and comprehensive musculoskeletal trauma rehabilitation programs.",
            },
          ].map((leader, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-colors p-6 space-y-4 text-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto overflow-hidden border-2 border-teal-500/40 shadow-lg">
                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{leader.name}</h3>
                <p className="text-xs text-teal-400 font-semibold">{leader.role}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{leader.qual}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{leader.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Numerical Impact Metrics */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-cyan-400">50K+</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Patients Treated</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-cyan-400">10K+</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Surgeries Completed</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-cyan-400">50+</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Specialist Consultants</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-cyan-400">99.4%</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Diagnostic Precision</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ready to Consult with Our Specialists?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Schedule an outpatient consultation, verify patient records, or reach out to our 24/7 medical triage team.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/contact"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 text-xs sm:text-sm"
          >
            Book an Appointment
          </Link>
          <Link
            href="/dashboard/patient"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold rounded-xl transition-all active:scale-95 text-xs sm:text-sm"
          >
            Access Patient Vault
          </Link>
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
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link href="/#facilities" className="hover:text-cyan-400 transition-colors">Facilities</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Emergency & Contact</Link></li>
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
        <div className="text-center text-xs border-t border-slate-800 mt-8 sm:mt-12 pt-6 text-slate-500">
          Designed & Engineered by Shourya Technologies • Gavane Hospital & Research Centre
        </div>
      </footer>
    </div>
  );
}