import type { Metadata } from "next";
import "./globals.css";

import { ContractsProvider } from "@/context/contracts-context";
import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "Contract Management Prototype",
  description: "Phase-1 UI prototype for contract management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ContractsProvider>{children}</ContractsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
