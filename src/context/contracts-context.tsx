"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

import { masterContracts as seedContracts } from "@/mock/contracts";
import { shipments as seedShipments } from "@/mock/shipments";
import { subContracts as seedSubContracts } from "@/mock/subContracts";
import { pricingMaster as seedPricing } from "@/mock/pricing";
import { weeklyEmailLog as seedEmailLog } from "@/mock/email-log";
import type { MasterContract, Shipment, SubContract, PricingMaster, WeeklyEmailLog } from "@/types";

interface NewContractInput {
  contractNumber: string;
  rcnContractNumber: string;
  dateSigningContract: string;
  year: number;
  gradeId: string;
  gradeName: string;
  status: "Draft" | "Open" | "Closed";
  shipmentPeriod: string;
  incoterms: string;
  totalContractQuantityKgs: number;
}

interface ContractsContextValue {
  contracts: MasterContract[];
  subContracts: SubContract[];
  shipments: Shipment[];
  pricingMaster: PricingMaster[];
  emailLog: WeeklyEmailLog[];
  addContract: (contract: NewContractInput) => string;
  updateSubContracts: (contractId: string, lines: SubContract[]) => void;
  confirmAllocation: (contractId: string) => void;
  addShipment: (shipment: Shipment) => void;
  markShipmentShipped: (shipmentId: string) => void;
  addEmailLog: (log: WeeklyEmailLog) => void;
}

const ContractsContext = createContext<ContractsContextValue | undefined>(undefined);

const buildAllocationSummary = (lines: SubContract[]) =>
  lines
    .map((line) => `${line.countryOfOrigin}: ${line.allocatedQtyKgs.toLocaleString()}`)
    .join(" | ");

const recalcContract = (
  contract: MasterContract,
  subContracts: SubContract[],
  shipments: Shipment[]
) => {
  const relatedSubs = subContracts.filter(
    (line) => line.masterContractId === contract.id
  );
  const totalValue = relatedSubs.reduce(
    (sum, line) => sum + line.subContractValue,
    0
  );
  const shippedShipments = shipments.filter(
    (shipment) =>
      shipment.masterContractId === contract.id &&
      ["Shipped", "Completed"].includes(shipment.shipmentStatus)
  );
  const shippedQty = shippedShipments.reduce(
    (sum, shipment) => sum + shipment.qtyShippedKgs,
    0
  );
  const shippedValue = shippedShipments.reduce((sum, shipment) => {
    const subContract = relatedSubs.find(
      (line) => line.id === shipment.subContractId
    );
    const price = subContract?.contractPriceUsdKgs ?? 0;
    return sum + shipment.qtyShippedKgs * price;
  }, 0);
  const openQty = Math.max(contract.totalContractQuantityKgs - shippedQty, 0);
  const openValue = Math.max(totalValue - shippedValue, 0);

  return {
    ...contract,
    totalContractValue: totalValue,
    shippedQuantityKgs: shippedQty,
    openQty,
    openValue,
    allocationSummary: buildAllocationSummary(relatedSubs),
  };
};

export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<MasterContract[]>(seedContracts);
  const [subContracts, setSubContracts] = useState<SubContract[]>(seedSubContracts);
  const [shipments, setShipments] = useState<Shipment[]>(seedShipments);
  const [pricingMaster] = useState<PricingMaster[]>(seedPricing);
  const [emailLog, setEmailLog] = useState<WeeklyEmailLog[]>(seedEmailLog);

  const value = useMemo<ContractsContextValue>(
    () => ({
      contracts,
      subContracts,
      shipments,
      pricingMaster,
      emailLog,
      addContract: (contract) => {
        const newId = `mc-${Date.now()}`;
        const gradePricingIndia = pricingMaster.find(
          (item) => item.gradeId === contract.gradeId && item.countryId === "India"
        );
        const gradePricingVietnam = pricingMaster.find(
          (item) => item.gradeId === contract.gradeId && item.countryId === "Vietnam"
        );
        const newSubs: SubContract[] = [
          {
            id: `${newId}-ind`,
            masterContractId: newId,
            subContractNumber: `${contract.contractNumber}-IND`,
            countryOfOrigin: "India",
            factory: "Mysuru Co-Op",
            allocatedQtyKgs: 0,
            contractPriceUsdKgs: gradePricingIndia?.contractPriceUsdKgs ?? 0,
            subContractValue: 0,
            status: "Open",
            isAllocationConfirmed: false,
          },
          {
            id: `${newId}-vnm`,
            masterContractId: newId,
            subContractNumber: `${contract.contractNumber}-VNM`,
            countryOfOrigin: "Vietnam",
            factory: "Da Nang Origin",
            allocatedQtyKgs: 0,
            contractPriceUsdKgs: gradePricingVietnam?.contractPriceUsdKgs ?? 0,
            subContractValue: 0,
            status: "Open",
            isAllocationConfirmed: false,
          },
        ];

        const newContract: MasterContract = recalcContract(
          {
            ...contract,
            id: newId,
            totalContractValue: 0,
            shippedQuantityKgs: 0,
            openQty: contract.totalContractQuantityKgs,
            openValue: 0,
            openBookQty: contract.totalContractQuantityKgs,
            openBookValue: contract.totalContractQuantityKgs * 0,
            allocationSummary: "Pending allocation",
          },
          newSubs,
          []
        );

        setContracts((prev) => [newContract, ...prev]);
        setSubContracts((prev) => [...newSubs, ...prev]);
        return newId;
      },
      updateSubContracts: (contractId, lines) => {
        const sanitized = lines.map((line) => ({
          ...line,
          subContractValue: line.allocatedQtyKgs * line.contractPriceUsdKgs,
        }));
        setSubContracts((prev) => [
          ...prev.filter((line) => line.masterContractId !== contractId),
          ...sanitized,
        ]);
        setContracts((prev) =>
          prev.map((contract) =>
            contract.id === contractId
              ? recalcContract(contract, sanitized, shipments)
              : contract
          )
        );
      },
      confirmAllocation: (contractId) => {
        setSubContracts((prev) =>
          prev.map((line) =>
            line.masterContractId === contractId
              ? { ...line, isAllocationConfirmed: true }
              : line
          )
        );
      },
      addShipment: (shipment) => {
        setShipments((prev) => [shipment, ...prev]);
      },
      markShipmentShipped: (shipmentId) => {
        setShipments((prev) => {
          const nextShipments = prev.map((shipment) =>
            shipment.id === shipmentId
              ? {
                  ...shipment,
                  shipmentStatus: "Shipped",
                  shippedDate: new Date().toISOString().slice(0, 10),
                }
              : shipment
          );
          setContracts((contractsState) =>
            contractsState.map((contract) =>
              recalcContract(contract, subContracts, nextShipments)
            )
          );
          return nextShipments;
        });
      },
      addEmailLog: (log) => {
        setEmailLog((prev) => [log, ...prev]);
      },
    }),
    [contracts, emailLog, pricingMaster, shipments, subContracts]
  );

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}

export function useContracts() {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error("useContracts must be used within ContractsProvider");
  }
  return context;
}
