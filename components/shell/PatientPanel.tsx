"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const active = filtered.filter((p) => p.status === "active");

  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[rgba(223,243,248,0.88)] xl:flex">
      {/* Header del panel */}
      <div className="px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-psy-muted">
              Seguimiento
            </p>
            <h2 className="mt-1 font-serif text-lg font-semibold tracking-tight text-psy-ink">
              Pacientes activos
            </h2>
          </div>
          <Link
            href="/patients/new"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(13,34,50,0.08)] bg-white/55 text-psy-muted transition hover:bg-white hover:text-psy-blue"
            aria-label="Nuevo paciente"
          >
            <Plus size={14} />
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-psy-muted" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white/60 py-2 pl-8 pr-3 text-xs text-psy-ink placeholder:text-psy-muted transition-colors focus:border-psy-blue focus:outline-none focus:ring-1 focus:ring-psy-blue/30"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {active.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-psy-muted">
            {query ? "Sin resultados" : "Sin pacientes activos"}
          </p>
        ) : (
          active.map((patient) => {
            const isActive =
              pathname.includes(`/patients/${patient.id}`) ||
              pathname.includes(`/sessions`) && false;

            return (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className={cn(
                  "group flex items-center gap-3 rounded-[1rem] px-3 py-3 transition-colors",
                  isActive
                    ? "bg-psy-blue/10 text-psy-blue"
                    : "text-psy-ink hover:bg-white/70"
                )}
              >
                {/* Avatar inicial */}
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold",
                    patient.riskLevel === "high"
                      ? "bg-psy-red-light text-psy-red"
                      : patient.riskLevel === "medium"
                      ? "bg-psy-amber-light text-psy-amber"
                      : "bg-psy-blue-light text-psy-blue"
                  )}
                >
                  {patient.name[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{patient.name}</p>
                  {patient.lastSession && (
                    <div className="mt-1 flex items-center gap-1">
                      <Clock size={9} className="text-psy-muted" />
                      <span className="text-[10px] text-psy-muted">{patient.lastSession}</span>
                    </div>
                  )}
                </div>

                {/* Alertas */}
                <div className="flex shrink-0 items-center gap-1">
                  {patient.riskLevel === "high" && (
                    <AlertTriangle size={11} className="text-psy-red animate-pulse" />
                  )}
                  {patient.pendingAnalysis && (
                    <span className="w-1.5 h-1.5 rounded-full bg-psy-blue" />
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
