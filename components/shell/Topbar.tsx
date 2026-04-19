"use client";

import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TopbarProps {
  psychologistName: string;
  activePatients: number;
  pendingAnalysis: number;
  avatarUrl?: string;
}

export function Topbar({
  psychologistName,
  activePatients,
  pendingAnalysis,
  avatarUrl,
}: TopbarProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const firstName = psychologistName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 px-3 py-3 md:px-5 md:py-4">
      <div className="paper-texture mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-[1.6rem] border border-[var(--border)] bg-psy-paper/88 px-4 py-3 shadow-[0_12px_36px_rgba(13,34,50,0.08)] backdrop-blur-md md:px-5">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-psy-muted">
            {greeting}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-psy-ink md:text-2xl">
              {firstName}
            </h1>
            <span className="hidden rounded-full bg-psy-blue-light px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-psy-blue sm:inline-flex">
              Portal clínico
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Stat label="Pacientes activos" value={activePatients} color="blue" />
            <Stat label="Pendientes" value={pendingAnalysis} color={pendingAnalysis > 0 ? "amber" : "green"} pulse={pendingAnalysis > 0} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(13,34,50,0.08)] bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-ink"
            aria-label="Buscar"
          >
            <Search size={16} />
          </button>

          <button
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(13,34,50,0.08)] bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-ink",
              pendingAnalysis > 0 && "text-psy-amber"
            )}
            aria-label="Notificaciones"
          >
            <Bell size={16} />
            {pendingAnalysis > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-psy-amber animate-pulse" />
            )}
          </button>

          <div className="ml-1 flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-psy-blue/15">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={psychologistName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-psy-blue">
                {firstName[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  color,
  pulse,
}: {
  label: string;
  value: number;
  color: "blue" | "amber" | "green";
  pulse?: boolean;
}) {
  const colors = {
    blue: "text-psy-blue bg-psy-blue-light",
    amber: "text-psy-amber bg-psy-amber-light",
    green: "text-psy-green bg-psy-green-light",
  };

  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", colors[color])}>
      <span className={cn("w-1.5 h-1.5 rounded-full bg-current", pulse && "animate-pulse")} />
      <span>
        {value} {label}
      </span>
    </div>
  );
}
