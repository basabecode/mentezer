import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Brain, Plus } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

const quickActions = [
  {
    href: "/sessions/new",
    label: "Nueva sesión",
    sub: "Grabar, subir y analizar",
    accent: "var(--psy-blue)",
    bg: "var(--psy-blue-light)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    href: "/patients/new",
    label: "Nuevo paciente",
    sub: "Registrar ficha clínica",
    accent: "var(--psy-green)",
    bg: "var(--psy-green-light)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/knowledge/upload",
    label: "Subir libro",
    sub: "Ampliar biblioteca clínica",
    accent: "var(--psy-blue)",
    bg: "var(--psy-blue-light)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Derivar paciente",
    sub: "Preparar informe clínico",
    accent: "var(--psy-amber)",
    bg: "var(--psy-amber-light)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
      </svg>
    ),
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const sessionIds =
    (await supabase.from("sessions").select("id").eq("psychologist_id", user!.id))
      .data?.map((s) => s.id) ?? [];

  const [
    { count: totalPatients },
    { count: sessionsMonth },
    { count: reportsTotal },
    { data: riskReports },
    { data: recentPatients },
    { data: pendingSessions },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }).eq("psychologist_id", user!.id).eq("status", "active"),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("psychologist_id", user!.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("ai_reports").select("*", { count: "exact", head: true }).in("session_id", sessionIds),
    supabase.from("ai_reports").select("session_id, risk_signals").in("session_id", sessionIds).limit(20),
    supabase.from("patients").select("id, name, status, created_at").eq("psychologist_id", user!.id).eq("status", "active").order("created_at", { ascending: false }).limit(5),
    supabase.from("sessions").select("id, scheduled_at, status").eq("psychologist_id", user!.id).eq("status", "scheduled").gte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(3),
  ]);

  const highRisk = (riskReports ?? []).filter((r) => {
    const signals = r.risk_signals as Array<{ severity: string }>;
    return signals?.some((x) => x.severity === "high");
  }).length;

  const psychName = user?.email?.split("@")[0] ?? "Doctor";
  const firstPending = pendingSessions?.[0];

  return (
    <div className="flex flex-col">
      {/* ── Hero banner (Totalmente Integrado) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-psy-paper/10 to-psy-blue/5 border-b border-psy-border">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-psy-blue/10 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-[1400px] px-8 py-12 md:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-psy-blue animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-psy-blue font-bold">
                {greeting()}
              </p>
            </div>
            <h1 className="font-sora text-6xl md:text-8xl font-bold tracking-tighter text-psy-ink leading-[0.85]">
              {psychName.split('.')[0]}
            </h1>
            <p className="mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-psy-ink/60 font-medium italic">
              "Transformando la práctica clínica con <span className="text-psy-ink font-bold not-italic">precisión e inteligencia</span>."
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/sessions/new" className="lift-button inline-flex h-14 items-center gap-3 rounded-2xl bg-psy-blue px-8 text-sm font-bold text-white shadow-2xl shadow-psy-blue/30 transition-all">
                <Plus size={20} strokeWidth={2.5} />
                Nueva sesión
              </Link>
              <Link href="/schedule" className="lift-button inline-flex h-14 items-center gap-3 rounded-2xl border border-psy-border bg-psy-paper px-8 text-sm font-bold text-psy-ink shadow-sm transition-all hover:bg-psy-cream">
                Mi Agenda
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[460px] flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-psy-paper border border-psy-border rounded-3xl p-8 shadow-sm group hover:border-psy-blue/50 transition-all duration-300">
                <p className="text-[10px] uppercase tracking-widest font-bold text-psy-blue mb-2">PACIENTES</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-sora text-6xl font-bold text-psy-ink">{totalPatients ?? 0}</p>
                </div>
              </div>
              <div className="bg-white border border-psy-border rounded-[2.5rem] p-8 shadow-sm group hover:border-psy-green/50 transition-all duration-300">
                <p className="text-[10px] uppercase tracking-widest font-bold text-psy-green mb-2">SESIONES</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-sora text-6xl font-bold text-psy-ink">{sessionsMonth ?? 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-psy-ink rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Brain size={80} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">SEGURIDAD CLÍNICA</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium leading-relaxed text-white/80">
                  {highRisk > 0
                    ? `${highRisk} alertas críticas pendientes.`
                    : "No hay alertas de riesgo alto."}
                </p>
                <div className="rounded-2xl bg-white/10 px-4 py-2 text-center border border-white/5 backdrop-blur-sm">
                  <p className="font-sora text-2xl font-bold">{reportsTotal ?? 0}</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">VECTORES</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1400px] p-8 md:p-12 lg:p-16 flex flex-col gap-12">

      {/* ── Acciones rápidas ── */}
      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="scroll-reveal group relative overflow-hidden rounded-3xl border border-psy-border bg-white p-4 shadow-xl transition-all duration-200 hover:-translate-y-1.5 hover:border-psy-blue/30 hover:shadow-2xl md:p-5"
          >
            {/* Borde top color-coded */}
            <span
              className="absolute left-0 right-0 top-0 h-1 rounded-t-3xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{ background: action.accent }}
            />
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-240 group-hover:scale-110 md:h-11 md:w-11 md:rounded-2xl"
              style={{ background: action.bg, color: action.accent }}
            >
              {action.icon}
            </div>
            <h2 className="mt-3 font-sora text-base font-bold tracking-tight text-psy-ink md:mt-4 md:text-xl">
              {action.label}
            </h2>
            <p className="mt-1 text-xs leading-5 text-psy-ink/65 md:mt-2 md:text-sm md:leading-7">
              {action.sub}
            </p>
          </Link>
        ))}
      </section>

      {/* ── Agenda + Pacientes ── */}
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="scroll-reveal rounded-3xl border border-psy-border bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-psy-muted">Agenda inmediata</p>
              <h2 className="mt-2 font-sora text-2xl font-bold tracking-tight text-psy-ink md:text-3xl">
                Lo próximo en consulta
              </h2>
            </div>
            <Link href="/schedule" className="text-sm font-medium text-psy-blue transition hover:underline">
              Ver agenda
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {(pendingSessions ?? []).length === 0 ? (
              <div className="rounded-3xl bg-white/60 p-5 text-sm text-psy-muted">
                No tienes citas programadas por ahora. Es un buen momento para
                ordenar pacientes, biblioteca o informes.
              </div>
            ) : (
              pendingSessions?.map((session, index) => {
                const date = new Date(session.scheduled_at);
                return (
                  <div key={session.id} className={`rounded-3xl border border-psy-ink/10 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${index === 0 ? "bg-psy-blue-light" : "bg-white/60"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-psy-ink">
                          {date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <p className="mt-1 text-sm text-psy-muted">
                          {date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · sesión programada
                        </p>
                      </div>
                      {index === 0 ? (
                        <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-medium uppercase tracking-widest text-psy-blue">
                          Sigue esta
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {firstPending ? (
            <div className="mt-4 rounded-3xl bg-psy-ink p-5 text-psy-paper">
              <p className="text-xs uppercase tracking-widest text-psy-paper/55">Siguiente decisión</p>
              <p className="mt-3 text-sm leading-7 text-psy-paper/80">
                Si esta sesión termina hoy, el flujo natural es grabar, revisar
                transcripción y dejar listo el análisis antes de que se acumule.
              </p>
              <Link href="/sessions/new" className="lift-button mt-4 inline-flex items-center gap-2 rounded-xl bg-psy-paper px-4 py-2.5 text-sm font-medium text-psy-ink">
                Abrir flujo de sesión
              </Link>
            </div>
          ) : null}
        </div>

        <div className="scroll-reveal rounded-3xl border border-psy-border bg-white p-6 shadow-xl" data-reveal-delay="80">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-psy-muted">Pacientes recientes</p>
              <h2 className="mt-2 font-sora text-2xl font-bold tracking-tight text-psy-ink md:text-3xl">
                Seguimiento activo
              </h2>
            </div>
            <Link href="/patients" className="text-sm font-medium text-psy-blue transition hover:underline">
              Ver todos
            </Link>
          </div>

          {(recentPatients ?? []).length === 0 ? (
            <div className="mt-5 rounded-3xl bg-white/60 p-6 text-center">
              <p className="text-sm text-psy-muted">Aún no tienes pacientes registrados.</p>
              <Link href="/patients/new" className="lift-button mt-4 inline-flex items-center gap-2 rounded-xl bg-psy-blue px-4 py-2.5 text-sm font-medium text-white">
                Registrar primer paciente
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {recentPatients?.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="hover-panel flex items-center justify-between gap-3 rounded-2xl border border-psy-ink/10 bg-white/60 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-blue-light text-sm font-semibold text-psy-blue">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-psy-ink">{patient.name}</p>
                      <p className="text-xs text-psy-muted">
                        Activo · creado {new Date(patient.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-psy-green-light px-2.5 py-1 text-xs font-medium uppercase tracking-widest text-psy-green">
                    Ver ficha
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
