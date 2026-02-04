import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  helper?: string;
}

export function KpiCard({ title, value, helper }: KpiCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        {helper && (
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        )}
      </CardContent>
    </Card>
  );
}
