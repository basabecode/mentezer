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
    <header className="sticky top-0 z-40 bg-psy-paper/80 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Saludo + stats */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-psy-ink font-medium">
              {greeting}, {firstName}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Stat label="Pacientes activos" value={activePatients} color="blue" />
            {pendingAnalysis > 0 && (
              <Stat label="Pendientes de análisis" value={pendingAnalysis} color="amber" pulse />
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-cream transition-colors"
            aria-label="Buscar"
          >
            <Search size={16} />
          </button>

          <button
            className={cn(
              "relative p-2 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-cream transition-colors",
              pendingAnalysis > 0 && "text-psy-amber"
            )}
            aria-label="Notificaciones"
          >
            <Bell size={16} />
            {pendingAnalysis > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-psy-amber rounded-full animate-pulse" />
            )}
          </button>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-psy-blue/15 flex items-center justify-center overflow-hidden ml-1">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={psychologistName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-psy-blue">
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
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", colors[color])}>
      <span className={cn("w-1.5 h-1.5 rounded-full bg-current", pulse && "animate-pulse")} />
      <span>{value} {label}</span>
    </div>
  );
}
