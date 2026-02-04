"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FileUploadMock } from "@/components/file-upload-mock";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/toast-provider";
import { reconciliationItems as seedItems } from "@/mock/reconciliation";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function ReconciliationPage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState(seedItems);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUpload = (fileName: string) => {
    setUploadedFile(fileName);
    pushToast({
      title: "Buyer file uploaded",
      description: "Variance computed from buyer file",
      variant: "success",
    });
  };

  const handleResolve = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Resolved" } : item
      )
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Reconciliation" }]} />
        <div>
          <h1 className="text-xl font-semibold">Contract Alignment & Reconciliation</h1>
          <p className="text-sm text-muted-foreground">
            Upload buyer open position files, map fields, and resolve variances.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Buyer File Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadMock onUpload={handleUpload} />
              {uploadedFile && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  Uploaded {uploadedFile} · Variance computed
                </div>
              )}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Field Mapping</p>
                <div className="grid gap-3">
                  {[
                    "Contract Number",
                    "Buyer Open Qty",
                    "Buyer Open Value",
                  ].map((field) => (
                    <div key={field} className="grid grid-cols-2 items-center gap-2 text-sm">
                      <span>{field}</span>
                      <Select defaultValue={field}>
                        <SelectTrigger>
                          <SelectValue placeholder="Map field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={field}>{field}</SelectItem>
                          <SelectItem value="System Open Qty">System Open Qty</SelectItem>
                          <SelectItem value="System Open Value">System Open Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variance Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Buyer Open</TableHead>
                    <TableHead>System Open</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.contractNumber}</TableCell>
                      <TableCell>
                        {formatNumber(item.buyerOpenQty)} / {formatCurrency(item.buyerOpenValue)}
                      </TableCell>
                      <TableCell>
                        {formatNumber(item.systemOpenQty)} / {formatCurrency(item.systemOpenValue)}
                      </TableCell>
                      <TableCell>
                        {formatNumber(item.varianceQty)} / {formatCurrency(item.varianceValue)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{item.owner}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(item.id)}
                            disabled={item.status === "Resolved"}
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
