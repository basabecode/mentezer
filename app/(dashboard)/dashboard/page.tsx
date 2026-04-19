import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
    color: "#3B6FA0",
    bg: "#EAF1F8",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
    color: "#4A7C59",
    bg: "#EBF4EE",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/knowledge/upload",
    label: "Subir libro",
    sub: "Ampliar biblioteca clínica",
    color: "#3B6FA0",
    bg: "#EAF1F8",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Derivar paciente",
    sub: "Preparar informe clínico",
    color: "#B07D3A",
    bg: "#FBF3E4",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
      </svg>
    ),
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionIds =
    (
      await supabase.from("sessions").select("id").eq("psychologist_id", user!.id)
    ).data?.map((s) => s.id) ?? [];

  const [
    { count: totalPatients },
    { count: sessionsMonth },
    { count: reportsTotal },
    { data: riskReports },
    { data: recentPatients },
    { data: pendingSessions },
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id)
      .eq("status", "active"),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id)
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      ),
    supabase
      .from("ai_reports")
      .select("*", { count: "exact", head: true })
      .in("session_id", sessionIds),
    supabase
      .from("ai_reports")
      .select("session_id, risk_signals")
      .in("session_id", sessionIds)
      .limit(20),
    supabase
      .from("patients")
      .select("id, name, status, created_at")
      .eq("psychologist_id", user!.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("sessions")
      .select("id, scheduled_at, status")
      .eq("psychologist_id", user!.id)
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at")
      .limit(3),
  ]);

  const highRisk = (riskReports ?? []).filter((r) => {
    const signals = r.risk_signals as Array<{ severity: string }>;
    return signals?.some((x) => x.severity === "high");
  }).length;

  const psychName = user?.email?.split("@")[0] ?? "Doctor";
  const firstPending = pendingSessions?.[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
      <section className="paper-texture reveal-rise overflow-hidden rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.88)] p-6 shadow-[0_20px_60px_rgba(13,34,50,0.08)] md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#6B6760]">
              {greeting()}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#0D2232] md:text-5xl">
              {psychName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[rgba(13,34,50,0.74)]">
              Tu portal clínico está listo para capturar sesiones, ordenar el
              seguimiento y responder más rápido sin dejar que el cierre del día
              se te vaya de las manos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/sessions/new"
                className="lift-button inline-flex items-center gap-2 rounded-[1.2rem] bg-[#3B6FA0] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(59,111,160,0.28)]"
              >
                Empezar nueva sesión
              </Link>
              <Link
                href="/schedule"
                className="lift-button inline-flex items-center gap-2 rounded-[1.2rem] border border-[rgba(13,34,50,0.10)] bg-white/55 px-5 py-3 text-sm font-medium text-[#0D2232]"
              >
                Ver agenda de hoy
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-[rgba(13,34,50,0.08)] bg-white/62 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B6760]">
                En foco hoy
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[#EAF1F8] p-4">
                  <p className="text-xs text-[#3B6FA0]">Pacientes activos</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#0D2232]">
                    {totalPatients ?? 0}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[#EBF4EE] p-4">
                  <p className="text-xs text-[#4A7C59]">Sesiones del mes</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#0D2232]">
                    {sessionsMonth ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] bg-[#0D2232] p-5 text-[#DFF3F8] shadow-[0_18px_44px_rgba(13,34,50,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(223,243,248,0.55)]">
                    Riesgo y pendientes
                  </p>
                  <p className="mt-2 text-sm text-[rgba(223,243,248,0.76)]">
                    {highRisk > 0
                      ? `${highRisk} alerta${highRisk > 1 ? "s" : ""} de riesgo alto requieren atención.`
                      : "No hay alertas de riesgo alto en los reportes recientes."}
                  </p>
                </div>
                <div className="rounded-[1.1rem] bg-[rgba(223,243,248,0.08)] px-4 py-3 text-center">
                  <p className="font-mono text-2xl font-semibold">
                    {reportsTotal ?? 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(223,243,248,0.55)]">
                    reportes IA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="hover-panel rounded-[1.7rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-5 shadow-[0_14px_34px_rgba(13,34,50,0.05)]"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: action.bg, color: action.color }}
            >
              {action.icon}
            </div>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-[#0D2232]">
              {action.label}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[rgba(13,34,50,0.74)]">
              {action.sub}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-6 shadow-[0_16px_42px_rgba(13,34,50,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B6760]">
                Agenda inmediata
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#0D2232]">
                Lo próximo en consulta
              </h2>
            </div>
            <Link href="/schedule" className="text-sm font-medium text-[#3B6FA0]">
              Ver agenda
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {(pendingSessions ?? []).length === 0 ? (
              <div className="rounded-[1.5rem] bg-white/62 p-5 text-sm text-[#6B6760]">
                No tienes citas programadas por ahora. Es un buen momento para
                ordenar pacientes, biblioteca o informes.
              </div>
            ) : (
              pendingSessions?.map((session, index) => {
                const date = new Date(session.scheduled_at);
                return (
                  <div
                    key={session.id}
                    className={`rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] p-5 ${
                      index === 0 ? "bg-[#EAF1F8]" : "bg-white/62"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#0D2232]">
                          {date.toLocaleDateString("es-CO", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="mt-1 text-sm text-[#6B6760]">
                          {date.toLocaleTimeString("es-CO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · sesión programada
                        </p>
                      </div>
                      {index === 0 ? (
                        <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#3B6FA0]">
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
            <div className="mt-4 rounded-[1.5rem] bg-[#0D2232] p-5 text-[#DFF3F8]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(223,243,248,0.55)]">
                Siguiente decisión
              </p>
              <p className="mt-3 text-sm leading-7 text-[rgba(223,243,248,0.78)]">
                Si esta sesión termina hoy, el flujo natural es grabar, revisar
                transcripción y dejar listo el análisis antes de que se acumule.
              </p>
              <Link
                href="/sessions/new"
                className="mt-4 inline-flex items-center gap-2 rounded-[1rem] bg-[#DFF3F8] px-4 py-2.5 text-sm font-medium text-[#0D2232]"
              >
                Abrir flujo de sesión
              </Link>
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-6 shadow-[0_16px_42px_rgba(13,34,50,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B6760]">
                Pacientes recientes
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#0D2232]">
                Seguimiento activo
              </h2>
            </div>
            <Link href="/patients" className="text-sm font-medium text-[#3B6FA0]">
              Ver todos
            </Link>
          </div>

          {(recentPatients ?? []).length === 0 ? (
            <div className="mt-5 rounded-[1.5rem] bg-white/62 p-6 text-center">
              <p className="text-sm text-[#6B6760]">
                Aún no tienes pacientes registrados.
              </p>
              <Link
                href="/patients/new"
                className="lift-button mt-4 inline-flex items-center gap-2 rounded-[1rem] bg-[#3B6FA0] px-4 py-2.5 text-sm font-medium text-white"
              >
                Registrar primer paciente
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {recentPatients?.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="hover-panel flex items-center justify-between gap-3 rounded-[1.4rem] border border-[rgba(13,34,50,0.08)] bg-white/62 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF1F8] text-sm font-semibold text-[#3B6FA0]">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0D2232]">
                        {patient.name}
                      </p>
                      <p className="text-xs text-[#6B6760]">
                        Activo · creado{" "}
                        {new Date(patient.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#EBF4EE] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#4A7C59]">
                    Ver ficha
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
