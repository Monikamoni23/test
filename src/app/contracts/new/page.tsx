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
  rcnContractNumber: z.string().min(1, "Buyer contract number is required"),
  dateSigningContract: z.string().min(1, "Date is required"),
  year: z.string().min(4, "Year is required"),
  gradeId: z.string().min(1, "Grade is required"),
  shipmentPeriod: z.string().min(1, "Shipment period is required"),
  incoterms: z.string().min(1, "Incoterms are required"),
  totalContractQuantityKgs: z.string().min(1, "Quantity is required"),
});

const gradeOptions = [
  { id: "g1", name: "Arabica G1" },
  { id: "g2", name: "Arabica G2" },
  { id: "g3", name: "Arabica G3" },
  { id: "g4", name: "Robusta G1" },
  { id: "g5", name: "Robusta G2" },
];

export default function ContractCreatePage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { addContract } = useContracts();
  const [values, setValues] = useState({
    contractNumber: "",
    rcnContractNumber: "",
    dateSigningContract: "",
    year: "2024",
    gradeId: "",
    gradeName: "",
    shipmentPeriod: "",
    incoterms: "",
    totalContractQuantityKgs: "",
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

    const newId = addContract({
      contractNumber: values.contractNumber,
      rcnContractNumber: values.rcnContractNumber,
      dateSigningContract: values.dateSigningContract,
      year: Number(values.year),
      gradeId: values.gradeId,
      gradeName: values.gradeName,
      status: "Open",
      shipmentPeriod: values.shipmentPeriod,
      incoterms: values.incoterms,
      totalContractQuantityKgs: Number(values.totalContractQuantityKgs),
    });

    pushToast({
      title: "Contract created",
      description: "Next: Allocate quantities per sub-contract",
      variant: "success",
    });

    router.push(`/contracts/${newId}?tab=sub-contracts`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Contracts", href: "/contracts" }, { label: "New" }]} />
        <div>
          <h1 className="text-xl font-semibold">Create Master Contract</h1>
          <p className="text-sm text-muted-foreground">
            Capture master contract details for Phase-1 registration.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <FormField label="Contract Number" error={errors.contractNumber}>
                <Input
                  placeholder="MC-2024-013"
                  value={values.contractNumber}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, contractNumber: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Buyer Contract Number" error={errors.rcnContractNumber}>
                <Input
                  placeholder="BUY-88913"
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
              <FormField label="Grade" error={errors.gradeId}>
                <Select
                  value={values.gradeId}
                  onValueChange={(value) => {
                    const selectedGrade = gradeOptions.find((grade) => grade.id === value);
                    setValues((prev) => ({
                      ...prev,
                      gradeId: value,
                      gradeName: selectedGrade?.name ?? "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
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
                <Select
                  value={values.incoterms}
                  onValueChange={(value) => setValues((prev) => ({ ...prev, incoterms: value }))}
                >
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
