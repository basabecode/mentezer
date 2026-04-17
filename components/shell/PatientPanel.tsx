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
    <aside className="w-60 shrink-0 flex flex-col h-full border-r border-[var(--border)] bg-psy-paper">
      {/* Header del panel */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-sm font-semibold text-psy-ink">Pacientes</h2>
          <Link
            href="/patients/new"
            className="p-1 rounded-md text-psy-muted hover:text-psy-blue hover:bg-psy-blue-light transition-colors"
            aria-label="Nuevo paciente"
          >
            <Plus size={14} />
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-psy-muted" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-psy-cream border border-[var(--border)] text-psy-ink placeholder:text-psy-muted focus:outline-none focus:ring-1 focus:ring-psy-blue/30 focus:border-psy-blue transition-colors"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {active.length === 0 ? (
          <p className="text-xs text-psy-muted text-center py-8 px-4">
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
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors group",
                  isActive
                    ? "bg-psy-blue/8 text-psy-blue"
                    : "hover:bg-psy-cream text-psy-ink"
                )}
              >
                {/* Avatar inicial */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
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
                  <p className="text-xs font-medium truncate">{patient.name}</p>
                  {patient.lastSession && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={9} className="text-psy-muted" />
                      <span className="text-[10px] text-psy-muted">{patient.lastSession}</span>
                    </div>
                  )}
                </div>

                {/* Alertas */}
                <div className="flex items-center gap-1 shrink-0">
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
