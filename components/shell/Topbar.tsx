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
    <header className="sticky top-0 z-40 px-2 py-2 md:px-5 md:py-4">
      <div className="paper-texture mx-auto flex max-w-[1400px] items-center justify-between gap-2 rounded-[1.4rem] border border-[var(--border)] bg-psy-paper/88 px-3 py-2.5 shadow-[0_12px_36px_rgba(13,34,50,0.08)] backdrop-blur-md md:rounded-[1.6rem] md:gap-3 md:px-5 md:py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-psy-muted md:text-[11px] md:tracking-[0.24em]">
            {greeting}
          </p>
          <div className="mt-0.5 flex items-center gap-2 md:mt-1">
            <h1 className="truncate font-serif text-lg font-semibold tracking-tight text-psy-ink md:text-2xl">
              {firstName}
            </h1>
            <span className="hidden rounded-full bg-psy-blue-light px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-psy-blue sm:inline-flex">
              Portal clínico
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:mt-2 md:gap-2">
            <Stat label="Pacientes" value={activePatients} color="blue" />
            <Stat label="Pendientes" value={pendingAnalysis} color={pendingAnalysis > 0 ? "amber" : "green"} pulse={pendingAnalysis > 0} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(13,34,50,0.08)] bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-ink md:h-10 md:w-10 md:rounded-2xl"
            aria-label="Buscar"
          >
            <Search size={15} />
          </button>

          <button
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(13,34,50,0.08)] bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-ink md:h-10 md:w-10 md:rounded-2xl",
              pendingAnalysis > 0 && "text-psy-amber"
            )}
            aria-label="Notificaciones"
          >
            <Bell size={15} />
            {pendingAnalysis > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-psy-amber animate-pulse" />
            )}
          </button>

          <div className="ml-0.5 flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-psy-blue/15 md:ml-1 md:h-11 md:w-11 md:rounded-2xl">
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
