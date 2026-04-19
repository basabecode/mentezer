"use client";

import { Bell, Search, Settings, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useDashboard } from "./DashboardContext";

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
  const { sidebarOpen, setSidebarOpen, setSettingsOpen } = useDashboard();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const firstName = psychologistName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 px-2 py-2 md:px-5 md:py-4">
      <div className="paper-texture mx-auto flex max-w-[1400px] items-center justify-between gap-2 rounded-3xl border border-psy-border bg-psy-paper/90 px-3 py-2.5 shadow-xl backdrop-blur-md md:gap-3 md:px-4 md:py-2.5">
        <div className="flex flex-1 items-center gap-4 min-w-0">
          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-psy-border bg-white/50 text-psy-muted transition hover:bg-white hover:text-psy-blue lg:flex"
            aria-label={sidebarOpen ? "Cerrar panel lateral" : "Abrir panel lateral"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <div className="h-6 w-px bg-psy-border hidden lg:block" />

          <div className="hidden lg:block shrink-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-psy-muted">
              {greeting}
            </p>
            <h1 className="mt-0.5 font-sora text-xl font-bold tracking-tight text-psy-ink">
              {firstName}
            </h1>
          </div>
          
          <div className="h-6 w-px bg-psy-border hidden lg:block" />
          
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-psy-ink/10 bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-ink md:h-10 md:w-10 md:rounded-2xl"
            aria-label="Buscar"
          >
            <Search size={15} />
          </button>

          <button
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl border border-psy-ink/10 bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-ink md:h-10 md:w-10 md:rounded-2xl",
              pendingAnalysis > 0 && "text-psy-amber"
            )}
            aria-label="Notificaciones"
          >
            <Bell size={15} />
            {pendingAnalysis > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-psy-amber animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-psy-ink/10 bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-blue md:h-10 md:w-10 md:rounded-2xl"
            aria-label="Configuración"
          >
            <Settings size={16} />
          </button>

          <div 
            onClick={() => setSettingsOpen(true)}
            className="ml-0.5 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-psy-blue/15 md:ml-1 md:h-11 md:w-11 md:rounded-2xl transition-transform hover:scale-105"
          >
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
    <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", colors[color])}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", pulse && "animate-pulse")} />
      <span>
        {value} {label}
      </span>
    </div>
  );
}
