"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap",
          "rounded-xl border border-white/10 bg-psy-ink px-2.5 py-1.5",
          "text-[11px] font-medium tracking-wide text-white shadow-xl",
          "opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100",
          side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
        )}
      >
        {label}
      </span>
    </div>
  );
}
