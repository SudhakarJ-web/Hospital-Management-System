"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Lock,
  HeartPulse,
  Scissors,
  Baby,
  Bone,
  BedDouble,
  Scan,
  FlaskConical,
  Pill,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building2,
  FileText,
  Mail,
  HelpCircle,
  Star,
  Quote,
} from "lucide-react";

function LandingPageContent() {
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

  // Clinical Specialties Data
  const services = [
    {
      icon: HeartPulse,
      title: "Cardiology & Cardiac Sciences",
      desc: "Advanced non-invasive cardiology, 2D Echocardiography, Holter monitoring, preventive vascular profiling, and post-infarct cardiac rehabilitation.",
      highlights: ["Color Doppler Echocardiography", "Hypertension & Lipid Clinics", "TMT Stress Analysis"],
    },
    {
      icon: Scissors,
      title: "General & Laparoscopic Surgery",
      desc: "Minimally invasive keyhole procedures, acute trauma surgical repair, hernioplasty, cholecystectomy, and advanced GI tract surgeries.",
      highlights: ["Storz 4K Laparoscopy Towers", "Daycare Surgical Discharge", "Post-Op Enhanced Recovery"],
    },
    {
      icon: Baby,
      title: "Pediatrics & Neonatal Care",
      desc: "Comprehensive child health diagnostics, immunization schedules, neonatal intensive surveillance, and adolescent developmental medicine.",
      highlights: ["Level-II Pediatric Phototherapy", "Child Vaccination Tracker", "Seasonal Infectious Triage"],
    },
    {
      icon: Bone,
      title: "Orthopedics & Joint Reconstruction",
      desc: "Arthroscopic repairs, complicated polytrauma fracture stabilization, degenerative joint arthritis management, and spine rehabilitation.",
      highlights: ["C-Arm Guided Interventions", "Trauma Emergency Reduction", "Dedicated Physiotherapy Wing"],
    },
    {
      icon: BedDouble,
      title: "Intensive Critical Care (ICU)",
      desc: "Multi-parameter high-acuity hemodynamic monitoring, motorized ventilators, acute septicemia management, and 24/7 dedicated intensivist bedside rounds.",
      highlights: ["Invasive Arterial Blood Pressure", "High-Flow Nasal Oxygen (HFNO)", "Continuous Bedside ABG"],
    },
    {
      icon: Scan,
      title: "Diagnostic Radiology & Imaging",
      desc: "High-frequency digital radiography, real-time ultrasonography, musculoskeletal scans, color vascular Doppler, and interventional ultrasound guidance.",
      highlights: ["Low Radiation Dose Protocols", "Instant Picture Archival (PACS)", "Emergency Bedside Ultrasound"],
    },
  ];

  // Core Hospital Infrastructure Amenities
  const facilities = [
    {
      icon: Pill,
      title: "24/7 Licensed In-House Pharmacy",
      desc: "Certified pharmaceutical store stocking critical care ampoules, specialty oncology & cardiac drugs, surgical consumables, and outpatient prescriptions.",
    },
    {
      icon: FlaskConical,
      title: "Fully Automated Pathology Lab",
      desc: "Biochemistry, Hematology, Immunoassays, and Serology powered by robotic analyzers with barcode verification and digital report SMS dispatch.",
    },
    {
      icon: Building2,
      title: "HEPA-Filtered Modular OT Complex",
      desc: "Laminar airflow operation theatres engineered with positive pressure micro-filtration to eliminate surgical site infection vectors.",
    },
    {
      icon: ShieldCheck,
      title: "DPDP 2023 Digital Clinical EHR",
      desc: "100% paperless medical records governance protecting sensitive diagnostic records with state-of-the-art cryptographic encryption.",
    },
  ];

  // Verified Patient Experiences
  const testimonials = [
    {
      name: "Sunil Mane",
      treatment: "Cardiac Outpatient & Preventive Cardiology",
      comment:
        "The OPD consultation was completely seamless. From registration to digital prescription generation, everything was transparent and prompt without long waiting queues.",
      rating: 5,
    },
    {
      name: "Sunita Deshmukh",
      treatment: "Laparoscopic Cholecystectomy",
      comment:
        "Dr. Sudhir Gavane and the nursing team provided exemplary surgical care. The hospital infrastructure and sterile OT environment gave my entire family great confidence.",
      rating: 5,
    },
    {
      name: "Aarav Kulkarni's Family",
      treatment: "Pediatric Emergency & Inpatient Care",
      comment:
        "Outstanding clinical competence. Dr. Priya diagnosed our child's persistent seasonal fever accurately within hours. The staff is polite, compassionate, and attentive.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. TOP EMERGENCY & ACCREDITATION BANNER */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span>
              24/7 Emergency & Ambulance:{" "}
              <strong className="text-white hover:underline">+91 0240 2484 000</strong>
            </span>
          </div>
          <span className="text-slate-700 hidden md:inline">|</span>
          <div className="flex items-center space-x-1.5 hidden md:flex">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Hadapsar-Saswad Road, Hadapsar, Pune, Maharashtra 411028</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
            NABH ACCREDITED FACILITY
          </span>
          <span className="text-slate-400 hidden lg:inline">
            DPDP ACT 2023 COMPLIANT NODE
          </span>
        </div>
      </div>

      {/* 2. MODERN GLASSMORPHISM HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm ring-4 ring-teal-50">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              GAVANE HOSPITAL
            </h1>
            <p className="text-[10px] uppercase font-black tracking-wider text-teal-700 mt-0.5">
              & Research Centre • Care & Clinical Excellence
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-600">
          <a href="#services" className="hover:text-teal-700 transition-colors">
            Clinical Specialties
          </a>
          <a href="#specialists" className="hover:text-teal-700 transition-colors">
            Specialist Consultants
          </a>
          <a href="#facilities" className="hover:text-teal-700 transition-colors">
            Infrastructure & OT
          </a>
          <a href="#about" className="hover:text-teal-700 transition-colors">
            Governance & Quality
          </a>
          <a href="#contact" className="hover:text-teal-700 transition-colors">
            Emergency & Contact
          </a>
        </nav>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => openAuth("doctor")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Staff Login</span>
          </button>
          <button
            onClick={() => openBooking()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book OPD</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-200 bg-gradient-to-b from-teal-50/40 via-white to-slate-50">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-teal-100/70 border border-teal-200 px-4 py-1.5 rounded-full text-teal-900 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Multi-Specialty Tertiary Healthcare Facility • Hadapsar, Pune</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Comprehensive Medical Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
              Driven by Clinical Excellence
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Gavane Hospital & Research Centre unites board-certified surgeons, specialized
            physicians, 24/7 modular emergency triage, cutting-edge diagnostic radiology,
            and paperless outpatient EHR workflows for patient-centric recovery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => openBooking()}
              className="px-7 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Schedule Outpatient Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#specialists"
              className="px-6 py-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all shadow-2xs"
            >
              Explore Specialist Directory
            </a>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-10 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-3xl font-black text-slate-900">24/7</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Emergency & Trauma Triage
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">Immediate resuscitation bed</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-3xl font-black text-slate-900">{doctors.length}+ Specialists</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Medical Board Directory
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">Board-certified consultants</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-3xl font-black text-slate-900">100%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Paperless OPD EHR
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">Direct digital Rx transmission</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-3xl font-black text-slate-900">NABH</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Standard Compliance
              </div>
              <p className="text-[11px] text-teal-700 font-semibold">Clean sterile infection control</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLINICAL SPECIALTIES & EXPERTISE SECTION */}
      <section id="services" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Centres of Clinical Excellence
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Specialized Medical & Surgical Services
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated hospital departments providing inpatient, outpatient, and diagnostic care tailored to precision recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 hover:border-teal-300 space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 group-hover:text-teal-800 transition-colors">
                    {srv.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  {srv.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center space-x-2 text-[11px] font-semibold text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LIVE SPECIALIST DOCTORS ROSTER */}
      <section id="specialists" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Medical Board
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Specialist Consultants
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Consult with board-certified clinicians providing personalized treatments across medicine, pediatrics, and surgery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-3.5 hover:shadow-md hover:border-teal-300 transition-all duration-150"
              >
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600 bg-slate-200 shadow-sm"
                />
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-slate-900">{doc.name}</h4>
                  <p className="text-xs font-bold text-teal-700">{doc.degree}</p>
                  <span className="text-[11px] text-slate-500 block font-medium">
                    {doc.department}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full flex items-center justify-between">
                  <span className="text-slate-400 font-sans font-medium text-[11px]">OPD Fee:</span>
                  <strong className="text-teal-700">{doc.fee}</strong>
                </div>

                <button
                  onClick={() => openBooking(doc)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book with {doc.name.split(" ")[1] || doc.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INFRASTRUCTURE & AMENITIES SECTION */}
      <section id="facilities" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Clinical Infrastructure
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Engineered for Modern Healthcare
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Equipped with state-of-the-art diagnostic imaging, round-the-clock pharmacy depot, and sanitized surgical suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex items-start space-x-5 shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">{fac.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{fac.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PATIENT TESTIMONIALS & TRUST */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Patient Feedback & Recovery Stories
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by Citizens Across Pune
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Verified outcomes from outpatient consultations and inpatient medical recoveries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating)].map((_, rIdx) => (
                      <Star key={rIdx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700 text-left">
                  <div className="text-xs font-black text-white">{t.name}</div>
                  <div className="text-[11px] text-teal-400 font-medium">{t.treatment}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ABOUT & CLINICAL GOVERNANCE */}
      <section id="about" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-br from-teal-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-teal-800/60 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[11px] font-mono uppercase bg-teal-800/80 text-teal-200 px-3 py-1 rounded-md border border-teal-700">
              Clinical Quality & Patient Safety
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Dedicated to Ethical & Transparent Healthcare
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              At Gavane Hospital & Research Centre, clinical decisions are driven strictly by
              evidence-based protocols. We ensure transparent treatment estimations, paperless
              record access for patients, and round-the-clock physician oversight.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-teal-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Sanitized OT Air</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Emergency ICU Bed</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-center space-y-4 shrink-0 w-full lg:w-80">
            <div className="text-xs font-bold text-teal-200 uppercase tracking-widest">
              Have an OPD Inquiry?
            </div>
            <div className="text-xl font-black text-white">+91 0240 2484 000</div>
            <p className="text-[11px] text-slate-300">
              Our front-desk reception coordinates specialist appointments immediately.
            </p>
            <button
              onClick={() => openBooking()}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              Book OPD Online
            </button>
          </div>
        </div>
      </section>

      {/* 9. ENTERPRISE FOOTER */}
      <footer id="contact" className="mt-auto bg-[#050f16] text-slate-400 border-t border-slate-800 text-xs font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-white font-black text-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span>GAVANE HOSPITAL</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tertiary Outpatient, Surgical & Inpatient Healthcare Center in Hadapsar, Pune.
              Committed to compassionate clinical excellence.
            </p>
            <div className="text-[11px] font-mono text-teal-400">
              Registration No: GH-PUN-2026-MED
            </div>
          </div>

          {/* Col 2: Hospital Departments */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-white tracking-wider">
              Specialized Clinics
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#services" className="hover:text-teal-400 transition-colors">Cardiology & Vascular Medicine</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">General & Laparoscopic Surgery</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">Pediatrics & Neonatal Care</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">Orthopedics & Polytrauma</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">Intensive Care Unit (ICU)</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">Digital Radiology & Sonography</a></li>
            </ul>
          </div>

          {/* Col 3: Outpatient Timings */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-white tracking-wider">
              Visiting & OPD Hours
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <strong className="text-white block">Morning OPD:</strong>
                <span>09:30 AM – 01:30 PM (Mon – Sat)</span>
              </div>
              <div>
                <strong className="text-white block">Evening OPD:</strong>
                <span>04:00 PM – 08:30 PM (Mon – Sat)</span>
              </div>
              <div>
                <strong className="text-rose-400 block">Emergency & Triage:</strong>
                <span>24 Hours / 365 Days Open</span>
              </div>
            </div>
          </div>

          {/* Col 4: Location & Governance */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-white tracking-wider">
              Hospital Location
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hadapsar-Saswad Main Highway, Near Gadital, Hadapsar, Pune, Maharashtra 411028.
            </p>
            <div className="pt-2">
              <button
                onClick={() => openAuth("doctor")}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
              >
                Access Hospital Staff Gateway →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="bg-[#03090e] border-t border-slate-800/80 px-4 sm:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Gavane Hospital & Research Centre. All Rights Reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>DPDP Act 2023 Compliant</span>
              <span>•</span>
              <span className="text-slate-400">Powered by Shourya Technologies</span>
            </div>
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

      {/* Staff Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultRole={authRole}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050f16] text-white text-xs font-bold uppercase tracking-widest font-sans">
          Loading Gavane Hospital Portal...
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}