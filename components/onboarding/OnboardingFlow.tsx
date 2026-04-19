"use client";

import { useActionState, useMemo, useState } from "react";
import type { OnboardingState } from "@/lib/onboarding/actions";
import { completeOnboarding } from "@/lib/onboarding/actions";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Group = {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  book_count: number | null;
};

type Stats = {
  patients: number;
  documents: number;
  activeGroups: number;
};

type Track = "lite" | "pro";

const INITIAL_STATE: OnboardingState = {};

const COUNTRY_OPTIONS = [
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "México" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "PE", label: "Perú" },
  { value: "ES", label: "España" },
  { value: "OTRO", label: "Otro" },
];

const SPECIALTY_OPTIONS = [
  "Psicología clínica",
  "Psiquiatría",
  "Psicoterapia integrativa",
  "Psicología infanto-juvenil",
  "Neuropsicología clínica",
  "Terapia de pareja y familia",
];

const TRACK_COPY: Record<
  Track,
  {
    badge: string;
    title: string;
    subtitle: string;
    estimate: string;
    limit: number;
    nextActions: string[];
    helper: string;
  }
> = {
  lite: {
    badge: "Onboarding Lite",
    title: "Arranque veloz para consulta privada",
    subtitle:
      "Configura lo mínimo útil para registrar tu primer paciente, escribir notas libres y dejar tu biblioteca base lista en menos de 10 minutos.",
    estimate: "7-10 min",
    limit: 3,
    nextActions: [
      "Crear tu primer paciente",
      "Entrar por texto libre a la primera sesión",
      "Analizar la nota con la biblioteca base activa",
    ],
    helper: "Elige hasta 3 enfoques para mantener el análisis clínico preciso y sin ruido inicial.",
  },
  pro: {
    badge: "Onboarding Pro",
    title: "Flujo guiado para práctica clínica avanzada",
    subtitle:
      "Deja listo tu perfil profesional, los enfoques activos y el recorrido para audio, derivaciones e informes sin tener que configurarlo todo hoy mismo.",
    estimate: "18-25 min",
    limit: 8,
    nextActions: [
      "Registrar paciente y consentimiento",
      "Abrir una sesión con audio o carga de archivo",
      "Entrar luego a biblioteca personal y recordatorios",
    ],
    helper: "Puedes activar más enfoques desde el inicio para cubrir práctica clínica, trauma, evaluación y derivación.",
  },
};

const DEFAULT_GROUP_SLUGS: Record<Track, string[]> = {
  lite: ["cbt", "humanista", "sistemica"],
  pro: ["cbt", "trauma", "neuropsico"],
};

function formatCount(value: number, label: string) {
  return `${value} ${label}${value === 1 ? "" : "s"}`;
}

