"use client";

import { useState } from "react";
import { SessionRecorder } from "@/components/recorder/SessionRecorder";
import { AudioPreflightPanel } from "@/components/recorder/AudioPreflightPanel";

interface PresentialSessionComposerProps {
  patientId: string;
  hasConsent: boolean;
}

export function PresentialSessionComposer({
  patientId,
  hasConsent,
}: PresentialSessionComposerProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [preflightReady, setPreflightReady] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      <SessionRecorder
        patientId={patientId}
        hasConsent={hasConsent}
        selectedDeviceId={selectedDeviceId}
        preflightReady={preflightReady}
      />

      <div className="rounded-2xl border border-psy-border/70 bg-psy-blue-light/45 px-3 py-2.5">
        <p className="mb-0.5 text-[11px] font-medium text-psy-blue">Modo presencial</p>
        <p className="text-[11px] leading-relaxed text-psy-muted">
          Antes de iniciar, habilita el micrófono, prueba una grabación corta y confirma la transcripción de prueba.
        </p>
      </div>

      <AudioPreflightPanel
        selectedDeviceId={selectedDeviceId}
        onDeviceChange={setSelectedDeviceId}
        onValidatedChange={setPreflightReady}
      />
    </div>
  );
}
