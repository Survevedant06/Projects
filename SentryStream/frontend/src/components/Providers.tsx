"use client";

import { type ReactNode } from "react";
import { ToastProvider } from "@/contexts/ToastContext";

export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
