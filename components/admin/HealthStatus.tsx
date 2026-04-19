"use client";

import { useEffect, useState } from "react";

interface HealthCheck {
  status: "healthy" | "degraded";
  checks: {
    supabase: { ok: boolean; latency: number };
    claude: { ok: boolean; latency: number };
    storage: { ok: boolean; latency: number };
  };
}

const HEALTH_LABELS: Record<string, string> = {
  supabase: "Supabase DB",
  claude: "API Claude",
  storage: "Storage",
};

export function HealthStatus() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!response.ok) {
          // Non-2xx: treat as degraded without polluting the console.
          if (!cancelled) setHealth(null);
          return;
        }
        const data = (await response.json()) as HealthCheck;
        if (!cancelled) setHealth(data);
      } catch {
        // Network-level failure: keep widget silent, show fallback UI.
        if (!cancelled) setHealth(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {["supabase", "claude", "storage"].map((key) => (
          <div key={key} className="flex items-center justify-between rounded-[1.2rem] bg-white/62 px-4 py-3">
            <p className="text-sm text-[var(--psy-ink)]">{HEALTH_LABELS[key]}</p>
            <div className="h-2 w-2 rounded-full bg-psy-muted/30 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!health) {
    return (
      <div className="rounded-lg border border-psy-red/20 bg-psy-red/5 p-4">
        <p className="text-sm text-psy-red">No se pudo verificar el estado de la plataforma</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(health.checks).map(([key, check]) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-[1.2rem] bg-white/62 px-4 py-3 transition-all duration-200 hover:bg-white hover:shadow-[0_4px_12px_rgba(13,34,50,0.06)]"
        >
          <p className="text-sm text-[var(--psy-ink)]">{HEALTH_LABELS[key]}</p>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                check.ok ? "bg-[var(--psy-green)]" : "bg-[var(--psy-red)] animate-pulse"
              }`}
            />
            <span className={`text-xs font-medium ${check.ok ? "text-[var(--psy-green)]" : "text-[var(--psy-red)]"}`}>
              {check.ok ? "Operativo" : "Error"}
            </span>
            {check.latency > 0 && (
              <span className="text-[10px] text-psy-muted ml-2">({check.latency}ms)</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
