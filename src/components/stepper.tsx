import { cn } from "@/lib/utils";

interface Step {
  label: string;
  status: "complete" | "current" | "upcoming";
}

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-4">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
              step.status === "complete" && "bg-emerald-500 text-white",
              step.status === "current" && "border-primary text-primary",
              step.status === "upcoming" && "text-muted-foreground"
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "text-xs",
              step.status === "current" && "text-primary font-medium",
              step.status === "upcoming" && "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className="h-px w-6 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}
