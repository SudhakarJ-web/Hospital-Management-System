"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, Award, ShieldCheck, HeartPulse, Stethoscope, 
  UserCheck, Phone, Mail, MapPin, Briefcase, Calendar, Star, Building
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 text-center px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <span className="text-xs uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          Hospital Management System
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-4 max-w-4xl mx-auto leading-tight">
          Your Most Trusted Healthcare Partner
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-sm md:text-base">
          Providing end-to-end hospital administration, clinical management, real-time doctor portals, patient OPD/IPD tracking, and automated billing workflows.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/contact" className="px-6 py-3 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition">
            Book Appointment
          </Link>
        </div>
      </section>

      {/* 1. Services Slider / Cards */}
      <section id="services" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Our Core Services</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {["24/7 Emergency Care", "Advanced Surgery", "Comprehensive Diagnostics", "Outpatient Clinics"].map((service, idx) => (
            <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition">
              <Stethoscope className="text-cyan-400 w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg text-white">{service}</h3>
              <p className="text-xs text-slate-400 mt-2">Providing state-of-the-art care with advanced medical equipment.</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. About Us */}
      <section className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-white border-l-4 border-cyan-500 pl-3 mb-4">About Gavane Hospital</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Gavane Hospital & Research Centre is dedicated to delivering exemplary patient care through clinical innovation, advanced medical technology, and compassionate healthcare solutions.
            </p>
            <Link href="/about" className="inline-flex items-center text-cyan-400 text-sm font-semibold mt-4 hover:underline">
              Read More About Us <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="bg-slate-800 rounded-xl h-64 flex items-center justify-center text-slate-500">
            [ Hospital Facility Image ]
          </div>
        </div>
      </section>

      {/* 3. Chairman's Message */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 grid md:grid-cols-3 gap-8 items-center">
          <div className="bg-slate-800 rounded-xl h-48 flex items-center justify-center text-slate-500">
            [ Chairman Photo ]
          </div>
          <div className="md:col-span-2">
            <blockquote className="text-lg italic text-slate-200">
              "Our mission is to make world-class healthcare accessible, affordable, and compassionate for every individual."
            </blockquote>
            <h3 className="text-xl font-bold text-white mt-4">Dr. A. Gavane</h3>
            <p className="text-cyan-400 text-sm">MD, FRCS — Founder & Chairman</p>
          </div>
        </div>
      </section>

      {/* 4. Doctors */}
      <section id="doctors" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Our Specialist Doctors</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Dr. Sarah Jenkins", degree: "MD, Cardiology", spec: "Senior Cardiologist" },
            { name: "Dr. Rajesh Kumar", degree: "MS, Orthopedics", spec: "Joint Replacement Specialist" },
            { name: "Dr. Elena Rostova", degree: "DM, Neurology", spec: "Neurologist" }
          ].map((doc, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-500">
                [ Photo ]
              </div>
              <h3 className="font-bold text-white text-lg">{doc.name}</h3>
              <p className="text-xs text-slate-400">{doc.degree}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-slate-800 text-cyan-400 text-xs rounded-full">{doc.spec}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Centres of Excellence */}
      <section id="centres" className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Centres of Excellence</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Cardiology & Cardiac Surgery", "Oncology & Cancer Care", "Neurosciences & Neurosurgery"].map((centre, i) => (
              <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <HeartPulse className="text-cyan-400 w-8 h-8 mb-2" />
                <h3 className="font-bold text-white">{centre}</h3>
                <p className="text-xs text-slate-400 mt-2">Comprehensive multi-disciplinary care standard.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Facilities */}
      <section id="facilities" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Facilities & Infrastructure</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {["Modular OTs", "24/7 Pharmacy", "Advanced ICU/CCU", "3 Tesla MRI & CT"].map((item, i) => (
            <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm">
              ✔ {item}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Why Choose Us? */}
      <section className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Why Choose Gavane Hospital</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "24/7 Availability", desc: "Emergency response team available round the clock." },
              { title: "Advanced Technology", desc: "Equipped with state-of-the-art robotic and diagnostic tools." },
              { title: "Expert Care", desc: "Over 50+ highly experienced consultants and surgeons." }
            ].map((reason, i) => (
              <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <ShieldCheck className="text-cyan-400 w-8 h-8 mb-2" />
                <h3 className="font-bold text-white">{reason.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Certifications & Accreditations */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-xl font-bold text-white mb-6">Accreditations & Certifications</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {["NABH Accredited", "NABL Certified Lab", "ISO 9001:2015", "JCI Standards"].map((cert, i) => (
            <div key={i} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-semibold text-sm">
              <Award className="inline w-4 h-4 mr-2 text-cyan-400" />
              {cert}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Insurance Availability */}
      <section id="insurance" className="py-16 px-6 bg-slate-900/50 border-y border-slate-800 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Insurance & Cashless Empanelment</h2>
          <p className="text-xs text-slate-400 mb-6">Partnered with top health insurance providers and TPAs.</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs font-semibold text-slate-400">
            {["Star Health", "HDFC ERGO", "ICICI Lombard", "Care Health", "Max Bupa", "Bajaj Allianz"].map((ins, i) => (
              <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                {ins}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Patient Testimonials */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Patient Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { quote: "The doctors and staff provided excellent care during my surgery. Highly recommend!", name: "Anand Verma" },
            { quote: "Top-notch emergency care. The staff handled everything seamlessly.", name: "Priya Sharma" }
          ].map((t, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, index) => <Star key={index} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-300 italic">"{t.quote}"</p>
              <p className="text-xs font-bold text-white mt-4">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Milestones & Achievements */}
      <section className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Milestones & Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><p className="text-3xl font-extrabold text-cyan-400">50,000+</p><p className="text-xs text-slate-400 mt-1">Patients Treated</p></div>
            <div><p className="text-3xl font-extrabold text-cyan-400">10,000+</p><p className="text-xs text-slate-400 mt-1">Surgeries Performed</p></div>
            <div><p className="text-3xl font-extrabold text-cyan-400">50+</p><p className="text-xs text-slate-400 mt-1">Specialist Doctors</p></div>
            <div><p className="text-3xl font-extrabold text-cyan-400">15+</p><p className="text-xs text-slate-400 mt-1">Years Excellence</p></div>
          </div>
        </div>
      </section>

      {/* 12. Blogs & Events */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Latest Blogs & Events</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Understanding Heart Health in 2026", date: "Aug 15, 2026" },
            { title: "Free Cardiac Health Checkup Camp", date: "Sep 01, 2026" },
            { title: "Advancements in Minimally Invasive Surgery", date: "Jul 20, 2026" }
          ].map((blog, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-xs text-cyan-400">{blog.date}</p>
              <h3 className="font-bold text-white mt-2">{blog.title}</h3>
              <p className="text-xs text-slate-400 mt-2">Read insights from our clinical experts.</p>
            </div>
          ))}
        </div>
      </section>

      {/* 13. Gallery & Media */}
      <section className="py-16 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">Gallery & Media</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-slate-800 rounded-lg h-36 flex items-center justify-center text-slate-500 text-xs">
                [ Gallery Image {item} ]
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Careers */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Join Our Team</h2>
        <p className="text-xs text-slate-400 mb-6">Explore career opportunities in healthcare & administration.</p>
        <Link href="/contact" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs uppercase tracking-wide rounded-lg transition border border-slate-700">
          View Open Positions
        </Link>
      </section>

      {/* 15. Contact Us Footer Section */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="text-white font-bold text-base mb-3">Gavane Hospital</h3>
            <p className="text-xs text-slate-400">Integrated Healthcare System delivering world-class medical services.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-cyan-400">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400">Contact Us</Link></li>
              <li><Link href="#services" className="hover:text-cyan-400">Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-cyan-400" /> Healthcare City, MH</li>
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2 text-cyan-400" /> +91 98765 43210</li>
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2 text-cyan-400" /> info@gavanehospital.com</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Emergency</h4>
            <p className="text-xs text-slate-400">24/7 Emergency & Ambulance Service available.</p>
            <p className="text-cyan-400 font-bold mt-2 text-lg">Call 108 / 1800-123-456</p>
          </div>
        </div>
        <div className="text-center text-xs border-t border-slate-800 mt-12 pt-6 text-slate-500">
          Powered by Shourya Technologies • Gavane Hospital & Research Centre
        </div>
      </footer>
    </div>
  );
}