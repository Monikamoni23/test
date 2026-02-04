"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContracts } from "@/context/contracts-context";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { contracts, shipments } = useContracts();
  const totalContracts = contracts.length;
  const openQty = contracts.reduce((sum, contract) => sum + contract.openQty, 0);
  const openValue = contracts.reduce(
    (sum, contract) => sum + contract.openValue,
    0
  );
  const shipmentsThisWeek = shipments.filter(
    (shipment) => shipment.status === "Shipped"
  ).length;
  const variances = 4;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Total Contracts" value={totalContracts.toString()} />
          <KpiCard title="Open Qty (KGS)" value={formatNumber(openQty)} />
          <KpiCard title="Open Value" value={formatCurrency(openValue)} />
          <KpiCard title="Shipments This Week" value={shipmentsThisWeek.toString()} />
          <KpiCard title="Variances" value={variances.toString()} helper="Open reconciliation items" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Phase-1 Workflow Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Track contracts end-to-end: create master contracts, allocate by country,
                add shipment advice updates, and reconcile buyer files in one flow.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/contracts/new">Create Contract</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/reports/weekly-shipments">Weekly Report Log</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/reconciliation">Reconciliation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg border border-dashed p-3">
                <p className="text-xs font-semibold text-foreground">Upcoming shipments</p>
                <p className="mt-1 text-xs">
                  12 planned shipments awaiting booking confirmations.
                </p>
              </div>
              <div className="rounded-lg border border-dashed p-3">
                <p className="text-xs font-semibold text-foreground">Allocation review</p>
                <p className="mt-1 text-xs">
                  2 contracts pending allocation confirmation.
                </p>
              </div>
              <div className="rounded-lg border border-dashed p-3">
                <p className="text-xs font-semibold text-foreground">Reconciliation mismatches</p>
                <p className="mt-1 text-xs">
                  3 mismatches require assignment and resolution.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
