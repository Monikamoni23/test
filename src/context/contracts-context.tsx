"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

import { contracts as seedContracts } from "@/mock/contracts";
import { shipments as seedShipments } from "@/mock/shipments";
import { allocationLines as seedAllocations } from "@/mock/allocations";
import type { AllocationLine, Contract, ShipmentAdvice } from "@/types";

interface ContractsContextValue {
  contracts: Contract[];
  shipments: ShipmentAdvice[];
  allocations: AllocationLine[];
  addContract: (contract: Contract) => void;
  updateAllocations: (contractId: string, lines: AllocationLine[]) => void;
  addShipment: (shipment: ShipmentAdvice) => void;
  markShipmentShipped: (shipmentId: string, shippedDate: string) => void;
}

const ContractsContext = createContext<ContractsContextValue | undefined>(undefined);

export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(seedContracts);
  const [shipments, setShipments] = useState<ShipmentAdvice[]>(seedShipments);
  const [allocations, setAllocations] = useState<AllocationLine[]>(seedAllocations);

  const value = useMemo<ContractsContextValue>(
    () => ({
      contracts,
      shipments,
      allocations,
      addContract: (contract) => {
        setContracts((prev) => [contract, ...prev]);
      },
      updateAllocations: (contractId, lines) => {
        setAllocations((prev) => [
          ...prev.filter((line) => line.contractId !== contractId),
          ...lines,
        ]);
      },
      addShipment: (shipment) => {
        setShipments((prev) => [shipment, ...prev]);
        setContracts((prev) =>
          prev.map((contract) => {
            if (contract.id !== shipment.contractId) return contract;
            const newShipped = contract.shippedQuantityKgs + shipment.qtyShippedKgs;
            const openQty = Math.max(
              contract.totalContractQuantityKgs - newShipped,
              0
            );
            return {
              ...contract,
              shippedQuantityKgs: newShipped,
              openQty,
              openValue: openQty * contract.contractPriceUsdKgs,
            };
          })
        );
      },
      markShipmentShipped: (shipmentId, shippedDate) => {
        setShipments((prev) =>
          prev.map((shipment) =>
            shipment.id === shipmentId
              ? { ...shipment, shippedDate, status: "Shipped" }
              : shipment
          )
        );
      },
    }),
    [allocations, contracts, shipments]
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
