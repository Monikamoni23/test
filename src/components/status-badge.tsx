import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Open: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  "In Progress": "bg-sky-50 text-sky-700",
  Shipped: "bg-emerald-50 text-emerald-700",
  Completed: "bg-indigo-50 text-indigo-700",
  Matched: "bg-emerald-50 text-emerald-700",
  Mismatch: "bg-rose-50 text-rose-700",
  Resolved: "bg-indigo-50 text-indigo-700",
  Sent: "bg-emerald-50 text-emerald-700",
  Failed: "bg-rose-50 text-rose-700",
  Queued: "bg-amber-50 text-amber-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusStyles[status] ?? "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  );
}
