"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DrawerFormProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function DrawerForm({ title, open, onOpenChange, children }: DrawerFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl", "left-auto right-0 top-0 h-screen translate-x-0 translate-y-0 rounded-none")}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
