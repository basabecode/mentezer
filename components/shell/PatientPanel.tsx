"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Clock, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
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
  const { sidebarOpen: open } = useDashboard();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const active = filtered.filter((p) => p.status === "active");

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full shrink-0 overflow-hidden lg:flex flex-col"
        >
          <div className="flex flex-col h-full rounded-[2.5rem] border border-psy-border bg-psy-paper shadow-sm overflow-hidden">
            {/* Header del panel vertical integrado */}
            <div className="px-6 pt-8 pb-4 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-psy-blue font-bold">
                    Seguimiento
                  </p>
                  <h2 className="mt-1 font-sora text-xl font-bold tracking-tight text-psy-ink">
                    Pacientes
                  </h2>
                </div>
                <Link
                  href="/patients/new"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-blue text-white shadow-lg shadow-psy-blue/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Buscador vertical */}
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-psy-muted" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl border border-psy-border bg-psy-cream/30 py-3 pl-11 pr-4 text-xs text-psy-ink placeholder:text-psy-muted transition-all focus:border-psy-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-psy-blue/5"
                />
              </div>
            </div>

            <div className="h-px bg-psy-border mx-6 opacity-60" />

            {/* Lista Vertical con Scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
              {active.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-psy-cream flex items-center justify-center mb-3">
                    <Users size={20} className="text-psy-muted" />
                  </div>
                  <p className="text-xs font-medium text-psy-muted italic">
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
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 border",
                          isActive
                            ? "border-psy-blue/20 bg-psy-blue text-white shadow-lg shadow-psy-blue/25"
                            : "border-transparent bg-psy-cream/40 text-psy-ink hover:border-psy-blue/10 hover:bg-psy-paper hover:shadow-md"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold transition-all duration-300 group-hover:scale-110",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-psy-blue shadow-sm border border-psy-border"
                          )}
                        >
                          {patient.name[0]?.toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn("truncate text-[14px] font-bold tracking-tight", isActive ? "text-white" : "text-psy-ink")}>
                            {patient.name}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 opacity-80">
                            {patient.riskLevel === "high" && (
                               <div className={cn("h-1.5 w-1.5 rounded-full bg-psy-red animate-pulse", isActive && "bg-white")} />
                            )}
                            <span className={cn("text-[11px] font-medium truncate", isActive ? "text-white" : "text-psy-muted")}>
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

            <div className="p-4 bg-psy-cream/20 border-t border-psy-border text-center">
              <p className="text-[10px] uppercase tracking-widest text-psy-muted font-bold">
                MENTEZER System
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

