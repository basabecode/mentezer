"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Mic,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Patient {
  id: string;
  name: string;
  consent_signed_at: string | null;
  status: string;
}

interface SessionSidebarProps {
  patients: Patient[];
  selectedId: string;
  selectedName: string;
  hasConsent: boolean;
  mode: "presential" | "virtual";
  recordingPermission: "accepted" | "declined" | null;
}

export function SessionSidebar({
  patients,
  selectedId,
  selectedName,
  hasConsent,
  mode,
  recordingPermission,
}: SessionSidebarProps) {
  const [open, setOpen] = useState(false);

  const consentLabel =
    recordingPermission === "accepted"
      ? "Autoriza"
      : recordingPermission === "declined"
        ? "No autoriza"
        : "Sin definir";

  const consentTone =
    recordingPermission === "accepted"
      ? "bg-psy-green-light text-psy-green"
      : recordingPermission === "declined"
        ? "bg-psy-amber-light text-psy-amber"
        : "bg-[#eef3f4] text-psy-muted";

  const content = (
    <div className="space-y-4 pt-1">
      {/* Paciente activo */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-psy-muted">Paciente activo</p>
        <div className="mt-2 rounded-[1.1rem] border border-[#d6e5eb] bg-white/90 px-3.5 py-3">
          <p className="text-base font-medium tracking-tight text-psy-ink">{selectedName}</p>
          <p className="mt-1 text-[11px] leading-5 text-psy-muted">
            {hasConsent
              ? "Audio y transcripción disponibles."
              : "Solo nota escrita hasta firmar consentimiento."}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {patients.map((patient) => {
            const initials = patient.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("");
            const active = patient.id === selectedId;

            return (
              <Link
                key={patient.id}
                href={`/sessions/new?patient=${patient.id}&mode=${mode}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm transition",
                  active
                    ? "border-[#4f8ea7] bg-[#edf6fa] text-[#2f6f89]"
                    : "border-[#d6e5eb] bg-white/85 text-psy-muted hover:border-psy-blue/30 hover:text-psy-ink"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] font-semibold">
                  {initials}
                </span>
                {patient.name.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modo */}
      <div className="border-t border-[#dbe8ee] pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-psy-muted">Modo</p>
        <div className="mt-2 grid gap-2">
          {[
            {
              key: "presential",
              href: `/sessions/new?patient=${selectedId}&mode=presential`,
              title: "Presencial",
              copy: "Grabar con micrófono",
              icon: Mic,
            },
            {
              key: "virtual",
              href: `/sessions/new?patient=${selectedId}&mode=virtual`,
              title: "Virtual",
              copy: "Subir archivo",
              icon: Upload,
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = mode === item.key;
            return (
              <Link
                key={item.key}
                href={`${item.href}${recordingPermission ? `&consent=${recordingPermission}` : ""}`}
                className={cn(
                  "rounded-[1rem] border px-3.5 py-2.5 transition",
                  active
                    ? "border-[#4f8ea7] bg-[#edf6fa] text-[#2f6f89] shadow-[0_8px_16px_rgba(79,142,167,0.08)]"
                    : "border-[#d6e5eb] bg-white/85 text-psy-muted hover:border-psy-blue/30 hover:text-psy-ink"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} />
                  <span className="text-sm font-medium tracking-tight">{item.title}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-5 opacity-80">{item.copy}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Consentimiento */}
      <div className="border-t border-[#dbe8ee] pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-psy-muted">Consentimiento</p>
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium", consentTone)}>
            {consentLabel}
          </span>
        </div>

        {!hasConsent && (
          <div className="mt-2.5 rounded-[1rem] border border-[#e7caa2] bg-[linear-gradient(180deg,#fff7ec_0%,#fffdf8_100%)] px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#fff1de] text-[#bf7b32]">
                <AlertTriangle size={13} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-[#8f5d20]">Sin firma</p>
                <p className="mt-0.5 text-[11px] leading-5 text-[#9a6d33]">
                  La captura de audio queda bloqueada hasta obtener consentimiento.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2.5 grid gap-2">
          {[
            { value: "accepted", title: "Sí autoriza", copy: "Audio y transcripción" },
            { value: "declined", title: "No autoriza", copy: "Solo nota escrita" },
          ].map((item) => {
            const active = recordingPermission === item.value;
            return (
              <Link
                key={item.value}
                href={`/sessions/new?patient=${selectedId}&mode=${mode}&consent=${item.value}`}
                className={cn(
                  "rounded-[1rem] border px-3.5 py-2.5 transition",
                  active
                    ? item.value === "accepted"
                      ? "border-[#6aa273] bg-[#f4fbf4] text-[#497c50] shadow-[0_8px_16px_rgba(106,162,115,0.08)]"
                      : "border-[#d8b483] bg-[#fff8ef] text-[#a66f2d] shadow-[0_8px_16px_rgba(191,123,50,0.08)]"
                    : "border-[#d6e5eb] bg-white/85 text-psy-muted hover:border-psy-blue/30 hover:text-psy-ink"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-[4px] border text-[10px]",
                      active
                        ? item.value === "accepted"
                          ? "border-[#6aa273] bg-[#6aa273] text-white"
                          : "border-[#bf7b32] bg-[#bf7b32] text-white"
                        : "border-[#c9d7de] bg-white text-transparent"
                    )}
                  >
                    ✓
                  </span>
                  <span className="text-sm font-medium tracking-tight">{item.title}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-5 opacity-80">{item.copy}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile/Tablet: drawer colapsable ── */}
      <div className="xl:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-[1.3rem] border px-4 py-3 transition",
            open
              ? "border-[#4f8ea7] bg-[#edf6fa]"
              : "border-[#dbe8ee] bg-[linear-gradient(180deg,#f3f9fc_0%,#ffffff_100%)]",
            "shadow-[0_6px_14px_rgba(13,34,50,0.04)]"
          )}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition",
              open ? "bg-[#d6edf5] text-[#2f6f89]" : "bg-[#eef5f8] text-psy-blue"
            )}>
              <SlidersHorizontal size={14} />
            </div>
            <div className="text-left">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-psy-muted">Configuración de sesión</p>
              <p className="mt-0.5 text-sm font-medium text-psy-ink">
                {selectedName.split(" ")[0]} · <span className="capitalize">{mode === "presential" ? "Presencial" : "Virtual"}</span> · {consentLabel}
              </p>
            </div>
          </div>
          <div className="text-psy-muted">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {open && (
          <div className="mt-2 rounded-[1.3rem] border border-[#dbe8ee] bg-[linear-gradient(180deg,#f3f9fc_0%,#ffffff_100%)] p-4 shadow-[0_6px_14px_rgba(13,34,50,0.04)]">
            {content}
          </div>
        )}
      </div>

      {/* ── Desktop xl+: sidebar fija ── */}
      <aside className="hidden shrink-0 xl:block xl:w-[220px] 2xl:w-[236px]">
        <div className="sticky top-4 rounded-[1.5rem] border border-[#dbe8ee] bg-[linear-gradient(180deg,#f3f9fc_0%,#ffffff_100%)] p-4 shadow-[0_10px_22px_rgba(13,34,50,0.04)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-psy-muted">Configuración</p>
          {content}
        </div>
      </aside>
    </>
  );
}
