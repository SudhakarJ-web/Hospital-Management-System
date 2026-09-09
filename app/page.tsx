"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  Sparkles,
  Building2,
  Search,
  Star,
  ChevronRight,
  ShieldAlert,
  CreditCard,
  HelpCircle,
  Ambulance,
  FileCheck2,
  BadgeCheck,
  UserCheck,
} from "lucide-react";

function LandingPageContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<SharedDoctor | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"admin" | "doctor" | "medical" | "support">("doctor");

  // Filter & Search states for Find a Doctor (Narayana/Apollo UX)
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState("All");

  // Active Specialty Tab (Fortis UX)
  const [activeSpecialtyTab, setActiveSpecialtyTab] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  // Specialties List
  const specialties = [
    {
      id: "cardio",
      name: "Cardiology & Vascular Sciences",
      icon: HeartPulse,
      badge: "High Acuity Care",
      desc: "Comprehensive cardiac diagnostics, 2D Color Doppler Echo, Holter monitoring, preventive vascular care, and cardiac emergency stabilization under experienced cardiologists.",
      procedures: ["2D Echocardiography & Color Doppler", "TMT Computerized Stress Analysis", "24-Hour Ambulatory Holter", "Acute Chest Pain Fast-Track Triage"],
      conditions: ["Coronary Artery Disease", "Heart Failure & Arrhythmia", "Hypertension & Vascular Stenosis"],
    },
    {
      id: "surgery",
      name: "General & Laparoscopic Surgery",
      icon: Scissors,
      badge: "Minimally Invasive",
      desc: "Precision keyhole surgery for gallbladder, hernia, appendicitis, colorectal disorders, and trauma interventions with reduced pain and early daycare discharge.",
      procedures: ["4K Karl Storz Laparoscopic Cholecystectomy", "Hernioplasty & Mesh Repairs", "Laser Proctology (Piles/Fissure)", "Emergency Exploratory Laparotomy"],
      conditions: ["Gallstones & Appendicitis", "Inguinal & Ventral Hernias", "Abdominal Trauma & Acute Peritonitis"],
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Neonatology",
      icon: Baby,
      badge: "Gentle Child Care",
      desc: "Round-the-clock pediatric emergency, developmental milestone tracking, complete child immunizations, and phototherapy in an infection-controlled environment.",
      procedures: ["Neonatal Phototherapy & Jaundice Triage", "Comprehensive Pediatric Vaccination", "Pediatric Respiratory Nebulization", "Growth & Nutrition Profiling"],
      conditions: ["Seasonal Viral & Dengue Fevers", "Pediatric Asthma & Bronchiolitis", "Gastrointestinal Infections"],
    },
    {
      id: "ortho",
      name: "Orthopedics & Joint Trauma",
      icon: Bone,
      badge: "Mobility Restoration",
      desc: "Complex bone fracture reduction, joint preservation, sports ligament injury care, spine ergonomics, and rehabilitation guided by intraoperative C-Arm imaging.",
      procedures: ["C-Arm Guided Closed Fracture Fixation", "Arthroscopic Knee & Shoulder Repair", "Degenerative Joint Injections", "Post-Surgical Physiotherapy Suite"],
      conditions: ["Polytrauma & Road Traffic Accidents", "Osteoarthritis & Spondylosis", "Sports Ligament & Meniscal Tears"],
    },
    {
      id: "icu",
      name: "Intensive Critical Care (ICU)",
      icon: BedDouble,
      badge: "24/7 Intensivist Bedside",
      desc: "Level-III multi-bed intensive care unit equipped with modern multi-parameter hemodynamic monitors, invasive ventilators, arterial blood gas diagnostics, and sterile air positive pressure.",
      procedures: ["Invasive & Non-Invasive Ventilation", "Central Venous & Arterial Cannulation", "Bedside Hemodialysis Coordination", "Continuous Arterial Blood Gas (ABG)"],
      conditions: ["Septic Shock & ARDS", "Severe Acute Pancreatitis", "Multi-Organ Dysfunction Syndrome (MODS)"],
    },
    {
      id: "radiology",
      name: "Diagnostic Radiology & Sonography",
      icon: Scan,
      badge: "Low-Dose Protocols",
      desc: "Advanced high-frequency digital radiography (DR) and high-resolution ultrasound machines providing fast, razor-sharp imaging with instant digital reporting.",
      procedures: ["High-Frequency Digital X-Ray", "Obstetric, Abdominal & Pelvic USG", "Peripheral Vascular Color Doppler", "Ultrasound-Guided Fluid Aspiration"],
      conditions: ["Fractures & Skeletal Deformities", "Internal Hemorrhage & Lesions", "Deep Vein Thrombosis (DVT)"],
    },
  ];

  // Preventive Health Checkup Packages (Apollo / Sahyadri Model)
  const healthPackages = [
    {
      title: "Essential Health Screening",
      price: "₹1,499",
      popular: false,
      tag: "Basic Preventive",
      testsCount: "35+ Investigations",
      features: [
        "Complete Blood Count (CBC)",
        "Fasting Blood Sugar & HbA1c",
        "Lipid Profile (Cholesterol, HDL, LDL)",
        "Serum Creatinine & Kidney Function",
        "Urine Routine & Microscopic",
        "Consultation with General Physician",
      ],
    },
    {
      title: "Comprehensive Executive Wellness",
      price: "₹3,499",
      popular: true,
      tag: "Most Recommended",
      testsCount: "58+ Investigations",
      features: [
        "Everything in Essential Package",
        "Liver Function Test (LFT) Full Panel",
        "Thyroid Profile (TSH, T3, T4)",
        "High-Frequency Digital Chest X-Ray",
        "Electrocardiogram (ECG)",
        "Ultrasound Abdomen & Pelvis",
        "Doctor & Dietician Consultation",
      ],
    },
    {
      title: "Senior Citizen Comprehensive",
      price: "₹4,999",
      popular: false,
      tag: "Aged 55+",
      testsCount: "68+ Investigations",
      features: [
        "Full Metabolic & Electrolyte Panel",
        "Echocardiogram (2D Echo) or TMT",
        "Vitamin D3 & B12 Quantitative",
        "Prostate Specific Antigen (Men) / Bone Scan",
        "Kidney & Microalbuminuria Screening",
        "Senior Specialist Review & Medication Audit",
      ],
    },
  ];

  // Cashless Insurance & TPA Partners
  const insurancePartners = [
    "Star Health Insurance",
    "ICICI Lombard",
    "HDFC ERGO",
    "Medi Assist TPA",
    "Paramount TPA",
    "Vidal Health TPA",
    "Bajaj Allianz",
    "Care Health Insurance",
  ];

  // Patient FAQs
  const faqs = [
    {
      q: "How can I book an OPD consultation with a specialist?",
      a: "You can book directly by clicking 'Book OPD' on this page, selecting your preferred doctor and time slot. Walk-in appointments are also registered at our ground floor triage reception counter.",
    },
    {
      q: "Do you accept cashless health insurance (TPA)?",
      a: "Yes. Gavane Hospital has established cashless tie-ups with leading health insurance companies and Third-Party Administrators (TPAs). Our dedicated Insurance & TPA Desk facilitates pre-authorizations and claim settlement.",
    },
    {
      q: "Is emergency and trauma care available 24 hours a day?",
      a: "Yes. Our Emergency and Trauma Department operates 24/7/365 with on-duty Resident Medical Officers, emergency nursing supervisors, pathology services, and ambulance assistance. Dial +91 0240 2484 000 for emergency response.",
    },
    {
      q: "How do I access my prescription and diagnostic records?",
      a: "Gavane Hospital operates a paperless digital EHR network. Upon consultation, your electronic prescription is transmitted to your registered mobile number and can be accessed via the Patient Portal.",
    },
  ];

  // Filtered Doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(doctorSearchQuery.toLowerCase());
      const matchesSpecialty =
        selectedSpecialtyFilter === "All" ||
        doc.department.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase());
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, doctorSearchQuery, selectedSpecialtyFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. TOP EMERGENCY & ACCREDITATION TICKER */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span>
              24/7 Emergency & ICU Ambulance:{" "}
              <strong className="text-white hover:underline cursor-pointer">+91 0240 2484 000</strong>
            </span>
          </div>
          <span className="text-slate-700 hidden md:inline">|</span>
          <div className="flex items-center space-x-1.5 hidden md:flex text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Hadapsar, Pune, Maharashtra 411028</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded font-bold">
            NABH ACCREDITED HOSPITAL
          </span>
          <span className="text-slate-400 hidden lg:inline">
            DPDP ACT 2023 ENCRYPTED NODE
          </span>
        </div>
      </div>

      {/* 2. GLASSMORPHIC MAIN HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
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

        <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-600">
          <a href="#quick-actions" className="hover:text-teal-700 transition-colors">Quick Access</a>
          <a href="#specialties" className="hover:text-teal-700 transition-colors">Centres of Excellence</a>
          <a href="#find-doctor" className="hover:text-teal-700 transition-colors">Find a Doctor</a>
          <a href="#packages" className="hover:text-teal-700 transition-colors">Health Packages</a>
          <a href="#emergency" className="hover:text-rose-600 transition-colors">24/7 Trauma</a>
          <a href="#insurance" className="hover:text-teal-700 transition-colors">Cashless TPA</a>
        </nav>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAuth("doctor")}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Staff Gateway</span>
          </button>
          <button
            onClick={() => openBooking()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <section className="relative overflow-hidden py-14 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-teal-100/70 border border-teal-200 px-4 py-1.5 rounded-full text-teal-900 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Trusted Tertiary Healthcare Facility in Hadapsar, Pune</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Advanced Clinical Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
              Tailored to Your Recovery
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Bringing together board-certified clinicians, modular HEPA-filtered surgical suites,
            round-the-clock emergency triage, and automated pathology under an integrated paperless EHR.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openBooking()}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Book Doctor Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#packages"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all shadow-2xs"
            >
              View Health Packages
            </a>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
              <div className="text-2xl font-black text-slate-900">24/7</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emergency & Trauma</div>
              <p className="text-[10px] text-teal-700 font-semibold">Immediate resuscitation beds</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
              <div className="text-2xl font-black text-slate-900">{doctors.length}+ Specialists</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Board Directory</div>
              <p className="text-[10px] text-teal-700 font-semibold">MD / MS senior consultants</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Digital EHR</div>
              <p className="text-[10px] text-teal-700 font-semibold">Direct prescription via SMS</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
              <div className="text-2xl font-black text-slate-900">NABH</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accredited Node</div>
              <p className="text-[10px] text-teal-700 font-semibold">Zero compromise sterile protocols</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PATIENT QUICK-ACTION HUB (Narayana/Apollo Pattern) */}
      <section id="quick-actions" className="relative -mt-6 max-w-5xl mx-auto px-4 w-full z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => openBooking()}
            className="p-4 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 flex flex-col items-start space-y-2 transition-all cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Book Appointment</div>
              <div className="text-[11px] text-slate-500">Confirm specialist OPD slot</div>
            </div>
          </button>

          <a
            href="#find-doctor"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-start space-y-2 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Find a Doctor</div>
              <div className="text-[11px] text-slate-500">Search by name or specialty</div>
            </div>
          </a>

          <a
            href="#packages"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-start space-y-2 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Health Packages</div>
              <div className="text-[11px] text-slate-500">Preventive body checkups</div>
            </div>
          </a>

          <a
            href="#emergency"
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 flex flex-col items-start space-y-2 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Emergency & Triage</div>
              <div className="text-[11px] text-rose-700 font-bold">24/7 Immediate Help</div>
            </div>
          </a>
        </div>
      </section>

      {/* 5. INTERACTIVE CENTRES OF CLINICAL EXCELLENCE (Fortis / Sahyadri Pattern) */}
      <section id="specialties" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Centres of Excellence
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Specialized Medical & Surgical Care
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Click across our dedicated clinical departments to explore procedures, technologies, and conditions treated.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {specialties.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveSpecialtyTab(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-2 ${
                activeSpecialtyTab === idx
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Showcase Box */}
        {(() => {
          const current = specialties[activeSpecialtyTab];
          const CurrentIcon = current.icon;
          return (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <CurrentIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100/70 text-teal-800 px-2.5 py-0.5 rounded-md border border-teal-200">
                      {current.badge}
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-1">
                      {current.name}
                    </h4>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {current.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Key Procedures & Tech
                    </div>
                    <ul className="space-y-1.5">
                      {current.procedures.map((p, pIdx) => (
                        <li key={pIdx} className="text-xs text-slate-600 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Conditions Treated
                    </div>
                    <ul className="space-y-1.5">
                      {current.conditions.map((c, cIdx) => (
                        <li key={cIdx} className="text-xs text-slate-600 flex items-center space-x-2">
                          <BadgeCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl text-white space-y-4 text-center border border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center mx-auto text-teal-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h5 className="text-sm font-black">Need a Consultant Opinion?</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Schedule an in-person outpatient review with our department lead specialists.
                </p>
                <button
                  onClick={() => openBooking()}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Book OPD Appointment
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 6. FIND A DOCTOR & LIVE SPECIALIST ROSTER (Narayana Style) */}
      <section id="find-doctor" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Medical Board Directory
              </span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                Find a Specialist Doctor
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Live doctor directory synchronized with hospital clinical credentials.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search doctor or specialty..."
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <select
                value={selectedSpecialtyFilter}
                onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                <option value="All">All Specialties</option>
                <option value="Medicine">General Medicine</option>
                <option value="Surgery">General Surgery</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                No specialists matched your search query. Try searching for "Surgery" or "Medicine".
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-50 rounded-3xl border border-slate-200 p-5 flex flex-col items-center text-center space-y-3.5 hover:shadow-lg hover:border-teal-300 transition-all duration-150"
                >
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600 bg-slate-200 shadow-xs"
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. PREVENTIVE HEALTH CHECKUP PACKAGES (Apollo / Fortis Pattern) */}
      <section id="packages" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Preventive Wellness
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Comprehensive Health Checkup Packages
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Early diagnosis prevents acute hospitalizations. Choose a package tailored to your age and clinical profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthPackages.map((pkg, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition-all relative ${
                pkg.popular
                  ? "border-teal-500 shadow-xl ring-2 ring-teal-500/20"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
                  {pkg.tag}
                </span>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">{pkg.title}</h4>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block">
                    {pkg.testsCount}
                  </span>
                </div>

                <div className="text-3xl font-black text-slate-900">
                  {pkg.price}
                  <span className="text-xs font-normal text-slate-400"> / package</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {pkg.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => openBooking()}
                className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  pkg.popular
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                Book Package Slot
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 8. 24/7 EMERGENCY & TRAUMA CRITICAL CARE (Sahyadri Pattern) */}
      <section id="emergency" className="py-14 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-rose-900/60 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-rose-900/80 border border-rose-700 px-3 py-1 rounded-full text-rose-200 text-xs font-bold">
              <Ambulance className="w-4 h-4 text-rose-400" />
              <span>Dedicated Emergency & Polytrauma Department</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Every Second Counts: The "Golden Hour" Trauma Care
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equipped for sudden cardiac events, acute stroke, respiratory distress, and polytrauma.
              Direct access to bedside X-Ray, continuous arterial blood gas analysis, emergency operation theatres, and round-the-clock intensivist coverage.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-rose-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Zero Triage Delay</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>ICU On Wheels</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>On-Demand Blood Bank</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-center space-y-4 shrink-0 w-full lg:w-80">
            <div className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">
              24/7 Emergency Line
            </div>
            <div className="text-2xl font-black text-white">+91 0240 2484 000</div>
            <p className="text-[11px] text-slate-300">
              Immediate triage activation & ambulance dispatch.
            </p>
            <a
              href="tel:+9102402484000"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-block"
            >
              Call Emergency Now
            </a>
          </div>
        </div>
      </section>

      {/* 9. CASHLESS MEDICLAIM & TPA PARTNERS */}
      <section id="insurance" className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6 text-center">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Hassle-Free Settlement
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Cashless Insurance & TPA Tie-Ups
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Our in-house insurance desk coordinates pre-authorizations and seamless claim settlements.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
            {insurancePartners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 shadow-2xs hover:bg-teal-50 hover:border-teal-200 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PATIENT FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Patient Guide
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-black text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaqIndex === idx ? "rotate-90 text-teal-600" : ""
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 11. MODERN ENTERPRISE FOOTER */}
      <footer className="mt-auto bg-[#050f16] text-slate-400 border-t border-slate-800 text-xs font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hospital Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-white font-black text-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span>GAVANE HOSPITAL</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tertiary Multi-Specialty Surgical & Outpatient Healthcare Centre in Hadapsar, Pune.
              Committed to compassionate clinical excellence.
            </p>
            <div className="text-[11px] font-mono text-teal-400">
              Licence: GH-PUN-2026-MED
            </div>
          </div>

          {/* Quick Specialties */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-white tracking-wider">
              Centres of Excellence
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#specialties" className="hover:text-teal-400 transition-colors">Cardiology & 2D Echo</a></li>
              <li><a href="#specialties" className="hover:text-teal-400 transition-colors">General & Laparoscopic Surgery</a></li>
              <li><a href="#specialties" className="hover:text-teal-400 transition-colors">Pediatrics & Neonatal Care</a></li>
              <li><a href="#specialties" className="hover:text-teal-400 transition-colors">Orthopedics & Joint Trauma</a></li>
              <li><a href="#specialties" className="hover:text-teal-400 transition-colors">Intensive Critical Care (ICU)</a></li>
              <li><a href="#specialties" className="hover:text-teal-400 transition-colors">Digital Radiology & Ultrasound</a></li>
            </ul>
          </div>

          {/* Timings */}
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
                <strong className="text-rose-400 block">Emergency & Trauma:</strong>
                <span>24 Hours / 365 Days Open</span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-white tracking-wider">
              Location & Portals
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

        {/* Legal Bar */}
        <div className="bg-[#03090e] border-t border-slate-800/80 px-4 sm:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Gavane Hospital & Research Centre. All Rights Reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>NABH Accredited</span>
              <span>•</span>
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

      {/* Staff Authentication Gateway Modal */}
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