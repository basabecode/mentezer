"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Users, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDashboard } from "./DashboardContext";
import { motion, AnimatePresence } from "framer-motion";

interface Patient {
  id: string;
  name: string;
  status: "active" | "paused" | "closed";
  lastSession?: string;
  riskLevel?: "low" | "medium" | "high";
  pendingAnalysis?: boolean;
}

interface PatientPanelProps {
  patients: Patient[];
}

export function PatientPanel({ patients }: PatientPanelProps) {
  const { sidebarOpen: open, setSidebarOpen } = useDashboard();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const active = filtered.filter((p) => p.status === "active");

  const panelBody = (
    <div className="calm-panel flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-4 pt-6 md:px-6 md:pt-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-psy-blue">
              Seguimiento
            </p>
            <h2 className="mt-1 font-sora text-xl font-semibold tracking-tight text-psy-ink">
              Pacientes
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip label="Nuevo paciente" side="bottom">
              <Link
                href="/patients/new"
                className="calm-button-primary flex h-10 w-10 rounded-2xl shadow-none"
                aria-label="Nuevo paciente"
                onClick={() => setSidebarOpen(false)}
              >
                <Plus size={18} strokeWidth={2.5} />
              </Link>
            </Tooltip>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-psy-border bg-white/70 text-psy-muted transition hover:border-psy-blue/20 hover:bg-white hover:text-psy-ink lg:hidden"
              aria-label="Cerrar panel de pacientes"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-psy-muted" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="calm-input rounded-2xl py-3 pl-11 pr-4 text-xs"
          />
        </div>
      </div>

      <div className="mx-5 h-px bg-psy-border opacity-60 md:mx-6" />

      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 md:px-4 md:py-6">
        {active.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-psy-cream">
              <Users size={20} className="text-psy-muted" />
            </div>
            <p className="text-xs font-medium italic text-psy-muted">
              {query ? "Sin resultados" : "No hay pacientes activos"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {active.map((patient) => {
              const isActive = pathname.includes(`/patients/${patient.id}`);

              return (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all duration-300",
                    isActive
                      ? "border-psy-blue/20 bg-psy-blue text-white shadow-lg shadow-psy-blue/20"
                      : "border-transparent bg-white/78 text-psy-ink hover:border-psy-blue/10 hover:bg-white hover:shadow-md"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold transition-all duration-300 group-hover:scale-110",
                      isActive
                        ? "bg-white/20 text-white"
                        : "border border-psy-border bg-psy-blue-light text-psy-blue shadow-sm"
                    )}
                  >
                    {patient.name[0]?.toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-[14px] font-bold tracking-tight", isActive ? "text-white" : "text-psy-ink")}>
                      {patient.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 opacity-80">
                      {patient.riskLevel === "high" && (
                        <div className={cn("h-1.5 w-1.5 rounded-full bg-psy-red animate-pulse", isActive && "bg-white")} />
                      )}
                      <span className={cn("truncate text-[11px] font-medium", isActive ? "text-white" : "text-psy-muted")}>
                        {patient.lastSession || "Alta reciente"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-psy-border bg-psy-blue-light/35 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-psy-muted">
          MENTEZER System
        </p>
      </div>
    </div>
  );

  return (
    <AnimatePresence initial={false}>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-psy-ink/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-20 left-2 z-50 w-[min(24rem,calc(100vw-1rem))] lg:hidden"
          >
            {panelBody}
          </motion.aside>

          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden h-full shrink-0 overflow-hidden lg:block"
          >
            {panelBody}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
