"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, Award, ShieldCheck, HeartPulse, Stethoscope, 
  Phone, Mail, MapPin, Star
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Dynamic Responsive Navbar */}
      <Navbar
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenPatientModal={() => router.push("/dashboard/patient")}
      />

      {/* Staff Login Modal Component */}
      <AuthModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        initialRole="doctor"
      />

      {/* Hero Section */}
      <section className="relative py-14 sm:py-20 text-center px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-bold">
          Hospital Management System
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mt-4 max-w-4xl mx-auto leading-tight tracking-tight">
          Your Most Trusted Healthcare Partner
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-xs sm:text-sm md:text-base leading-relaxed">
          Providing end-to-end hospital administration, clinical management, real-time doctor portals, patient OPD/IPD tracking, and automated billing workflows.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
          <Link
            href="/contact"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 text-center text-sm"
          >
            Book Appointment
          </Link>
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold rounded-xl transition-all active:scale-95 text-center text-sm"
          >
            Staff Portal Sign In
          </button>
        </div>
      </section>

      {/* 1. Services Slider / Cards */}
      <section id="services" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Our Core Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {["24/7 Emergency Care", "Advanced Surgery", "Comprehensive Diagnostics", "Outpatient Clinics"].map((service, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-all group"
            >
              <Stethoscope className="text-cyan-400 w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-base sm:text-lg text-white">{service}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Providing state-of-the-art care with advanced medical equipment and rapid triage.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. About Us */}
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
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl h-48 sm:h-64 flex items-center justify-center text-slate-500 text-sm font-medium">
            🏥 Gavane Hospital Campus Facility
          </div>
        </div>
      </section>

      {/* 3. Chairman's Message */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 grid md:grid-cols-3 gap-6 md:gap-8 items-center">
          <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl h-44 sm:h-48 flex items-center justify-center text-slate-500 text-sm font-medium">
            👨‍⚕️ Dr. A. Gavane
          </div>
          <div className="md:col-span-2 space-y-2">
            <blockquote className="text-base sm:text-lg italic text-slate-200 leading-relaxed">
              "Our mission is to make world-class healthcare accessible, affordable, and compassionate for every individual."
            </blockquote>
            <h3 className="text-lg sm:text-xl font-bold text-white pt-2">Dr. A. Gavane</h3>
            <p className="text-cyan-400 text-xs sm:text-sm">MD, FRCS — Founder & Chairman</p>
          </div>
        </div>
      </section>

      {/* 4. Doctors */}
      <section id="doctors" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Our Specialist Doctors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { name: "Dr. Sarah Jenkins", degree: "MD, Cardiology", spec: "Senior Cardiologist", icon: "🩺" },
            { name: "Dr. Rajesh Kumar", degree: "MS, Orthopedics", spec: "Joint Replacement Specialist", icon: "🦴" },
            { name: "Dr. Elena Rostova", degree: "DM, Neurology", spec: "Neurologist", icon: "🧠" }
          ].map((doc, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center hover:border-cyan-500/40 transition-colors">
              <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl border border-slate-700">
                {doc.icon}
              </div>
              <h3 className="font-bold text-white text-base sm:text-lg">{doc.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{doc.degree}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-slate-800 text-cyan-400 text-[11px] font-semibold rounded-full border border-slate-700">
                {doc.spec}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Centres of Excellence */}
      <section id="centres" className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
            Centres of Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {["Cardiology & Cardiac Surgery", "Oncology & Cancer Care", "Neurosciences & Neurosurgery"].map((centre, i) => (
              <div key={i} className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <HeartPulse className="text-cyan-400 w-7 h-7 mb-2" />
                <h3 className="font-bold text-white text-base sm:text-lg">{centre}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Comprehensive multi-disciplinary care standard with advanced intensive units.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Facilities */}
      <section id="facilities" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Facilities & Infrastructure
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {["Modular OTs", "24/7 Pharmacy", "Advanced ICU/CCU", "3 Tesla MRI & CT"].map((item, i) => (
            <div key={i} className="p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs sm:text-sm font-semibold flex items-center">
              <span className="text-teal-400 mr-2">✔</span> {item}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Why Choose Us? */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
            Why Choose Gavane Hospital
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "24/7 Availability", desc: "Emergency response and trauma care team ready around the clock." },
              { title: "Advanced Technology", desc: "Equipped with state-of-the-art robotic and diagnostic instruments." },
              { title: "Expert Care", desc: "Over 50+ experienced consultants, surgeons, and trained clinical nurses." }
            ].map((reason, i) => (
              <div key={i} className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <ShieldCheck className="text-cyan-400 w-7 h-7 mb-2" />
                <h3 className="font-bold text-white text-base sm:text-lg">{reason.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Certifications & Accreditations */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Accreditations & Certifications</h2>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
          {["NABH Accredited", "NABL Certified Lab", "ISO 9001:2015", "JCI Standards"].map((cert, i) => (
            <div key={i} className="px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold text-xs sm:text-sm flex items-center">
              <Award className="w-4 h-4 mr-2 text-cyan-400" />
              {cert}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Insurance Availability */}
      <section id="insurance" className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Insurance & Cashless Empanelment</h2>
          <p className="text-xs text-slate-400 mb-6">Partnered with top health insurance providers and TPAs.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 text-xs font-semibold text-slate-300">
            {["Star Health", "HDFC ERGO", "ICICI Lombard", "Care Health", "Max Bupa", "Bajaj Allianz"].map((ins, i) => (
              <div key={i} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
                {ins}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Patient Testimonials */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Patient Testimonials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[
            { quote: "The doctors and staff provided exceptional clinical care during my surgery. Seamless coordination and compassionate staff.", name: "Anand Verma" },
            { quote: "Top-notch emergency care. The triage and admission handled everything quickly without delay.", name: "Priya Sharma" }
          ].map((t, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              <p className="text-xs font-bold text-white mt-4">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Milestones & Achievements */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-8">Milestones & Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><p className="text-2xl sm:text-4xl font-extrabold text-cyan-400">50,000+</p><p className="text-[11px] sm:text-xs text-slate-400 mt-1">Patients Treated</p></div>
            <div><p className="text-2xl sm:text-4xl font-extrabold text-cyan-400">10,000+</p><p className="text-[11px] sm:text-xs text-slate-400 mt-1">Surgeries Performed</p></div>
            <div><p className="text-2xl sm:text-4xl font-extrabold text-cyan-400">50+</p><p className="text-[11px] sm:text-xs text-slate-400 mt-1">Specialist Doctors</p></div>
            <div><p className="text-2xl sm:text-4xl font-extrabold text-cyan-400">15+</p><p className="text-[11px] sm:text-xs text-slate-400 mt-1">Years Excellence</p></div>
          </div>
        </div>
      </section>

      {/* 12. Blogs & Events */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
          Latest Blogs & Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { title: "Understanding Heart Health in 2026", date: "Aug 15, 2026" },
            { title: "Free Cardiac Health Checkup Camp", date: "Sep 01, 2026" },
            { title: "Advancements in Minimally Invasive Surgery", date: "Jul 20, 2026" }
          ].map((blog, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 hover:border-cyan-500/30 transition-colors">
              <p className="text-xs text-cyan-400 font-semibold">{blog.date}</p>
              <h3 className="font-bold text-white text-base mt-2">{blog.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Read evidence-based insights and advice from our clinical doctors.</p>
            </div>
          ))}
        </div>
      </section>

      {/* 13. Careers */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Join Our Team</h2>
        <p className="text-xs text-slate-400 mb-6">Explore career opportunities across medical, nursing, and hospital administration.</p>
        <Link
          href="/contact"
          className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs uppercase tracking-wider rounded-xl transition border border-slate-700"
        >
          View Open Positions
        </Link>
      </section>

      {/* 14. Footer */}
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
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact & Triage</Link></li>
              <li><Link href="#services" className="hover:text-cyan-400 transition-colors">Core Services</Link></li>
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
        <div className="text-center text-xs border-t border-slate-800 mt-8 sm:mt-12 pt-6 text-slate-500">
          Designed & Engineered by Shourya Technologies • Gavane Hospital & Research Centre
        </div>
      </footer>
    </div>
  );
}