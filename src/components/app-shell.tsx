"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Warehouse,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/reconciliation", label: "Reconciliation", icon: Activity },
  { href: "/reports/weekly-shipments", label: "Weekly Reports", icon: ClipboardList },
  { href: "/settings/master-data", label: "Master Data", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 border-r bg-background p-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Warehouse className="h-5 w-5 text-primary" />
          ContractOS
        </div>
        <div className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("sidebar-link", isActive && "active")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-10 rounded-lg border bg-muted/50 p-4 text-xs text-muted-foreground">
          Phase-1 Prototype
          <p className="mt-2 text-[11px]">
            Contract lifecycle orchestration for trading ops.
          </p>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-8 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back</p>
            <p className="text-lg font-semibold">Contract Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              Phase-1 Demo
            </div>
            <div className="text-xs text-muted-foreground">Olivia Chen</div>
          </div>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
