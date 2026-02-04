"use client";

import { useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const buyers = ["Nordic Roasters", "Blue River Coffee", "Atlas Trading"];
const factories = [
  "Mysuru Co-Op",
  "Da Nang Origin",
  "Kerala Beans",
  "Hanoi Harvest",
  "Coorg Estates",
];
const grades = [
  "Arabica G1",
  "Arabica G2",
  "Arabica G3",
  "Robusta G1",
  "Robusta G2",
];
const countries = ["India", "Vietnam"];

const sections = {
  buyers,
  factories,
  grades,
  countries,
};

type SectionKey = keyof typeof sections;

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<SectionKey>("buyers");

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Settings" }, { label: "Master Data" }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Master Data</h1>
            <p className="text-sm text-muted-foreground">
              Manage reference data used across contract workflows.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings/pricing">Go to Pricing Master</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            Object.keys(sections) as SectionKey[]
          ).map((key) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "ghost"}
              onClick={() => setActiveTab(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {sections[activeTab].map((item) => (
              <div key={item} className="rounded-md border border-dashed px-3 py-2">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
