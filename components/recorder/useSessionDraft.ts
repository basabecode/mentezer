"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RecordingSettings } from "@/components/recorder/RecordingSettingsPanel";

export type ComposerView = "transcript" | "analysis";

export interface DraftCuePoint {
  id: string;
  label: string;
  timestampLabel: string;
}

export interface DraftNote {
  id: string;
  content: string;
  timestampLabel: string;
}

const DEFAULT_SETTINGS: RecordingSettings = {
  audioQuality: "high",
  format: "webm",
  noiseCancellation: true,
  diarization: true,
  language: "es",
  safetyTrack: true,
  preRecordSeconds: 3,
};

interface StoredDraft {
  activeView: ComposerView;
  settings: RecordingSettings;
  cuePoints: DraftCuePoint[];
  notes: DraftNote[];
  summaryRequested: boolean;
  lastSavedAt?: string | null;
}

const DEFAULT_DRAFT: StoredDraft = {
  activeView: "transcript",
  settings: DEFAULT_SETTINGS,
  cuePoints: [],
  notes: [],
  summaryRequested: false,
  lastSavedAt: null,
};

export function useSessionDraft(patientId: string) {
  const storageKey = useMemo(() => `mentezer:new-session:${patientId}:draft`, [patientId]);
  const [activeView, setActiveView] = useState<ComposerView>(DEFAULT_DRAFT.activeView);
  const [settings, setSettings] = useState<RecordingSettings>(DEFAULT_DRAFT.settings);
  const [cuePoints, setCuePoints] = useState<DraftCuePoint[]>(DEFAULT_DRAFT.cuePoints);
  const [notes, setNotes] = useState<DraftNote[]>(DEFAULT_DRAFT.notes);
  const [summaryRequested, setSummaryRequested] = useState(DEFAULT_DRAFT.summaryRequested);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(DEFAULT_DRAFT.lastSavedAt ?? null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredDraft>;
        setActiveView(parsed.activeView === "analysis" ? "analysis" : "transcript");
        setSettings({ ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) });
        setCuePoints(Array.isArray(parsed.cuePoints) ? parsed.cuePoints : []);
        setNotes(Array.isArray(parsed.notes) ? parsed.notes : []);
        setSummaryRequested(Boolean(parsed.summaryRequested));
        setLastSavedAt(parsed.lastSavedAt ?? null);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;

    const nextSavedAt = new Date().toISOString();
    const payload: StoredDraft = {
      activeView,
      settings,
      cuePoints,
      notes,
      summaryRequested,
      lastSavedAt: nextSavedAt,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    setLastSavedAt(nextSavedAt);
  }, [activeView, cuePoints, hydrated, notes, settings, storageKey, summaryRequested]);

  const clearDraft = useCallback(() => {
    setCuePoints([]);
    setNotes([]);
    setSummaryRequested(false);
    setActiveView("transcript");
    setLastSavedAt(new Date().toISOString());
  }, []);

  return {
    activeView,
    setActiveView,
    settings,
    setSettings,
    cuePoints,
    setCuePoints,
    notes,
    setNotes,
    summaryRequested,
    setSummaryRequested,
    lastSavedAt,
    hydrated,
    clearDraft,
  };
}
