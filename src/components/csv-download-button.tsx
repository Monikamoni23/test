"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Shipment } from "@/types";

interface CsvDownloadButtonProps {
  shipments: Shipment[];
  onGenerated?: (fileName: string) => void;
}

export function CsvDownloadButton({ shipments, onGenerated }: CsvDownloadButtonProps) {
  const handleDownload = () => {
    const headers = [
      "Contract",
      "Sub-Contract",
      "Container Number",
      "Country",
      "Factory",
      "Shipped Date",
      "BL No",
      "Vessel Name",
      "Voyage Details",
      "Qty Shipped (Kgs)",
      "ETA Destination",
    ];
    const rows = shipments.map((shipment) => [
      shipment.masterContractId,
      shipment.subContractId,
      shipment.containerNumber,
      shipment.countryOfOrigin,
      shipment.factory,
      shipment.shippedDate || "Pending",
      shipment.blNo,
      shipment.vesselName,
      shipment.voyageDetails,
      shipment.qtyShippedKgs.toString(),
      shipment.etaDestination,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `weekly-shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onGenerated?.(fileName);
  };

  return (
    <Button onClick={handleDownload} className="gap-2">
      <Download className="h-4 w-4" />
      Generate CSV Now
    </Button>
  );
}