export function OnboardingFlow({
  name,
  defaultTrack,
  initialCountry,
  initialSpecialty,
  groups,
  activeGroupIds,
  stats,
}: {
  name: string;
  defaultTrack: Track;
  initialCountry: string;
  initialSpecialty: string;
  groups: Group[];
  activeGroupIds: string[];
  stats: Stats;
}) {
  const [state, formAction, pending] = useActionState(completeOnboarding, INITIAL_STATE);
  const [track, setTrack] = useState<Track>(defaultTrack);
  const [country, setCountry] = useState(initialCountry);
  const [specialty, setSpecialty] = useState(initialSpecialty);

  const initialSelection = useMemo(() => {
    if (activeGroupIds.length > 0) {
      return activeGroupIds;
    }

    const preferredSlugs = DEFAULT_GROUP_SLUGS[defaultTrack];
    return groups
      .filter((group) => preferredSlugs.includes(group.slug))
      .map((group) => group.id);
  }, [activeGroupIds, defaultTrack, groups]);

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(initialSelection);

  const trackConfig = TRACK_COPY[track];

  const orderedGroups = useMemo(() => {
    const selected = new Set(selectedGroupIds);
    return [...groups].sort((a, b) => {
      const selectedDelta = Number(selected.has(b.id)) - Number(selected.has(a.id));
      if (selectedDelta !== 0) return selectedDelta;
      return a.name.localeCompare(b.name, "es");
    });
  }, [groups, selectedGroupIds]);

  function handleTrackChange(nextTrack: Track) {
    setTrack(nextTrack);

    setSelectedGroupIds((current) => {
      const selected = current.filter(Boolean);
      if (selected.length <= TRACK_COPY[nextTrack].limit) {
        return selected;
      }
      return selected.slice(0, TRACK_COPY[nextTrack].limit);
    });
  }

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((current) => {
      if (current.includes(groupId)) {
        return current.filter((id) => id !== groupId);
      }

      if (current.length >= trackConfig.limit) {
        return current;
      }

      return [...current, groupId];
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-2 lg:px-6 lg:py-8">
      <section className="overflow-hidden rounded-3xl border border-psy-border bg-white shadow-2xl">
        <div className="border-b border-psy-border bg-psy-cream px-5 py-6 md:px-7 md:py-10">
          <div className="mb-6 flex justify-start">
            <Breadcrumbs />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-psy-muted">
            Bienvenida clínica
          </p>
          <h1 className="mt-3 max-w-2xl font-sora text-3xl font-bold tracking-tight text-psy-ink md:text-5xl">
            {name}, deja tu espacio listo antes de entrar.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-psy-ink/75">
            Este paso inicial configura tu contexto profesional y define con qué
            enfoques debe razonar <span className="font-bold text-psy-blue italic">MENTEZER</span> desde hoy. No estamos vendiendo un
            plan: estamos reduciendo <span className="font-medium text-psy-ink">fricción clínica</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-psy-ink">
              {trackConfig.badge}
            </div>
            <div className="rounded-full bg-psy-ink px-4 py-2 text-xs font-medium text-psy-paper">
              Tiempo estimado: {trackConfig.estimate}
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-8 px-5 py-6 md:px-7 md:py-8">
          <input type="hidden" name="track" value={track} />
          <input
            type="hidden"
            name="selected_group_ids"
            value={JSON.stringify(selectedGroupIds)}
          />

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-psy-muted">
              Paso 1
            </p>
            <div>
              <h2 className="font-sora text-2xl font-bold text-psy-ink">
                Elige tu recorrido inicial
              </h2>
              <p className="mt-2 text-sm leading-7 text-psy-ink/70">
                {trackConfig.subtitle}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(["lite", "pro"] as const).map((option) => {
                const optionConfig = TRACK_COPY[option];
                const selected = track === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleTrackChange(option)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      selected
                        ? "border-psy-ink/15 bg-psy-blue-light/90 shadow-xl"
                        : "border-psy-ink/10 bg-white/70 hover:-translate-y-0.5 hover:border-psy-ink/15"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-sora text-xl font-bold text-psy-ink">
                        {option === "lite" ? "Lite" : "Pro"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest ${
                          selected
                            ? "bg-psy-ink text-psy-paper"
                            : "bg-psy-ink/5 text-psy-muted"
                        }`}
                      >
                        {optionConfig.estimate}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-psy-ink/70">
                      {optionConfig.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-psy-muted">
                  Paso 2
                </p>
                <h2 className="mt-2 font-sora text-2xl font-bold text-psy-ink">
                  Contexto profesional
                </h2>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="mb-1.5 block text-sm font-medium text-psy-ink"
                >
                  País principal de práctica
                </label>
                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-11 w-full rounded-xl border border-psy-border bg-psy-cream px-4 text-sm text-psy-ink focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/20"
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {state.fieldErrors?.country ? (
                  <p className="mt-1 text-xs text-psy-red">
                    {state.fieldErrors.country}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="mb-1.5 block text-sm font-medium text-psy-ink"
                >
                  Enfoque o especialidad principal
                </label>
                <input
                  id="specialty"
                  name="specialty"
                  list="onboarding-specialties"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  placeholder="Ej: Psicología clínica"
                  className="h-11 w-full rounded-xl border border-psy-border bg-psy-cream px-4 text-sm text-psy-ink placeholder:text-psy-muted focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/20"
                />
                <datalist id="onboarding-specialties">
                  {SPECIALTY_OPTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {state.fieldErrors?.specialty ? (
                  <p className="mt-1 text-xs text-psy-red">
                    {state.fieldErrors.specialty}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-psy-ink/5 p-4">
                <p className="text-xs uppercase tracking-widest text-psy-muted">
                  Qué pasará al entrar
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-psy-ink/75">
                  {trackConfig.nextActions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-psy-blue" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-psy-muted">
                  Paso 3
                </p>
                <h2 className="mt-2 font-sora text-2xl font-bold text-psy-ink">
                  Activa tus enfoques clínicos
                </h2>
                <p className="mt-2 text-sm leading-7 text-psy-ink/70">
                  {trackConfig.helper}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-psy-ink/5 px-4 py-3 text-sm">
                <span className="text-psy-muted">
                  Seleccionados
                </span>
                <span className="font-mono text-psy-ink">
                  {selectedGroupIds.length}/{trackConfig.limit}
                </span>
              </div>

              <div className="space-y-2">
                {orderedGroups.map((group) => {
                  const selected = selectedGroupIds.includes(group.id);
                  const disabled = !selected && selectedGroupIds.length >= trackConfig.limit;

                  return (
                    <div key={group.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        selected 
                          ? "border-psy-blue-light bg-psy-blue/5 shadow-sm" 
                          : "border-psy-border bg-white hover:border-psy-blue/30"
                      } ${disabled ? "opacity-40 grayscale" : ""}`}
                    >
                      <input 
                        type="checkbox"
                        id={`group-${group.id}`}
                        checked={selected}
                        disabled={disabled}
                        onChange={() => toggleGroup(group.id)}
                        className="h-5 w-5 rounded-md border-psy-border bg-white text-psy-blue transition-all focus:ring-psy-blue/20"
                      />
                      <label 
                        htmlFor={`group-${group.id}`}
                        className="flex flex-1 items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-psy-ink">{group.name}</p>
                          <p className="truncate text-[11px] text-psy-muted">{group.description}</p>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-psy-muted uppercase">
                          {group.book_count ?? 0} Libros
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>

              {state.fieldErrors?.groups ? (
                <p className="text-sm text-psy-red">
                  {state.fieldErrors.groups}
                </p>
              ) : null}
            </div>
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-psy-red/20 bg-psy-red-light px-4 py-3 text-sm text-psy-red">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-psy-ink/10 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl text-sm leading-7 text-psy-ink/65">
              Guardaremos esta configuración inicial y entrarás directo al
              dashboard con tus enfoques listos. Podrás ajustarlos después en
              Biblioteca y Configuración.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-psy-blue px-5 text-sm font-medium text-white shadow-xl transition hover:bg-psy-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "Guardando tu arranque clínico..."
                : track === "lite"
                  ? "Activar flujo Lite y entrar"
                  : "Activar flujo Pro y entrar"}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-psy-border bg-psy-ink p-7 text-psy-paper shadow-2xl">
          <p className="text-xs uppercase tracking-widest text-psy-paper/50">
            Estado actual
          </p>
          <h2 className="mt-3 font-sora text-3xl font-bold">
            Tu espacio todavía está limpio.
          </h2>
          <p className="mt-3 text-sm leading-7 text-psy-paper/70">
            Antes de abrir el dashboard principal, dejamos listas las decisiones
            que luego afectan análisis, sugerencias y biblioteca clínica.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              formatCount(stats.patients, "paciente"),
              formatCount(stats.documents, "documento propio"),
              formatCount(stats.activeGroups, "enfoque activo"),
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-psy-paper/10 px-4 py-3 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-psy-ink/10 bg-psy-blue-light/70 p-6 shadow-xl">
          <p className="text-xs uppercase tracking-widest text-psy-muted">
            Firma del onboarding
          </p>
          <h2 className="mt-3 font-sora text-2xl font-bold text-psy-ink">
            Preparación clínica, no configuración técnica.
          </h2>
          <div className="mt-5 space-y-3">
            {[
              "Lite prioriza velocidad y foco: menos decisiones, menos ruido, primera sesión más rápido.",
              "Pro abre un recorrido más amplio, pero sin empujarte a configurar audio, WhatsApp o PDFs hoy mismo.",
              "Los enfoques activos se guardan ya en Supabase y quedan listos para Biblioteca clínica.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white/70 px-4 py-4 text-sm leading-7 text-psy-ink/70"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
