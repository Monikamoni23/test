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
          <KpiCard
            title="Total Contracts"
            value={totalContracts.toString()}
            delta="+3 this month"
            trend="up"
            variant="primary"
          />
          <KpiCard
            title="Open Qty (KGS)"
            value={formatNumber(openQty)}
            delta="-2.1%"
            trend="down"
          />
          <KpiCard
            title="Open Value"
            value={formatCurrency(openValue)}
            delta="+4.8%"
            trend="up"
            variant="accent"
          />
          <KpiCard
            title="Shipments This Week"
            value={shipmentsThisWeek.toString()}
            delta="+6 loads"
            trend="up"
          />
          <KpiCard
            title="Variances"
            value={variances.toString()}
            helper="Open reconciliation items"
            delta="-1 resolved"
            trend="down"
          />
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
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Upcoming shipments</p>
                  <span className="text-xs font-semibold text-primary">12 planned</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs">75% of April loads have bookings.</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Allocation review</p>
                  <span className="text-xs font-semibold text-amber-600">2 pending</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-1/3 rounded-full bg-amber-500" />
                </div>
                <p className="mt-2 text-xs">Hold for commercial approval.</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Reconciliation mismatches</p>
                  <span className="text-xs font-semibold text-rose-600">3 open</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-1/4 rounded-full bg-rose-500" />
                </div>
                <p className="mt-2 text-xs">Awaiting buyer confirmation.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: "Create", description: "Capture master contracts in minutes.", action: "Start a contract", href: "/contracts/new" },
            { title: "Allocate", description: "Split quantities by origin and factory.", action: "View allocations", href: "/contracts" },
            { title: "Shipments", description: "Track shipment advice and ETAs.", action: "Review shipments", href: "/contracts" },
          ].map((card) => (
            <Card key={card.title} className="border-0 bg-gradient-to-br from-white to-slate-50 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{card.title}</p>
                <p className="mt-2 text-lg font-semibold">{card.action}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href={card.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
