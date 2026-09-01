"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface SupplierPurchaseOrdersProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function SupplierPurchaseOrders({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: SupplierPurchaseOrdersProps) {
  const headers = [
    "PO Number",
    "Distributor / Supplier Agency",
    "PO Reference ID",
    "Consignment Particulars",
    "Net Invoice Total (₹)",
    "Tracking / Delivery Status",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Supplier Purchase Orders (PO) & Depot Consignments"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}