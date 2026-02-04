import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  helperText?: string;
}

export function FormField({ label, error, children, helperText }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        {helperText && (
          <span className="text-[11px] text-muted-foreground">
            {helperText}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className={cn("text-xs text-destructive")}>{error}</p>
      )}
    </div>
  );
}
