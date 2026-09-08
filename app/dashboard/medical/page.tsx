"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLiveModuleRecords, saveLiveModuleRecord, deleteLiveModuleRecord, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";
import {
  Activity,
  Boxes,
  Pill,
  FlaskConical,
  Scan,
  ShoppingCart,
  Clock,
  RotateCw,
  Power,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";

export default function MedicalDashboardPage() {
  const router = useRouter();

  const [activeOfficer, setActiveOfficer] = useState<{ name: string; email: string } | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "pharmacy_stock" | "dispensary" | "pathology" | "radiology" | "suppliers" | "audit"
  >("pharmacy_stock");

  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Authentication and Session Verification
  useEffect(() => {
    async function verifyAccess() {
      // Check session storage for authorized login
      const sessionEmail = sessionStorage.getItem("staff_email");
      const sessionRole = sessionStorage.getItem("staff_role");

      if (!sessionEmail || sessionRole !== "medical") {
        // Reject unauthenticated access
        setAuthorized(false);
        setCheckingAuth(false);
        router.replace("/?login=medical");
        return;
      }

      // Resolve live officer name from database
      const staffList = await getLiveModuleRecords("MEDICAL_STAFF");
      const matched = staffList.find((s) => s.col3?.toLowerCase() === sessionEmail.toLowerCase());

      setActiveOfficer({
        name: matched ? matched.col1 : "Medical Officer",
        email: sessionEmail,
      });

      setAuthorized(true);
      setCheckingAuth(false);
    }

    verifyAccess();
  }, [router]);

  const loadModuleData = async () => {
    setIsSyncing(true);
    try {
      const moduleKeyMap: Record<string, string> = {
        pharmacy_stock: "STOCK",
        dispensary: "DISPENSARY",
        pathology: "PATHOLOGY",
        radiology: "RADIOLOGY",
        suppliers: "SUPPLIERS",
        audit: "AUDIT",
      };
      const data = await getLiveModuleRecords(moduleKeyMap[activeTab] || "STOCK");
      setRecords(data);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadModuleData();
    }
  }, [authorized, activeTab]);

  const handleAddItem = async () => {
    const title = prompt("Enter Item / Record Title:");
    if (!title) return;
    const batchOrCode = prompt("Enter Batch Number or Lot ID:") || "LOT-2026";
    const qty = prompt("Enter Quantity / Available Count:") || "100 Units";

    const moduleKeyMap: Record<string, string> = {
      pharmacy_stock: "STOCK",
      dispensary: "DISPENSARY",
      pathology: "PATHOLOGY",
      radiology: "RADIOLOGY",
      suppliers: "SUPPLIERS",
      audit: "AUDIT",
    };

    await saveLiveModuleRecord(moduleKeyMap[activeTab] || "STOCK", {
      col1: title,
      col2: batchOrCode,
      col3: qty,
      col4: activeOfficer?.name || "Medical Officer",
      status: "Available",
    });

    loadModuleData();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete record from live registry?")) return;
    const moduleKeyMap: Record<string, string> = {
      pharmacy_stock: "STOCK",
      dispensary: "DISPENSARY",
      pathology: "PATHOLOGY",
      radiology: "RADIOLOGY",
      suppliers: "SUPPLIERS",
      audit: "AUDIT",
    };
    await deleteLiveModuleRecord(moduleKeyMap[activeTab] || "STOCK", id);
    loadModuleData();
  };

  const handleExit = () => {
    sessionStorage.removeItem("staff_email");
    sessionStorage.removeItem("staff_role");
    router.push("/");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07131b] flex items-center justify-center text-white text-xs font-bold font-sans">
        Validating Medical Officer Authorization...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#07131b] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <Lock className="w-8 h-8 text-rose-500" />
        <h2 className="text-sm font-black">Access Denied: Unauthenticated Session</h2>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-teal-600 rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Hospital Portal
        </button>
      </div>
    );
  }

  const filteredRecords = records.filter(
    (r) =>
      r.col1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07131b] text-slate-200 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#050f16] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700/80 border border-teal-500/30 flex items-center justify-center text-white font-black shadow-xs">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-white uppercase">
              GAVANE HOSPITAL & RESEARCH CENTRE
            </div>
            <div className="text-[10px] text-teal-400 font-bold">
              • Central Pharmacy & Medical Depot Console
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Logged as: <strong className="text-white">{activeOfficer?.name}</strong> ({activeOfficer?.email})
            </span>
          </div>

          <button
            onClick={handleExit}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Close / Exit</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Dark Sidebar */}
        <aside className="w-64 bg-[#07131b] border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              MEDICAL & DRUG MODULES
            </div>

            <button
              onClick={() => setActiveTab("pharmacy_stock")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pharmacy_stock"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>PHARMACY STOCK & DRUGS</span>
            </button>

            <button
              onClick={() => setActiveTab("dispensary")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dispensary"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>PRESCRIPTION DISPENSARY</span>
            </button>

            <button
              onClick={() => setActiveTab("pathology")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pathology"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>PATHOLOGY REAGENTS & KITS</span>
            </button>

            <button
              onClick={() => setActiveTab("radiology")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "radiology"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>RADIOLOGY FILMS & CONSUMABLES</span>
            </button>

            <button
              onClick={() => setActiveTab("suppliers")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "suppliers"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>SUPPLIERS & PO ORDERS</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>AUDIT & EXPIRED LOGS</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-400 space-y-0.5">
            <div className="font-bold text-slate-300">SHOURYA TECHNOLOGIES</div>
            <div>Hadapsar, Pune, Maharashtra.</div>
            <div>Contact: +91 9860043213</div>
          </div>
        </aside>

        {/* Right Main Body */}
        <main className="flex-1 bg-slate-100 p-6 overflow-y-auto">
          {/* Top Status Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700">
                Active Medical Ledger:{" "}
                <strong className="text-teal-700 uppercase">{activeTab}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadModuleData}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync Stock</span>
              </button>
              <button
                onClick={handleAddItem}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>
          </div>

          {/* Module Table Canvas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  {activeTab.replace(/_/g, " ")} Workspace
                </h3>
                <p className="text-xs text-slate-500">Live database ledger node • {records.length} total entries</p>
              </div>

              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Item / Description</th>
                    <th className="py-2.5 px-3">Batch / Lot</th>
                    <th className="py-2.5 px-3">Available Count</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">
                        No records active in this ledger.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{item.reference_id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.col1}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.col2 || "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-teal-700 font-bold">{item.col3 || "-"}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.col4 || "Staff"}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.status || "Active"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}