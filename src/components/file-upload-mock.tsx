"use client";

import { UploadCloud } from "lucide-react";

interface FileUploadMockProps {
  onUpload: (fileName: string) => void;
}

export function FileUploadMock({ onUpload }: FileUploadMockProps) {
  return (
    <button
      className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-sm text-muted-foreground transition hover:bg-muted"
      onClick={() => onUpload("buyer-open-positions-may.xlsx")}
    >
      <UploadCloud className="h-6 w-6" />
      Click to upload buyer file (mock)
      <span className="text-xs text-muted-foreground">
        Supported: .xlsx, .csv
      </span>
    </button>
  );
}
