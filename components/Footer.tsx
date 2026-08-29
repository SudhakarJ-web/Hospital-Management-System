import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0b1b2b] text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Hospital Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏥</span>
              <span className="text-lg font-black tracking-tight text-white uppercase">
                Gavane Hospital
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              NABH accredited multi-specialty healthcare institution committed to clinical excellence, patient-first care, and digital EHR integration.
            </p>
            <div className="text-[11px] text-teal-400 font-semibold">
              Emergency Contact: +91 (020) 2740-0000
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">
                  About Institution
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition-colors">
                  Contact & Triage
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Staff & Patient Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical Portals */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Care Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Doctor Clinical EHR
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Support & Front Desk Desk
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Pharmacy & Lab Services
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Patient Health Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Timings */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Hospital Operations
            </h3>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-200">OPD Hours:</strong> Mon - Sat: 8:00 AM - 8:00 PM
            </p>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-slate-200">Emergency & Trauma:</strong> 24/7 Available
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                🔒 DPDP Act 2023 Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Gavane Hospital. All rights reserved.</p>
          <p>
            Designed & Engineered by <strong className="text-slate-400">Shourya Technologies</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}