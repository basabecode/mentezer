"use client";

import { ReactNode } from "react";

export function StepCard({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "warning" | "info";
}) {
  const toneClasses = {
    neutral: "border-psy-border/50 bg-white/65",
    warning: "border-psy-amber/20 bg-psy-amber-light",
    info: "border-psy-blue/20 bg-psy-blue-light",
  };

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}

export function StepLabel({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "amber" | "green" }) {
  const toneClasses = {
    blue: "text-psy-blue",
    amber: "text-psy-amber",
    green: "text-psy-green",
  };

  return (
    <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${toneClasses[tone]}`}>
      {children}
    </p>
  );
}

export function SuccessBox({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-psy-blue/20 bg-psy-blue-light p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-psy-blue text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="font-semibold text-psy-ink">{title}</p>
      <p className="mt-1 text-sm text-psy-muted">{subtitle}</p>
    </div>
  );
}

export function MetricsGrid({ items }: { items: Array<{ label: string; value: string; sub: string }> }) {
  return (
    <div className={`grid gap-3 ${items.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-psy-border/40 bg-white/65 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(96,126,201,0.10)] hover:border-psy-blue/20">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-psy-muted">{item.label}</p>
          <p className="mt-1.5 text-base font-semibold text-psy-ink">{item.value}</p>
          <p className="mt-0.5 text-[11px] text-psy-muted">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
