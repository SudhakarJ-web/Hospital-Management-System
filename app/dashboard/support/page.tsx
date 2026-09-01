"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";

import {
  getUniversalStore,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import { getSharedPatients, deleteSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedCertificates, deleteSharedCertificate, SharedCertificate } from "@/lib/sync/certificatesSync";
import { supabase } from "@/lib/supabase";

const SUPPORT_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "REGISTRATION", label: "PATIENT REGISTRATION", icon: "👤" },
  { id: "OPD_QUEUE", label: "OPD APPOINTMENTS & QUEUE", icon: "🩺" },
  { id: "BILLING", label: "FRONT DESK BILLING & UPI", icon: "💳" },
  { id: "IPD_ADMISSION", label: "IPD ADMISSIONS & BEDS", icon: "🛏️" },
  { id: "DISCHARGE", label: "DISCHARGE CLEARANCE DESK", icon: "🚪" },
  { id: "CERTIFICATES", label: "MEDICAL CERTIFICATES", icon: "📄" },
  { id: "HELPDESK", label: "HELPDESK & UTILITY", icon: "⚙️" },
];

export default function SupportDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("REGISTRATION");
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [operatorName, setOperatorName] = useState<string>("Rajesh Patil");
  const [operatorEmail, setOperatorEmail] = useState<string>("support@gavanehospital.in");

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function resolveSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setOperatorName(metaName);
          if (data.user.email) setOperatorEmail(data.user.email);
        }
      } catch {}
    }
    resolveSession();
  }, []);

  const loadData = useCallback(async () => {
    setDataStore(getUniversalStore());
    setPatients(await getSharedPatients());
    setCertificates(await getSharedCertificates());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete record for ${name}?`)) return;
    const updated = deleteUniversalRecord(activeModule, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name}.` });
  };

  const getHeaders = (mod: string) => {
    switch (mod) {
      case "OPD_QUEUE":
        return ["Token / ID", "Patient Name", "Token Number", "Consultation Specialty", "Observed Vitals", "Assigned Doctor", "Status", "Controls"];
      case "BILLING":
        return ["Invoice ID", "Patient Name", "Receipt / Bill Ref", "Service Description", "Net Amount (₹)", "Payment Mode", "Status", "Controls"];
      case "IPD_ADMISSION":
        return ["Admission ID", "Patient Name", "Bed & Ward", "Department Ward", "Attending Consultant", "Admission Particulars", "Status", "Controls"];
      case "DISCHARGE":
        return ["Discharge ID", "Patient Name", "Summary Reference", "Ward / Bed", "Attending Physician", "Clearance Checklist", "Status", "Controls"];
      case "HELPDESK":
        return ["Ticket ID", "Inquiry / Request", "Contact", "Location / Ward", "Assigned Staff", "Dispatch Status", "Status", "Controls"];
      default:
        return ["Ref ID", "Subject", "Detail", "Department", "Assigned Person", "Particulars", "Status", "Controls"];
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="👥"
        loggedAsText={`${operatorName} (${operatorEmail})`}
        roleSubtitle="Front Desk Reception & Support Operations"
        bannerText="Front Desk Reception, Patient Registration & Clearance Gateway"
      />

      {/* Mobile Switch Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">👥 Desk:</span>
          <span className="uppercase text-teal-300 truncate">
            {SUPPORT_SIDEBAR_MODULES.find((m) => m.id === activeModule)?.label || activeModule}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
        >
          <span>{mobileMenuOpen ? "✕ Close" : "☰ Switch Module"}</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden lg:block">
          <DashboardSidebar
            modules={SUPPORT_SIDEBAR_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Support Modules"
          />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Front Desk Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {SUPPORT_SIDEBAR_MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      setSearchTerm("");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeModule === m.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-1 py-0.5 min-w-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span>
              <span className="truncate">Active Front Desk Workspace: <strong className="text-teal-700 uppercase">{activeModule}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={loadData}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Sync Live Data</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {activeModule === "REGISTRATION" && (
            <RegistrationView
              patients={patients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeletePatient={async (id, name) => {
                if (!confirm(`Delete patient ${name}?`)) return;
                const updated = await deleteSharedPatient(id);
                setPatients(updated);
                setFeedback({ type: "success", text: `Deleted patient ${name}.` });
              }}
            />
          )}

          {activeModule === "CERTIFICATES" && (
            <CertificatesView
              certificates={certificates}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeleteCertificate={async (id, name) => {
                if (!confirm(`Delete certificate for ${name}?`)) return;
                const updated = await deleteSharedCertificate(id);
                setCertificates(updated);
                setFeedback({ type: "success", text: `Deleted certificate for ${name}.` });
              }}
            />
          )}

          {!["REGISTRATION", "CERTIFICATES"].includes(activeModule) && (
            <LedgerTable
              moduleName={activeModule}
              records={dataStore[activeModule] || []}
              headers={getHeaders(activeModule)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={() => {}}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current Session :- <strong className="text-teal-400">{operatorName} ({operatorEmail}) • Front Desk Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>
    </div>
  );
}