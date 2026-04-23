"use client";

import { useState } from "react";
import { Bell, Menu, PanelLeftClose, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Tooltip } from "@/components/ui/Tooltip";
import { NotificationsPanel } from "./NotificationsPanel";
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
  const { navOpen, setNavOpen, setSettingsOpen } = useDashboard();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const firstName = psychologistName.split(" ")[0];

  const mockNotifications = pendingAnalysis > 0 ? [
    {
      id: "1",
      type: "analysis" as const,
      title: "Análisis en proceso",
      description: `${pendingAnalysis} sesión${pendingAnalysis > 1 ? "es" : ""} pendiente${pendingAnalysis > 1 ? "s" : ""} de análisis IA`,
      timestamp: new Date(),
      link: "/sessions",
      read: false,
    },
  ] : [];

  return (
    <header className="sticky top-0 z-40 px-2 py-2 md:px-5 md:py-3">
      <div className="calm-panel mx-auto flex max-w-[1480px] items-center justify-between gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
          <Tooltip label={navOpen ? "Cerrar navegación" : "Abrir navegación"} side="bottom">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#222729] bg-[#1e2224] text-white transition hover:bg-[#252a2d] lg:hidden"
              aria-label={navOpen ? "Cerrar navegación principal" : "Abrir navegación principal"}
            >
              {navOpen ? <PanelLeftClose size={17} /> : <Menu size={17} />}
            </button>
          </Tooltip>

          <div className="hidden h-5 w-px bg-psy-border sm:block" />

          <div className="shrink-0">
            <p className="font-mono text-[9px] uppercase tracking-widest text-psy-muted">
              {greeting}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="font-sora text-base font-semibold leading-none tracking-tight text-psy-ink">
                {firstName}
              </p>
              <span className="hidden rounded-full border border-psy-border bg-[#f6f8f7] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-psy-muted sm:inline-flex">
                {activePatients} activos
              </span>
            </div>
          </div>

          <div className="hidden h-5 w-px bg-psy-border lg:block" />

          <div className="min-w-0 flex-1 max-sm:hidden">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 md:gap-1.5">
          <Tooltip label={pendingAnalysis > 0 ? `${pendingAnalysis} pendiente${pendingAnalysis > 1 ? "s" : ""}` : "Notificaciones"} side="bottom">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-xl border border-psy-border bg-white/70 text-psy-muted transition hover:border-psy-blue/20 hover:bg-white hover:text-psy-ink md:h-9 md:w-9 md:rounded-xl",
                pendingAnalysis > 0 && "text-psy-amber",
                notificationsOpen && "border-psy-blue/20 bg-white text-psy-blue",
              )}
              aria-label="Notificaciones"
            >
              <Bell size={14} />
              {pendingAnalysis > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-psy-amber animate-pulse" />
              )}
            </button>
          </Tooltip>

          <Tooltip label="Configuración" side="bottom">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-psy-border bg-white/70 text-psy-muted transition hover:border-psy-blue/20 hover:bg-white hover:text-psy-blue md:h-9 md:w-9"
              aria-label="Configuración"
            >
              <Settings size={14} />
            </button>
          </Tooltip>

          <Tooltip label="Mi perfil" side="bottom">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSettingsOpen(true)}
              onKeyDown={(e) => e.key === "Enter" && setSettingsOpen(true)}
              className="ml-0.5 flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-psy-blue-light transition-transform hover:scale-105 md:h-9 md:w-9 md:rounded-xl"
              aria-label="Mi perfil"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={psychologistName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-psy-blue">
                  {firstName[0]?.toUpperCase()}
                </span>
              )}
            </div>
          </Tooltip>
        </div>
      </div>

      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={mockNotifications}
        pendingCount={pendingAnalysis}
      />
    </header>
  );
}
