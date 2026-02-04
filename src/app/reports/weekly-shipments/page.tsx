"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CsvDownloadButton } from "@/components/csv-download-button";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/toast-provider";
import { useContracts } from "@/context/contracts-context";

export default function WeeklyShipmentsPage() {
  const { pushToast } = useToast();
  const { shipments, emailLog, addEmailLog } = useContracts();
  const [includeUpdatesOnly, setIncludeUpdatesOnly] = useState(true);

  const handleGenerated = (fileName: string) => {
    addEmailLog({
      id: `e-${Date.now()}`,
      buyer: "Nordic Roasters",
      fileName,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "Sent",
      retryCount: 0,
    });
    pushToast({
      title: "CSV generated",
      description: "Weekly shipments report queued for email",
      variant: "success",
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Reports" }, { label: "Weekly Shipments" }]} />
        <div>
          <h1 className="text-xl font-semibold">Weekly Shipment CSV & Email Log</h1>
          <p className="text-sm text-muted-foreground">
            Configure weekly shipment advice exports and review delivery status.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Schedule Day</p>
                  <Select defaultValue="Friday">
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Time</p>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Timezone</p>
                  <Select defaultValue="GMT+8">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMT+8">GMT+8 (Singapore)</SelectItem>
                      <SelectItem value="GMT+5:30">GMT+5:30 (India)</SelectItem>
                      <SelectItem value="GMT+7">GMT+7 (Vietnam)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Buyer Recipients</p>
                  <Input defaultValue="buyer@coffee.com, ops@buyer.com" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={includeUpdatesOnly}
                  onChange={() => setIncludeUpdatesOnly((prev) => !prev)}
                />
                Include updated shipments only
              </label>
              <div className="flex items-center gap-2">
                <CsvDownloadButton
                  shipments={
                    includeUpdatesOnly
                      ? shipments.filter((s) => s.updatedIspPortal)
                      : shipments
                  }
                  onGenerated={handleGenerated}
                />
                <Button variant="outline">Save Schedule</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.buyer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.fileName}
                      </TableCell>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell>{log.retryCount}</TableCell>
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
