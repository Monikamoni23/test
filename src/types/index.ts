export interface Contract {
  id: string;
  contractNumber: string;
  rcnContractNumber: string;
  dateSigningContract: string;
  year: number;
  grade: string;
  status: "Open" | "Closed" | "On Hold";
  shipmentPeriod: string;
  incoterms: string;
  contractPriceUsdMt: number;
  contractPriceUsdLbs: number;
  contractPriceUsdKgs: number;
  totalContractQuantityKgs: number;
  totalContractValue: number;
  shippedQuantityKgs: number;
  openQty: number;
  openValue: number;
  openBookQty: number;
  openBookValue: number;
  countryOfOrigin: string;
  factory: string;
  allocationSummary: string;
}

export interface ShipmentAdvice {
  id: string;
  contractId: string;
  containerNumber: string;
  linerSealNumber: string;
  factory: string;
  shippedDate: string;
  blNo: string;
  vesselName: string;
  voyageDetails: string;
  scacCode: string;
  bookingNumber: string;
  etaDestination: string;
  qtyShippedKgs: number;
  updatedIspPortal: "Yes" | "No";
  comments: string;
  note: string;
  remark: string;
  status: "Planned" | "Shipped";
}

export interface AllocationLine {
  id: string;
  contractId: string;
  countryOfOrigin: "India" | "Vietnam";
  factory?: string;
  allocatedQtyKgs: number;
}

export interface ReconciliationItem {
  id: string;
  contractNumber: string;
  buyerOpenQty: number;
  buyerOpenValue: number;
  systemOpenQty: number;
  systemOpenValue: number;
  varianceQty: number;
  varianceValue: number;
  status: "Matched" | "Mismatch" | "Resolved";
  owner: string;
  lastUpdated: string;
}

export interface WeeklyEmailLog {
  id: string;
  buyer: string;
  fileName: string;
  date: string;
  status: "Sent" | "Failed" | "Queued";
  retryCount: number;
}
