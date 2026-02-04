"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DrawerForm } from "@/components/drawer-form";
import { FormField } from "@/components/form-field";
import { StatusBadge } from "@/components/status-badge";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast-provider";
import { useContracts } from "@/context/contracts-context";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Shipment, SubContract } from "@/types";

const shipmentSchema = z.object({
  subContractId: z.string().min(1, "Sub-contract is required"),
  containerNumber: z.string().min(1, "Container number is required"),
  linerSealNumber: z.string().min(1, "Liner seal number is required"),
  factory: z.string().min(1, "Factory is required"),
  shippedDate: z.string().min(1, "Shipped date is required"),
  blNo: z.string().min(1, "BL number is required"),
  vesselName: z.string().min(1, "Vessel name is required"),
  voyageDetails: z.string().min(1, "Voyage details are required"),
  scacCode: z.string().min(1, "SCAC code is required"),
  bookingNumber: z.string().min(1, "Booking number is required"),
  etaDestination: z.string().min(1, "ETA destination is required"),
  qtyShippedKgs: z.string().min(1, "Quantity is required"),
});

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Sub-Contracts", value: "sub-contracts" },
  { label: "Shipments", value: "shipments" },
  { label: "Weekly Reports", value: "weekly-reports" },
  { label: "Reconciliation", value: "reconciliation" },
  { label: "Activity Log", value: "activity" },
];

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    contracts,
    subContracts,
    shipments,
    emailLog,
    updateSubContracts,
    addShipment,
    markShipmentShipped,
  } = useContracts();
  const { pushToast } = useToast();
  const contractId = params.id as string;
  const contract = contracts.find((item) => item.id === contractId);

  const tab = searchParams.get("tab") ?? "overview";
  const contractSubContracts = subContracts.filter(
    (line) => line.masterContractId === contractId
  );
  const contractShipments = shipments.filter(
    (shipment) => shipment.masterContractId === contractId
  );

  const subContractLookup = useMemo(
    () => new Map(contractSubContracts.map((line) => [line.id, line])),
    [contractSubContracts]
  );

  const [allocationDraft, setAllocationDraft] = useState<SubContract[]>(
    contractSubContracts
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [shipmentValues, setShipmentValues] = useState({
    subContractId: "",
    containerNumber: "",
    linerSealNumber: "",
    factory: "",
    shippedDate: "",
    blNo: "",
    vesselName: "",
    voyageDetails: "",
    scacCode: "",
    bookingNumber: "",
    etaDestination: "",
    qtyShippedKgs: "",
    comments: "",
    note: "",
    remark: "",
  });
  const [shipmentErrors, setShipmentErrors] = useState<Record<string, string>>({});
  const [shipmentFilters, setShipmentFilters] = useState({
    country: "all",
    factory: "all",
    status: "all",
  });

  useEffect(() => {
    setAllocationDraft(contractSubContracts);
  }, [contractSubContracts]);

  const allocationTotal = allocationDraft.reduce(
    (sum, line) => sum + line.allocatedQtyKgs,
    0
  );

  const allocationLocked = allocationDraft.every((line) => line.isAllocationConfirmed);

  const filteredShipments = contractShipments.filter((shipment) => {
    const matchesCountry =
      shipmentFilters.country === "all" ||
      shipment.countryOfOrigin === shipmentFilters.country;
    const matchesFactory =
      shipmentFilters.factory === "all" ||
      shipment.factory === shipmentFilters.factory;
    const matchesStatus =
      shipmentFilters.status === "all" ||
      shipment.shipmentStatus === shipmentFilters.status;
    return matchesCountry && matchesFactory && matchesStatus;
  });

  const workflowSteps = useMemo(() => {
    return [
      { label: "Create Master Contract", status: "complete" },
      {
        label: "Auto Create Sub-Contracts",
        status: contractSubContracts.length > 0 ? "complete" : "current",
      },
      {
        label: "Allocate Qty",
        status: allocationLocked ? "complete" : tab === "sub-contracts" ? "current" : "upcoming",
      },
      {
        label: "Add Shipments",
        status: contractShipments.length > 0 ? "complete" : tab === "shipments" ? "current" : "upcoming",
      },
      {
        label: "Weekly Report",
        status: tab === "weekly-reports" ? "current" : "upcoming",
      },
      { label: "Reconcile", status: tab === "reconciliation" ? "current" : "upcoming" },
    ] as const;
  }, [allocationLocked, contractShipments.length, contractSubContracts.length, tab]);

  if (!contract) {
    return (
      <AppShell>
        <div className="rounded-lg border border-dashed p-8 text-center">
          Contract not found.
        </div>
      </AppShell>
    );
  }

  const handleConfirmAllocation = () => {
    const nextLines = allocationDraft.map((line) => ({
      ...line,
      isAllocationConfirmed: true,
    }));
    updateSubContracts(contractId, nextLines);
    setConfirmOpen(false);
    pushToast({
      title: "Allocation Confirmed",
      description: "Allocated quantities locked for shipments",
      variant: "success",
    });
  };

  const handleSubmitShipment = () => {
    const result = shipmentSchema.safeParse(shipmentValues);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        nextErrors[error.path[0] as string] = error.message;
      });
      setShipmentErrors(nextErrors);
      return;
    }

    const selectedSub = contractSubContracts.find(
      (line) => line.id === shipmentValues.subContractId
    );
    if (!selectedSub) {
      setShipmentErrors({ subContractId: "Sub-contract is required" });
      return;
    }

    const shippedQty = contractShipments
      .filter((shipment) => shipment.subContractId === selectedSub.id)
      .reduce((sum, shipment) => sum + shipment.qtyShippedKgs, 0);

    const nextQty = Number(shipmentValues.qtyShippedKgs);
    const remaining = selectedSub.allocatedQtyKgs - shippedQty;

    if (nextQty > remaining) {
      setShipmentErrors({
        qtyShippedKgs: "Qty shipped exceeds remaining open qty",
      });
      return;
    }

    addShipment({
      id: `sh-${Date.now()}`,
      masterContractId: contractId,
      subContractId: selectedSub.id,
      countryOfOrigin: selectedSub.countryOfOrigin,
      factory: shipmentValues.factory,
      shipmentStatus: "Draft",
      containerNumber: shipmentValues.containerNumber,
      linerSealNumber: shipmentValues.linerSealNumber,
      shippedDate: shipmentValues.shippedDate,
      blNo: shipmentValues.blNo,
      vesselName: shipmentValues.vesselName,
      voyageDetails: shipmentValues.voyageDetails,
      scacCode: shipmentValues.scacCode,
      bookingNumber: shipmentValues.bookingNumber,
      etaDestination: shipmentValues.etaDestination,
      qtyShippedKgs: nextQty,
      updatedIspPortal: false,
      comments: shipmentValues.comments,
      note: shipmentValues.note,
      remark: shipmentValues.remark,
    });

    setShipmentErrors({});
    setShipmentOpen(false);
    pushToast({
      title: "Shipment added",
      description: "Shipment advice record saved",
      variant: "success",
    });
  };

  const handleMarkShipped = () => {
    if (selectedShipment) {
      markShipmentShipped(selectedShipment.id);
      pushToast({
        title: "Shipment marked as shipped",
        description: "Master totals updated",
        variant: "success",
      });
      setSelectedShipment(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Contracts", href: "/contracts" },
            { label: contract.contractNumber },
          ]}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{contract.contractNumber}</h1>
              <p className="text-sm text-muted-foreground">
                {contract.gradeName} • {contract.shipmentPeriod}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={contract.status} />
              {tab === "overview" && (
                <Button onClick={() => router.push(`/contracts/${contractId}?tab=sub-contracts`)}>
                  Next: Sub-Contracts
                </Button>
              )}
            </div>
          </div>
          <Stepper steps={workflowSteps} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Open Qty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatNumber(contract.openQty)} KGS
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(contract.openValue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shipped</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatNumber(contract.shippedQuantityKgs)} KGS
              </p>
              <p className="text-xs text-muted-foreground">
                {contract.allocationSummary}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Incoterms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{contract.incoterms}</p>
              <p className="text-xs text-muted-foreground">
                Signed {contract.dateSigningContract}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-2 text-sm">
          {tabs.map((tabItem) => (
            <Button
              key={tabItem.value}
              variant={tab === tabItem.value ? "default" : "ghost"}
              onClick={() => router.push(`/contracts/${contractId}?tab=${tabItem.value}`)}
            >
              {tabItem.label}
            </Button>
          ))}
        </div>

        {tab === "overview" && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Contract Summary</p>
                  <p className="mt-2 text-sm">
                    Total Quantity: {formatNumber(contract.totalContractQuantityKgs)} KGS
                  </p>
                  <p className="text-sm">Total Value: {formatCurrency(contract.totalContractValue)}</p>
                  <p className="text-sm">
                    Open Book Qty: {formatNumber(contract.openBookQty)}
                  </p>
                  <p className="text-sm">
                    Open Book Value: {formatCurrency(contract.openBookValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Allocation Summary</p>
                  <p className="mt-2 text-sm">{contract.allocationSummary}</p>
                  <p className="text-sm">Buyer Contract: {contract.rcnContractNumber}</p>
                  <p className="text-sm">Status: {contract.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "sub-contracts" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sub-Contract Allocation</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={allocationLocked || allocationTotal !== contract.totalContractQuantityKgs}
                >
                  Confirm Allocation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                Total Contract Qty: {formatNumber(contract.totalContractQuantityKgs)} KGS | Allocated: {formatNumber(allocationTotal)} KGS
              </div>
              {allocationTotal !== contract.totalContractQuantityKgs && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                  Allocation must equal the master contract quantity to confirm.
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sub-Contract</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Price/KG</TableHead>
                    <TableHead>Allocated Qty (KGS)</TableHead>
                    <TableHead>Value (USD)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocationDraft.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{line.subContractNumber}</p>
                        <p className="text-xs text-muted-foreground">Factory: {line.factory ?? ""}</p>
                      </TableCell>
                      <TableCell>{line.countryOfOrigin}</TableCell>
                      <TableCell>${line.contractPriceUsdKgs.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.allocatedQtyKgs}
                          onChange={(event) =>
                            setAllocationDraft((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, allocatedQtyKgs: Number(event.target.value) }
                                  : item
                              )
                            )
                          }
                          disabled={allocationLocked}
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(line.allocatedQtyKgs * line.contractPriceUsdKgs)}</TableCell>
                      <TableCell>
                        <StatusBadge status={line.isAllocationConfirmed ? "Open" : "Draft"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {allocationLocked && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Allocation confirmed and locked.
                  <Button size="sm" onClick={() => router.push(`/contracts/${contractId}?tab=shipments`)}>
                    Next: Add Shipments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "shipments" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Shipment Advice</CardTitle>
              <Button onClick={() => setShipmentOpen(true)}>Create Shipment</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  value={shipmentFilters.country}
                  onValueChange={(value) =>
                    setShipmentFilters((prev) => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={shipmentFilters.factory}
                  onValueChange={(value) =>
                    setShipmentFilters((prev) => ({ ...prev, factory: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Factory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Factories</SelectItem>
                    <SelectItem value="Mysuru Co-Op">Mysuru Co-Op</SelectItem>
                    <SelectItem value="Da Nang Origin">Da Nang Origin</SelectItem>
                    <SelectItem value="Kerala Beans">Kerala Beans</SelectItem>
                    <SelectItem value="Hanoi Harvest">Hanoi Harvest</SelectItem>
                    <SelectItem value="Coorg Estates">Coorg Estates</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={shipmentFilters.status}
                  onValueChange={(value) =>
                    setShipmentFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Sub-Contract</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{shipment.containerNumber}</p>
                        <p className="text-xs text-muted-foreground">{shipment.blNo}</p>
                      </TableCell>
                      <TableCell>
                        {subContractLookup.get(shipment.subContractId)?.subContractNumber ?? shipment.subContractId}
                      </TableCell>
                      <TableCell>{formatNumber(shipment.qtyShippedKgs)}</TableCell>
                      <TableCell>{shipment.etaDestination}</TableCell>
                      <TableCell>
                        <StatusBadge status={shipment.shipmentStatus} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedShipment(shipment)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {tab === "weekly-reports" && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Report History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {emailLog.slice(0, 4).map((log) => (
                <div key={log.id} className="rounded-md border border-dashed p-3">
                  {log.fileName} · {log.buyer} · {log.status}
                </div>
              ))}
              <Button variant="outline" asChild>
                <Link href="/reports/weekly-shipments">Open Weekly Reports</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "reconciliation" && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <p>
                Reconciliation happens at portfolio level. Visit the reconciliation
                workspace to upload buyer files and resolve variances.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/reconciliation">Go to Reconciliation</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "activity" && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <div className="space-y-3">
                <div className="rounded-md border border-dashed p-3">
                  Sub-contracts auto-created · system · 2 days ago
                </div>
                <div className="rounded-md border border-dashed p-3">
                  Allocation confirmed by S&OP · yesterday
                </div>
                <div className="rounded-md border border-dashed p-3">
                  Shipment advice added by Logistics Ops · today
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        title="Confirm allocation"
        description="Confirming allocation will lock the sub-contract quantities for Phase-1 workflow."
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmAllocation}
      />

      <DrawerForm title="Create Shipment" open={shipmentOpen} onOpenChange={setShipmentOpen}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Sub-Contract" error={shipmentErrors.subContractId}>
            <Select
              value={shipmentValues.subContractId}
              onValueChange={(value) =>
                setShipmentValues((prev) => ({
                  ...prev,
                  subContractId: value,
                  factory:
                    contractSubContracts.find((line) => line.id === value)?.factory ?? "",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sub-contract" />
              </SelectTrigger>
              <SelectContent>
                {contractSubContracts.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.subContractNumber} ({line.countryOfOrigin})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Container Number" error={shipmentErrors.containerNumber}>
            <Input
              value={shipmentValues.containerNumber}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, containerNumber: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Liner Seal Number" error={shipmentErrors.linerSealNumber}>
            <Input
              value={shipmentValues.linerSealNumber}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, linerSealNumber: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Factory" error={shipmentErrors.factory}>
            <Input
              value={shipmentValues.factory}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, factory: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Shipped Date" error={shipmentErrors.shippedDate}>
            <Input
              type="date"
              value={shipmentValues.shippedDate}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, shippedDate: event.target.value }))
              }
            />
          </FormField>
          <FormField label="BL No" error={shipmentErrors.blNo}>
            <Input
              value={shipmentValues.blNo}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, blNo: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Vessel Name" error={shipmentErrors.vesselName}>
            <Input
              value={shipmentValues.vesselName}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, vesselName: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Voyage Details" error={shipmentErrors.voyageDetails}>
            <Input
              value={shipmentValues.voyageDetails}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, voyageDetails: event.target.value }))
              }
            />
          </FormField>
          <FormField label="SCAC Code" error={shipmentErrors.scacCode}>
            <Input
              value={shipmentValues.scacCode}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, scacCode: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Booking Number" error={shipmentErrors.bookingNumber}>
            <Input
              value={shipmentValues.bookingNumber}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, bookingNumber: event.target.value }))
              }
            />
          </FormField>
          <FormField label="ETA Destination" error={shipmentErrors.etaDestination}>
            <Input
              type="date"
              value={shipmentValues.etaDestination}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, etaDestination: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Qty Shipped (KGS)" error={shipmentErrors.qtyShippedKgs}>
            <Input
              type="number"
              value={shipmentValues.qtyShippedKgs}
              onChange={(event) =>
                setShipmentValues((prev) => ({ ...prev, qtyShippedKgs: event.target.value }))
              }
            />
          </FormField>
        </div>
        <FormField label="Comments">
          <Textarea
            value={shipmentValues.comments}
            onChange={(event) =>
              setShipmentValues((prev) => ({ ...prev, comments: event.target.value }))
            }
          />
        </FormField>
        <FormField label="Note">
          <Textarea
            value={shipmentValues.note}
            onChange={(event) =>
              setShipmentValues((prev) => ({ ...prev, note: event.target.value }))
            }
          />
        </FormField>
        <FormField label="Remark">
          <Textarea
            value={shipmentValues.remark}
            onChange={(event) =>
              setShipmentValues((prev) => ({ ...prev, remark: event.target.value }))
            }
          />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShipmentOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitShipment}>Save Shipment</Button>
        </div>
      </DrawerForm>

      <DrawerForm
        title="Shipment Detail"
        open={Boolean(selectedShipment)}
        onOpenChange={(open) => !open && setSelectedShipment(null)}
      >
        {selectedShipment && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Container</p>
                <p className="font-medium">{selectedShipment.containerNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">BL No</p>
                <p className="font-medium">{selectedShipment.blNo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vessel</p>
                <p className="font-medium">{selectedShipment.vesselName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ETA Destination</p>
                <p className="font-medium">{selectedShipment.etaDestination}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={selectedShipment.shipmentStatus} />
              </div>
              {selectedShipment.shipmentStatus !== "Shipped" && (
                <Button onClick={handleMarkShipped}>Mark Shipped</Button>
              )}
            </div>
          </div>
        )}
      </DrawerForm>
    </AppShell>
  );
}
