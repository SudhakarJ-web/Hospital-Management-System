"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Boxes, Calendar, FileText, Hash, AlertTriangle } from "lucide-react";
import { saveLiveModuleRecord, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface MedicalItemModalProps {
  isOpen: boolean;
  activeModule: string;
  officerName: string;
  initialRecord?: UnifiedRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MedicalItemModal({
  isOpen,
  activeModule,
  officerName,
  initialRecord,
  onClose,
  onSuccess,
}: MedicalItemModalProps) {
  const [title, setTitle] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [categoryOrLocation, setCategoryOrLocation] = useState("");
  const [status, setStatus] = useState("Available");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic titles depending on active module
  const getModuleConfig = () => {
    switch (activeModule) {
      case "pharmacy_stock":
        return {
          titleLabel: "Medication / Drug Brand Name *",
          titlePlaceholder: "e.g., Inj. Ceftriaxone 1g / Paracetamol 650mg",
          batchLabel: "Batch / Lot Identifier *",
          qtyLabel: "Stock Pack / Vial Count *",
          catLabel: "Therapeutic Class / Storage Rack",
          badge: "PHARMACY INVENTORY",
        };
      case "dispensary":
        return {
          titleLabel: "Patient / Dispensation Item *",
          titlePlaceholder: "e.g., Post-Op Dressing Kit / Rx Pack",
          batchLabel: "Dispensation Ref / Batch *",
          qtyLabel: "Quantity Dispensed *",
          catLabel: "Recipient Ward / OPD Desk",
          badge: "DISPENSARY RECORD",
        };
      case "pathology":
        return {
          titleLabel: "Reagent / Test Kit Name *",
          titlePlaceholder: "e.g., CBC Diluent / Troponin-I Rapid Cards",
          batchLabel: "Kit Lot Number *",
          qtyLabel: "Number of Tests / Packs *",
          catLabel: "Analyzer Model / Section",
          badge: "LAB REAGENTS",
        };
      case "radiology":
        return {
          titleLabel: "Imaging Film / Contrast Medium *",
          titlePlaceholder: "e.g., 10x12 Laser Film / Iohexol 300mg Contrast",
          batchLabel: "Lot / Film Box ID *",
          qtyLabel: "Sheets / Vials in Stock *",
          catLabel: "Modality (X-Ray / USG / CT)",
          badge: "RADIOLOGY DEPOT",
        };
      case "blood_bank":
        return {
          titleLabel: "Blood Unit / Component *",
          titlePlaceholder: "e.g., Packed Red Blood Cells (PRBC) - B Positive",
          batchLabel: "Blood Bag Segment Barcode *",
          qtyLabel: "Volume / Units (ml) *",
          catLabel: "Cross-match / Donor Ref",
          badge: "TRANSFUSION REGISTRY",
        };
      case "cssd":
        return {
          titleLabel: "Surgical Instrument Set / Tray *",
          titlePlaceholder: "e.g., Major Laparotomy Tray / Ortho Drill Set",
          batchLabel: "Autoclave Indicator Cycle # *",
          qtyLabel: "Sterilized Sets Available *",
          catLabel: "Target OT Suite / Station",
          badge: "CSSD STERILIZATION",
        };
      case "narcotics":
        return {
          titleLabel: "Restricted / High-Alert Drug *",
          titlePlaceholder: "e.g., Inj. Fentanyl 100mcg / Midazolam 5mg",
          batchLabel: "Narcotic Register Sr No. *",
          qtyLabel: "Ampoules / Vials Balance *",
          catLabel: "Authorizing Consultant",
          badge: "SCHEDULE-H / NARCOTICS",
        };
      case "suppliers":
        return {
          titleLabel: "Supplier / PO Consignment Name *",
          titlePlaceholder: "e.g., MedTech Lifesciences Bulk Consignment",
          batchLabel: "PO / Invoice Number *",
          qtyLabel: "Total Crates / Items *",
          catLabel: "Vendor Contact / Payment Terms",
          badge: "PROCUREMENT & PO",
        };
      default:
        return {
          titleLabel: "Item / Entry Title *",
          titlePlaceholder: "Description of record",
          batchLabel: "Lot / Ref Code *",
          qtyLabel: "Units / Count *",
          catLabel: "Category / Particulars",
          badge: "MEDICAL DEPOT",
        };
    }
  };

  const config = getModuleConfig();

  useEffect(() => {
    if (initialRecord) {
      setTitle(initialRecord.col1 || "");
      setBatchNo(initialRecord.col2 || "");
      setQuantity(initialRecord.col3 || "");
      setCategoryOrLocation(initialRecord.col4 || "");
      setExpiryDate(initialRecord.col5 || "");
      setStatus(initialRecord.status || "Available");
    } else {
      setTitle("");
      setBatchNo("");
      setQuantity("");
      setCategoryOrLocation("");
      setExpiryDate("");
      setStatus("Available");
    }
    setErrorMsg(null);
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  const moduleKeyMap: Record<string, string> = {
    pharmacy_stock: "STOCK",
    dispensary: "DISPENSARY",
    pathology: "PATHOLOGY",
    radiology: "RADIOLOGY",
    blood_bank: "BLOOD_BANK",
    cssd: "CSSD",
    narcotics: "NARCOTICS",
    suppliers: "SUPPLIERS",
    audit: "AUDIT",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const targetModule = moduleKeyMap[activeModule] || "STOCK";

    try {
      await saveLiveModuleRecord(targetModule, {
        id: initialRecord?.id,
        reference_id:
          initialRecord?.reference_id ||
          `GH-${targetModule.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
        col1: title.trim(),
        col2: batchNo.trim() || "LOT-2026",
        col3: quantity.trim() || "1",
        col4: `${categoryOrLocation.trim()} • By: ${officerName || "Medical Officer"}`,
        col5: expiryDate.trim() ? `Exp: ${expiryDate.trim()}` : "No Expiry",
        status: status,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record item";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 space-y-4 my-auto relative text-slate-800 font-sans">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {config.badge}
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {initialRecord ? "Modify Inventory Record" : "Add New Medical Record"}
            </h2>
            <p className="text-xs text-slate-500">
              Logged & verified under clinician: <strong className="text-slate-700">{officerName}</strong>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Item / Drug Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              {config.titleLabel}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder={config.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Batch & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                {config.batchLabel}
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., BATCH-2026-89"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                {config.qtyLabel}
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 500 Vials / 50 Kits"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Category / Location & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                {config.catLabel}
              </label>
              <input
                type="text"
                placeholder="e.g., Cold Storage 2-8°C / Rack A3"
                value={categoryOrLocation}
                onChange={(e) => setCategoryOrLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Expiry / Autoclave Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Operational Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
              Stock / Batch Quality Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            >
              <option value="Available">Available / Active In-Stock</option>
              <option value="Low Stock">Low Stock Alert (Reorder)</option>
              <option value="Reserved OT">Reserved for OT / ICU Transfusion</option>
              <option value="Quarantined">Quarantined / Cold-Chain Check</option>
              <option value="Expired">Expired / Marked for Safe Disposal</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{submitting ? "Committing..." : initialRecord ? "Update Entry" : "Save into Depot"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}