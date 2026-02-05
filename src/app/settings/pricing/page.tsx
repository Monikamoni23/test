"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContracts } from "@/context/contracts-context";
import { gradeCatalog } from "@/mock/pricing";
import { formatCurrency } from "@/lib/utils";

export default function PricingMasterPage() {
  const { pricingMaster } = useContracts();
  const [grade, setGrade] = useState("all");
  const [country, setCountry] = useState("all");

  const gradeLookup = new Map(gradeCatalog.map((item) => [item.id, item.name]));

  const filtered = useMemo(() => {
    return pricingMaster.filter((item) => {
      const matchesGrade = grade === "all" || item.gradeId === grade;
      const matchesCountry = country === "all" || item.countryId === country;
      return matchesGrade && matchesCountry;
    });
  }, [country, grade, pricingMaster]);

  const activeWarnings = useMemo(() => {
    const map = new Map<string, number>();
    pricingMaster.forEach((row) => {
      if (!row.isActive) return;
      const key = `${row.gradeId}-${row.countryId}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).filter(([, count]) => count > 1);
  }, [pricingMaster]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Settings" }, { label: "Pricing Master" }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Grade × Country Pricing</h1>
            <p className="text-sm text-muted-foreground">
              Manage pricing master records with effective dates and active flags.
            </p>
          </div>
          <Button>Add Pricing Record</Button>
        </div>

        {activeWarnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Warning: Multiple active pricing rows detected for the same grade and country.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {gradeCatalog.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="Vietnam">Vietnam</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <DataTable
          data={filtered}
          searchPlaceholder="Search pricing"
          filterKey={(row) => `${row.gradeId} ${row.countryId} ${row.notes ?? ""}`}
          columns={[
            {
              key: "grade",
              header: "Grade",
              sortValue: (row) => gradeLookup.get(row.gradeId) ?? row.gradeId,
              render: (row) => (
                <div>
                  <p className="text-sm font-medium">{gradeLookup.get(row.gradeId)}</p>
                  <p className="text-xs text-muted-foreground">{row.gradeId}</p>
                </div>
              ),
            },
            {
              key: "country",
              header: "Country",
              sortValue: (row) => row.countryId,
              render: (row) => row.countryId,
            },
            {
              key: "price",
              header: "Price (USD/KG)",
              sortValue: (row) => row.contractPriceUsdKgs,
              render: (row) => formatCurrency(row.contractPriceUsdKgs, 2),
            },
            {
              key: "effective",
              header: "Effective",
              render: (row) => (
                <div>
                  <p className="text-sm">{row.effectiveFrom}</p>
                  <p className="text-xs text-muted-foreground">{row.effectiveTo ?? "Open"}</p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              sortValue: (row) => (row.isActive ? 1 : 0),
              render: (row) => <StatusBadge status={row.isActive ? "Open" : "Closed"} />,
            },
            {
              key: "actions",
              header: "Actions",
              render: () => (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost">
                    Archive
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
