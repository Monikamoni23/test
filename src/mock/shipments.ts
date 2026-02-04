import type { Shipment } from "@/types";
import { subContracts } from "@/mock/subContracts";

const statusCycle: Shipment["shipmentStatus"][] = [
  "Draft",
  "In Progress",
  "Shipped",
  "Completed",
];

export const shipments: Shipment[] = Array.from({ length: 36 }).map((_, index) => {
  const subContract = subContracts[index % subContracts.length];
  const status = statusCycle[index % statusCycle.length];
  const shipped = status === "Shipped" || status === "Completed";
  const qty = 1200 + (index % 6) * 350;

  return {
    id: `sh-${index + 1}`,
    masterContractId: subContract.masterContractId,
    subContractId: subContract.id,
    countryOfOrigin: subContract.countryOfOrigin,
    factory: subContract.factory ?? "",
    shipmentStatus: status,
    containerNumber: `CONT-${600 + index}`,
    linerSealNumber: `LS-${9000 + index}`,
    shippedDate: shipped ? `2024-0${(index % 6) + 1}-1${index % 9}` : "",
    blNo: `BL-${4200 + index}`,
    vesselName: "MV Horizon",
    voyageDetails: `Voy-${index + 20}A`,
    scacCode: "SCAC-998",
    bookingNumber: `BK-${2400 + index}`,
    etaDestination: `2024-0${(index % 6) + 2}-2${index % 8}`,
    qtyShippedKgs: qty,
    updatedIspPortal: index % 2 === 0,
    comments: "Shipment advice submitted",
    note: "",
    remark: "",
  };
});
