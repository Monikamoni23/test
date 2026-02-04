"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/toast-provider";
import { useContracts } from "@/context/contracts-context";

const contractSchema = z.object({
  contractNumber: z.string().min(1, "Contract number is required"),
  rcnContractNumber: z.string().min(1, "RCN contract number is required"),
  dateSigningContract: z.string().min(1, "Date is required"),
  year: z.string().min(4, "Year is required"),
  grade: z.string().min(1, "Grade is required"),
  shipmentPeriod: z.string().min(1, "Shipment period is required"),
  incoterms: z.string().min(1, "Incoterms are required"),
  totalContractQuantityKgs: z.string().min(1, "Quantity is required"),
  contractPriceUsdKgs: z.string().min(1, "Price is required"),
  countryOfOrigin: z.string().min(1, "Country is required"),
  factory: z.string().min(1, "Factory is required"),
});

export default function ContractCreatePage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { addContract } = useContracts();
  const [values, setValues] = useState({
    contractNumber: "",
    rcnContractNumber: "",
    dateSigningContract: "",
    year: "2024",
    grade: "",
    shipmentPeriod: "",
    incoterms: "",
    totalContractQuantityKgs: "",
    contractPriceUsdKgs: "",
    countryOfOrigin: "India",
    factory: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const result = contractSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        nextErrors[error.path[0] as string] = error.message;
      });
      setErrors(nextErrors);
      return;
    }
    const quantity = Number(values.totalContractQuantityKgs);
    const priceKgs = Number(values.contractPriceUsdKgs);
    const newContractId = `c-${Date.now()}`;

    addContract({
      id: newContractId,
      contractNumber: values.contractNumber,
      rcnContractNumber: values.rcnContractNumber,
      dateSigningContract: values.dateSigningContract,
      year: Number(values.year),
      grade: values.grade,
      status: "Open",
      shipmentPeriod: values.shipmentPeriod,
      incoterms: values.incoterms,
      contractPriceUsdMt: priceKgs * 1000,
      contractPriceUsdLbs: priceKgs * 0.45,
      contractPriceUsdKgs: priceKgs,
      totalContractQuantityKgs: quantity,
      totalContractValue: quantity * priceKgs,
      shippedQuantityKgs: 0,
      openQty: quantity,
      openValue: quantity * priceKgs,
      openBookQty: quantity,
      openBookValue: quantity * priceKgs,
      countryOfOrigin: values.countryOfOrigin,
      factory: values.factory,
      allocationSummary: "Pending allocation",
    });

    pushToast({
      title: "Contract created",
      description: "Next: Allocate the contract quantities",
      variant: "success",
    });

    router.push(`/contracts/${newContractId}?tab=overview`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Contracts", href: "/contracts" }, { label: "New" }]} />
        <div>
          <h1 className="text-xl font-semibold">Create Contract</h1>
          <p className="text-sm text-muted-foreground">
            Capture master contract details for Phase-1 registration.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <FormField label="Contract Number" error={errors.contractNumber}>
                <Input
                  placeholder="CN-2024-013"
                  value={values.contractNumber}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, contractNumber: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="RCN Contract Number" error={errors.rcnContractNumber}>
                <Input
                  placeholder="RCN-88913"
                  value={values.rcnContractNumber}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, rcnContractNumber: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Date Signing Contract" error={errors.dateSigningContract}>
                <Input
                  type="date"
                  value={values.dateSigningContract}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, dateSigningContract: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Year" error={errors.year}>
                <Input
                  value={values.year}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, year: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Grade" error={errors.grade}>
                <Select value={values.grade} onValueChange={(value) => setValues((prev) => ({ ...prev, grade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arabica G1">Arabica G1</SelectItem>
                    <SelectItem value="Arabica G2">Arabica G2</SelectItem>
                    <SelectItem value="Arabica G3">Arabica G3</SelectItem>
                    <SelectItem value="Robusta G1">Robusta G1</SelectItem>
                    <SelectItem value="Robusta G2">Robusta G2</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Shipment Period" error={errors.shipmentPeriod}>
                <Input
                  placeholder="Jun - Aug 2024"
                  value={values.shipmentPeriod}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, shipmentPeriod: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Incoterms" error={errors.incoterms}>
                <Select value={values.incoterms} onValueChange={(value) => setValues((prev) => ({ ...prev, incoterms: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incoterms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="CFR">CFR</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Total Contract Quantity (KGS)" error={errors.totalContractQuantityKgs}>
                <Input
                  type="number"
                  placeholder="100000"
                  value={values.totalContractQuantityKgs}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, totalContractQuantityKgs: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Contract Price USD (KGS)" error={errors.contractPriceUsdKgs}>
                <Input
                  type="number"
                  placeholder="3.5"
                  value={values.contractPriceUsdKgs}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, contractPriceUsdKgs: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Country of Origin" error={errors.countryOfOrigin}>
                <Select value={values.countryOfOrigin} onValueChange={(value) => setValues((prev) => ({ ...prev, countryOfOrigin: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Factory" error={errors.factory}>
                <Input
                  placeholder="Coorg Estates"
                  value={values.factory}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, factory: event.target.value }))
                  }
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit}>Create Contract</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
