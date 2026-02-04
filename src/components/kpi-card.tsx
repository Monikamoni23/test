import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  helper?: string;
  trend?: "up" | "down" | "neutral";
  delta?: string;
  variant?: "default" | "primary" | "accent";
}

export function KpiCard({
  title,
  value,
  helper,
  trend = "neutral",
  delta,
  variant = "default",
}: KpiCardProps) {
  const trendIcon =
    trend === "up" ? (
      <ArrowUpRight className="h-3.5 w-3.5" />
    ) : trend === "down" ? (
      <ArrowDownRight className="h-3.5 w-3.5" />
    ) : null;

  return (
    <Card
      className={cn(
        "h-full border-0 shadow-sm",
        variant === "primary" && "bg-gradient-to-br from-primary/10 to-primary/0",
        variant === "accent" && "bg-gradient-to-br from-sky-100/60 to-white"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {delta && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
                trend === "up" && "bg-emerald-100 text-emerald-700",
                trend === "down" && "bg-rose-100 text-rose-700",
                trend === "neutral" && "bg-slate-100 text-slate-600"
              )}
            >
              {trendIcon}
              {delta}
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
        {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}
