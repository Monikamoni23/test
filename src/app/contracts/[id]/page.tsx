"use client";

import { useMemo, useState } from "react";
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
import type { AllocationLine, ShipmentAdvice } from "@/types";

const shipmentSchema = z.object({
  containerNumber: z.string().min(1, "Container number is required"),
  linerSealNumber: z.string().min(1, "Liner seal number is required"),
  factory: z.string().min(1, "Factory is required"),
  blNo: z.string().min(1, "BL number is required"),
  vesselName: z.string().min(1, "Vessel name is required"),
  voyageDetails: z.string().min(1, "Voyage details are required"),
  scacCode: z.string().min(1, "SCAC code is required"),
  bookingNumber: z.string().min(1, "Booking number is required"),
  etaDestination: z.string().min(1, "ETA destination is required"),
  qtyShippedKgs: z.string().min(1, "Quantity is required"),
});

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { contracts, allocations, shipments, updateAllocations, addShipment, markShipmentShipped } = useContracts();
  const { pushToast } = useToast();
  const contractId = params.id as string;
  const contract = contracts.find((item) => item.id === contractId);

  const tab = searchParams.get("tab") ?? "overview";
  const [allocationDraft, setAllocationDraft] = useState<AllocationLine[]>(
    allocations.filter((line) => line.contractId === contractId)
  );
  const [allocationLocked, setAllocationLocked] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentAdvice | null>(null);
  const [shipmentValues, setShipmentValues] = useState({
    containerNumber: "",
    linerSealNumber: "",
    factory: contract?.factory ?? "",
    blNo: "",
    vesselName: "",
    voyageDetails: "",
    scacCode: "",
    bookingNumber: "",
    etaDestination: "",
    qtyShippedKgs: "",
    comments: "",
  });
  const [shipmentErrors, setShipmentErrors] = useState<Record<string, string>>({});

  const contractShipments = shipments.filter(
    (shipment) => shipment.contractId === contractId
  );

  const allocationTotal = allocationDraft.reduce(
    (sum, line) => sum + line.allocatedQtyKgs,
    0
  );
  const allocationRemaining = contract
    ? contract.totalContractQuantityKgs - allocationTotal
    : 0;

  const workflowSteps = useMemo(() => {
    return [
      { label: "Create Contract", status: "complete" },
      {
        label: "Allocate",
        status: allocationLocked ? "complete" : tab === "allocation" ? "current" : "upcoming",
      },
      {
        label: "Add Shipments",
        status:
          contractShipments.length > 0
            ? "complete"
            : tab === "shipments"
            ? "current"
            : "upcoming",
      },
      { label: "Reconcile", status: tab === "reconciliation" ? "current" : "upcoming" },
    ] as const;
  }, [allocationLocked, contractShipments.length, tab]);

  if (!contract) {
    return (
      <AppShell>
        <div className="rounded-lg border border-dashed p-8 text-center">
          Contract not found.
        </div>
      </AppShell>
    );
  }

  const handleAddAllocation = () => {
    setAllocationDraft((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        contractId,
        countryOfOrigin: "India",
        factory: "",
        allocatedQtyKgs: 0,
      },
    ]);
  };

  const handleConfirmAllocation = () => {
    updateAllocations(contractId, allocationDraft);
    setAllocationLocked(true);
    setConfirmOpen(false);
    pushToast({
      title: "Allocation confirmed",
      description: "Allocation locked. Next: Add shipments",
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

    addShipment({
      id: `s-${Date.now()}`,
      contractId,
      containerNumber: shipmentValues.containerNumber,
      linerSealNumber: shipmentValues.linerSealNumber,
      factory: shipmentValues.factory,
      shippedDate: "",
      blNo: shipmentValues.blNo,
      vesselName: shipmentValues.vesselName,
      voyageDetails: shipmentValues.voyageDetails,
      scacCode: shipmentValues.scacCode,
      bookingNumber: shipmentValues.bookingNumber,
      etaDestination: shipmentValues.etaDestination,
      qtyShippedKgs: Number(shipmentValues.qtyShippedKgs),
      updatedIspPortal: "No",
      comments: shipmentValues.comments,
      note: "",
      remark: "",
      status: "Planned",
    });

    setShipmentErrors({});
    setShipmentOpen(false);
    pushToast({
      title: "Shipment created",
      description: "Shipment advice line added",
      variant: "success",
    });
  };

  const handleMarkShipped = () => {
    if (selectedShipment) {
      markShipmentShipped(selectedShipment.id, new Date().toISOString().slice(0, 10));
      pushToast({
        title: "Shipment updated",
        description: "Shipment marked as shipped",
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
                {contract.grade} • {contract.shipmentPeriod}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={contract.status} />
              {tab === "overview" && (
                <Button onClick={() => router.push(`/contracts/${contractId}?tab=allocation`)}>
                  Next: Allocate
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
              <p className="text-xs text-muted-foreground">{formatCurrency(contract.openValue)}</p>
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
              <p className="text-xs text-muted-foreground">{contract.allocationSummary}</p>
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
          {[
            { label: "Overview", value: "overview" },
            { label: "Allocation", value: "allocation" },
            { label: "Shipments", value: "shipments" },
            { label: "Reconciliation", value: "reconciliation" },
            { label: "Activity Log", value: "activity" },
          ].map((tabItem) => (
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
                  <p className="mt-2 text-sm">Total Quantity: {formatNumber(contract.totalContractQuantityKgs)} KGS</p>
                  <p className="text-sm">Total Value: {formatCurrency(contract.totalContractValue)}</p>
                  <p className="text-sm">Open Book Qty: {formatNumber(contract.openBookQty)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Allocation Summary</p>
                  <p className="mt-2 text-sm">{contract.allocationSummary}</p>
                  <p className="text-sm">Country of Origin: {contract.countryOfOrigin}</p>
                  <p className="text-sm">Factory: {contract.factory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "allocation" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Allocation Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleAddAllocation} disabled={allocationLocked}>
                  Add Line
                </Button>
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
                Total Contract Qty: {formatNumber(contract.totalContractQuantityKgs)} KGS | Allocated: {formatNumber(allocationTotal)} KGS | Remaining: {formatNumber(allocationRemaining)} KGS
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country of Origin</TableHead>
                    <TableHead>Factory</TableHead>
                    <TableHead>Allocated Qty (KGS)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocationDraft.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Select
                          value={line.countryOfOrigin}
                          onValueChange={(value) =>
                            setAllocationDraft((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, countryOfOrigin: value as AllocationLine["countryOfOrigin"] }
                                  : item
                              )
                            )
                          }
                          disabled={allocationLocked}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.factory ?? ""}
                          onChange={(event) =>
                            setAllocationDraft((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, factory: event.target.value }
                                  : item
                              )
                            )
                          }
                          disabled={allocationLocked}
                        />
                      </TableCell>
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Container</TableHead>
                    <TableHead>Factory</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{shipment.containerNumber}</p>
                        <p className="text-xs text-muted-foreground">{shipment.blNo}</p>
                      </TableCell>
                      <TableCell>{shipment.factory}</TableCell>
                      <TableCell>{formatNumber(shipment.qtyShippedKgs)}</TableCell>
                      <TableCell>{shipment.etaDestination}</TableCell>
                      <TableCell>
                        <StatusBadge status={shipment.status} />
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
                  Allocation confirmed by Priya Das · 2 days ago
                </div>
                <div className="rounded-md border border-dashed p-3">
                  Shipment advice added by Logistics Ops · 1 day ago
                </div>
                <div className="rounded-md border border-dashed p-3">
                  Weekly report sent to buyer · today
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        title="Confirm allocation"
        description="Confirming allocation will lock the editor for Phase-1 workflow."
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmAllocation}
      />

      <DrawerForm title="Create Shipment" open={shipmentOpen} onOpenChange={setShipmentOpen}>
        <div className="grid gap-4 md:grid-cols-2">
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
                <StatusBadge status={selectedShipment.status} />
              </div>
              {selectedShipment.status === "Planned" && (
                <Button onClick={handleMarkShipped}>Mark Shipped</Button>
              )}
            </div>
          </div>
        )}
      </DrawerForm>
    </AppShell>
  );
}
