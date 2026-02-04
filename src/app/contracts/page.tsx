"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContracts } from "@/context/contracts-context";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function ContractsPage() {
  const { contracts } = useContracts();
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [grade, setGrade] = useState("all");
  const [country, setCountry] = useState("all");
  const [factory, setFactory] = useState("all");

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesYear = year === "all" || contract.year.toString() === year;
      const matchesStatus = status === "all" || contract.status === status;
      const matchesGrade = grade === "all" || contract.grade === grade;
      const matchesCountry =
        country === "all" || contract.countryOfOrigin === country;
      const matchesFactory = factory === "all" || contract.factory === factory;
      return (
        matchesYear &&
        matchesStatus &&
        matchesGrade &&
        matchesCountry &&
        matchesFactory
      );
    });
  }, [contracts, year, status, grade, country, factory]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Contracts</h1>
            <p className="text-sm text-muted-foreground">
              Manage master contracts and contract lifecycle steps.
            </p>
          </div>
          <Button asChild>
            <Link href="/contracts/new">Create Contract</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="Arabica G1">Arabica G1</SelectItem>
                  <SelectItem value="Arabica G2">Arabica G2</SelectItem>
                  <SelectItem value="Arabica G3">Arabica G3</SelectItem>
                  <SelectItem value="Robusta G1">Robusta G1</SelectItem>
                  <SelectItem value="Robusta G2">Robusta G2</SelectItem>
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
              <Select value={factory} onValueChange={setFactory}>
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
            </div>
          </CardContent>
        </Card>

        <DataTable
          data={filteredContracts}
          searchPlaceholder="Search contracts"
          filterKey={(contract) =>
            `${contract.contractNumber} ${contract.rcnContractNumber} ${contract.factory}`
          }
          columns={[
            {
              key: "contract",
              header: "Contract",
              render: (contract) => (
                <div>
                  <p className="text-sm font-medium">{contract.contractNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.rcnContractNumber}
                  </p>
                </div>
              ),
            },
            {
              key: "grade",
              header: "Grade",
              render: (contract) => (
                <div>
                  <p className="text-sm">{contract.grade}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.shipmentPeriod}
                  </p>
                </div>
              ),
            },
            {
              key: "qty",
              header: "Open Qty",
              render: (contract) => (
                <div>
                  <p className="text-sm font-medium">
                    {formatNumber(contract.openQty)} KGS
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(contract.openValue)}
                  </p>
                </div>
              ),
            },
            {
              key: "origin",
              header: "Origin",
              render: (contract) => (
                <div>
                  <p className="text-sm">{contract.countryOfOrigin}</p>
                  <p className="text-xs text-muted-foreground">{contract.factory}</p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (contract) => <StatusBadge status={contract.status} />,
            },
            {
              key: "actions",
              header: "Actions",
              render: (contract) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/contracts/${contract.id}`}>View</Link>
                  </Button>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost">
                    Export
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
