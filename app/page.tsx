"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartPulse, Stethoscope, 
  Phone, Mail, MapPin, Star, Calendar, Clock, ArrowRight,
  CheckCircle2, Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";
import { getSharedDoctors, SharedDoctor } from "@/lib/sync/doctorsSync";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Ananya Rao");
  const [selectedDepartment, setSelectedDepartment] = useState("Cardiology & Cardiac Sciences");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);

  useEffect(() => {
    setIsMounted(true);
    async function loadDoctors() {
      const liveDocs = await getSharedDoctors();
      setDoctors(liveDocs.filter((d) => d.status === "Active"));
    }
    loadDoctors();
  }, []);

  const handleOpenDoctorBooking = (docName: string, deptName: string) => {
    setSelectedDoctor(docName);
    setSelectedDepartment(deptName);
    setShowBookingModal(true);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      <Navbar />

      {feedback && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="ml-3 text-white/80 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6f4f7] via-[#f0f9fa] to-[#f8fafc] py-16 sm:py-24 px-4 sm:px-6 border-b border-teal-100/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-teal-300/60 px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-teal-800">
              NABH ACCREDITED • YOUR HEALTH IS OUR HIGHEST PRIORITY
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Compassionate Care Driven by <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-800">
              Advanced Clinical Excellence
            </span>
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed font-normal">
            Gavane Hospital & Research Centre provides round-the-clock emergency care, multi-specialty surgical suites, digital EHR consultations, and certified diagnostic laboratories.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-sm sm:max-w-none mx-auto">
            <button
              type="button"
              onClick={() => handleOpenDoctorBooking(doctors[0]?.name || "Dr. Ananya Rao", doctors[0]?.department || "Cardiology & Cardiac Sciences")}
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-600/25 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <a
              href="tel:+9102402484888"
              className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4 text-teal-600" />
              <span>Emergency 24/7 Hotline</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            {[
              { label: "24/7 Trauma Triage", sub: "Level-1 Rapid Response" },
              { label: "50+ Specialist Doctors", sub: "Multi-Disciplinary Board" },
              { label: "NABL & NABH Certified", sub: "National Quality Standard" },
              { label: "DPDP Encrypted EHR", sub: "100% Patient Privacy" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-xs border border-slate-200/80 p-3 rounded-xl">
                <div className="text-xs font-black text-slate-900">{stat.label}</div>
                <div className="text-[10px] text-teal-700 font-semibold mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1. Core Services */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">CLINICAL SOLUTIONS</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Core Services</h2>
          <p className="text-xs sm:text-sm text-slate-500">Comprehensive round-the-clock medical capabilities for patients and families.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-xl hover:border-teal-400/60 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Diagnostics</h3>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Lab Tests & High-Throughput Pathology</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>3 Tesla MRI & Digital Radiology</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span>Color Doppler & 4D Ultrasonography</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span>Cardiac Holter & 12-Lead ECG</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDoctorBooking(doctors[0]?.name || "Dr. Ananya Rao", "Pathology Laboratory")}
              className="mt-6 inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Book Diagnostic Scan <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-xl hover:border-teal-400/60 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">24-Hour Services</h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Pharmacy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Emergency Room</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Emergency Surgery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Specialist OPD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <span>Lab Tests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <span>Radiology</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDoctorBooking(doctors[0]?.name || "Dr. Priya", "General Medicine & Pediatrics")}
              className="mt-6 inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Consult On-Duty Doctor <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-xl hover:border-teal-400/60 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Emergency Care</h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Intensive CCU / ICU</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>GPS Ambulance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Trauma Surgery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Stat Lab Tests</span>
                </div>
              </div>
            </div>
            <a
              href="tel:+9102402484888"
              className="mt-6 inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              Call Trauma Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Medical Facilities */}
      <section id="facilities" className="py-16 sm:py-20 px-4 sm:px-6 bg-[#f1f7f9] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">MODERN CAMPUS</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Medical Facilities</h2>
            <p className="text-xs sm:text-sm text-slate-500">Engineered with advanced medical infrastructure and patient recovery suites.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Outpatient Services",
                desc: "Convenient, walk-in healthcare for specialist consultations, checkups, and diagnostic triage.",
                img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Inpatient Rooms",
                desc: "Comfortable, sanitized private & semi-private rooms equipped for extended clinical recovery.",
                img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Emergency Services",
                desc: "Immediate trauma assistance available round-the-clock with ventilator resuscitation units.",
                img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Diagnostics & Imaging",
                desc: "Cutting-edge 3T MRI, automated biochemistry, and expert radiological reporting.",
                img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
              },
            ].map((fac, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-44 overflow-hidden relative">
                  <img src={fac.img} alt={fac.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{fac.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{fac.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DYNAMICALLY SYNCHRONIZED Specialist Doctors List */}
      <section id="doctors" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">MEDICAL BOARD</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Specialist Doctors</h2>
          <p className="text-xs sm:text-sm text-slate-500">Board-certified clinicians offering multidisciplinary consultation and surgery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-400 transition-all text-center flex flex-col justify-between">
              <div>
                <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-3 border-teal-500 shadow-md bg-slate-100">
                  {doc.image ? (
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                      {doc.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">{doc.name}</h3>
                <p className="text-xs text-teal-700 font-bold mt-0.5">{doc.degree}</p>
                <div className="mt-3 inline-block px-3 py-1 bg-teal-50 text-teal-800 text-[11px] font-extrabold rounded-full border border-teal-200">
                  {doc.department}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-semibold">OPD Fee: {doc.fee}</p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenDoctorBooking(doc.name, doc.department)}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Book with {doc.name.split(" ")[1] || "Doctor"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Patient Testimonials */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#f1f7f9] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">PATIENT FEEDBACK</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What Our Patients Say</h2>
            <p className="text-xs sm:text-sm text-slate-500">Real recovery stories and feedback from families treated at Gavane Hospital.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "The cardiology department responded swiftly during my father's emergency. Dr. Ananya Rao's diagnosis was precise, and the ICU nursing staff provided great care.",
                name: "Mayur Jadhav",
                location: "Hadapsar, Pune",
                treatment: "Cardiac Care & CCU",
              },
              {
                quote: "Seamless patient registration, minimal waiting time at the OPD desk, and computerized prescriptions. Truly a modern and caring hospital.",
                name: "Ramesh Kulkarni",
                location: "Solapur Road, Pune",
                treatment: "General Medicine OPD",
              },
              {
                quote: "Underwent laparoscopic surgery under Dr. Sudhir Gavane. The post-operative recovery was smooth and the billing was transparent without hidden costs.",
                name: "Sunita Deshmukh",
                location: "Magarpatta, Pune",
                treatment: "General Surgery",
              },
            ].map((t, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{t.name}</div>
                    <div className="text-[10px] text-slate-400">{t.location}</div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {t.treatment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto bg-[#0b1b2b] text-slate-400 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-white font-black text-base tracking-tight mb-3">
              GAVANE<span className="text-teal-400">HOSPITAL</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NABH-accredited multi-specialty healthcare institution offering emergency trauma, digital clinical management, and dedicated outpatient care.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Gavane Hospital</Link></li>
              <li><Link href="/#services" className="hover:text-teal-400 transition-colors">Core Services</Link></li>
              <li><Link href="/#facilities" className="hover:text-teal-400 transition-colors">Medical Facilities</Link></li>
              <li><Link href="/#doctors" className="hover:text-teal-400 transition-colors">Specialist Doctors</Link></li>
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