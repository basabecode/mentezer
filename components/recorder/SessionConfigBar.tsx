"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toPatientSlug } from "@/lib/patients/slug";

export interface SessionConfigBarProps {
  patientId: string;
  patientName: string;
  hasConsent: boolean;
  mode: "presential" | "virtual";
  permission: "accepted" | "declined" | null;
  onPermissionChange: (p: "accepted" | "declined") => void;
  recorderState: string;
}

export function SessionConfigBar({
  patientId,
  patientName,
  hasConsent,
  mode,
  permission,
  onPermissionChange,
  recorderState,
}: SessionConfigBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRecording = recorderState === "recording";
  const patientHref = `/patients/${toPatientSlug(patientName, patientId)}`;

  const initials = patientName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const permissionLabel =
    permission === "accepted"
      ? "Autoriza"
      : permission === "declined"
        ? "No autoriza"
        : "Sin definir";

  const modeLabel = mode === "presential" ? "Presencial" : "Virtual";

  // Resumen colapsado para mobile
  const mobileSummary = `${patientName.split(" ")[0]} · ${modeLabel} · ${permissionLabel}`;

  return (
    <div
      className="sticky top-0 z-20 rounded-2xl border bg-white px-4 py-3 shadow-sm"
      style={{ borderColor: "var(--psy-warm-border)" }}
    >
      {/* ── Barra de escritorio ── */}
      <div className="hidden items-center justify-between gap-4 sm:flex">
        {/* Izquierda: paciente */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-psy-blue-light text-sm font-bold text-psy-blue">
            {initials || <UserRound size={16} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-psy-ink leading-tight">{patientName}</p>
            <Link
              href={patientHref}
              className="text-[11px] text-psy-blue hover:underline"
            >
              Ver ficha →
            </Link>
          </div>
          {isRecording && (
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              REC
            </span>
          )}
        </div>

        {/* Centro: tabs modo */}
        <div className="inline-flex items-center gap-1 rounded-xl border p-1" style={{ borderColor: "var(--psy-warm-border)" }}>
          <Link
            href={`/sessions/new?patient=${patientId}&mode=presential`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              mode === "presential"
                ? "bg-psy-blue-light text-psy-blue"
                : "text-psy-muted hover:text-psy-ink",
            )}
          >
            Presencial
          </Link>
          <Link
            href={`/sessions/new?patient=${patientId}&mode=virtual`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              mode === "virtual"
                ? "bg-psy-blue-light text-psy-blue"
                : "text-psy-muted hover:text-psy-ink",
            )}
          >
            Virtual
          </Link>
        </div>

        {/* Derecha: consentimiento */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-psy-muted">Consentimiento:</span>
          <button
            type="button"
            onClick={() => onPermissionChange("accepted")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
              permission === "accepted"
                ? "border-psy-green/30 bg-psy-green/10 text-psy-green"
                : "border-psy-border bg-white text-psy-muted hover:border-psy-green/30 hover:text-psy-green",
            )}
          >
            <CheckCircle size={13} />
            Sí autoriza
          </button>
          <button
            type="button"
            onClick={() => onPermissionChange("declined")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
              permission === "declined"
                ? "border-psy-red/30 bg-psy-red-light text-psy-red"
                : "border-psy-border bg-white text-psy-muted hover:border-psy-red/30 hover:text-psy-red",
            )}
          >
            <XCircle size={13} />
            No autoriza
          </button>

          {permission && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                permission === "accepted"
                  ? "bg-psy-green/10 text-psy-green"
                  : "bg-psy-red-light text-psy-red",
              )}
            >
              {permissionLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Barra mobile colapsable ── */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-psy-blue-light text-xs font-bold text-psy-blue">
              {initials || <UserRound size={14} />}
            </div>
            <span className="text-sm font-medium text-psy-ink">{mobileSummary}</span>
            {isRecording && (
              <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                REC
              </span>
            )}
          </div>
          {mobileOpen ? <ChevronUp size={16} className="text-psy-muted" /> : <ChevronDown size={16} className="text-psy-muted" />}
        </button>

        {mobileOpen && (
          <div className="mt-3 flex flex-col gap-3 border-t pt-3" style={{ borderColor: "var(--psy-warm-border)" }}>
            {/* Link ficha */}
            <Link
              href={patientHref}
              className="text-xs text-psy-blue hover:underline"
            >
              Ver ficha de {patientName} →
            </Link>

            {/* Tabs modo */}
            <div className="inline-flex items-center gap-1 self-start rounded-xl border p-1" style={{ borderColor: "var(--psy-warm-border)" }}>
              <Link
                href={`/sessions/new?patient=${patientId}&mode=presential`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  mode === "presential" ? "bg-psy-blue-light text-psy-blue" : "text-psy-muted",
                )}
              >
                Presencial
              </Link>
              <Link
                href={`/sessions/new?patient=${patientId}&mode=virtual`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  mode === "virtual" ? "bg-psy-blue-light text-psy-blue" : "text-psy-muted",
                )}
              >
                Virtual
              </Link>
            </div>

            {/* Consentimiento */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPermissionChange("accepted")}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition",
                  permission === "accepted"
                    ? "border-psy-green/30 bg-psy-green/10 text-psy-green"
                    : "border-psy-border bg-white text-psy-muted",
                )}
              >
                <CheckCircle size={13} />
                Sí autoriza
              </button>
              <button
                type="button"
                onClick={() => onPermissionChange("declined")}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition",
                  permission === "declined"
                    ? "border-psy-red/30 bg-psy-red-light text-psy-red"
                    : "border-psy-border bg-white text-psy-muted",
                )}
              >
                <XCircle size={13} />
                No autoriza
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
