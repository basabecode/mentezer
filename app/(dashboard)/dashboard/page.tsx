import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: totalPatients },
    { count: sessionsMonth },
    { count: reportsTotal },
    { data: riskReports },
    { data: recentPatients },
    { data: pendingSessions },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id).eq("status", "active"),
    supabase.from("sessions").select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("ai_reports").select("*", { count: "exact", head: true })
      .in("session_id",
        (await supabase.from("sessions").select("id").eq("psychologist_id", user!.id))
          .data?.map(s => s.id) ?? []),
    supabase.from("ai_reports").select("session_id, risk_signals")
      .in("session_id",
        (await supabase.from("sessions").select("id").eq("psychologist_id", user!.id))
          .data?.map(s => s.id) ?? [])
      .limit(20),
    supabase.from("patients").select("id, name, status, created_at")
      .eq("psychologist_id", user!.id).eq("status", "active")
      .order("created_at", { ascending: false }).limit(5),
    supabase.from("sessions").select("id, scheduled_at, status")
      .eq("psychologist_id", user!.id).eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at").limit(3),
  ]);

  const highRisk = (riskReports ?? []).filter(r => {
    const s = r.risk_signals as Array<{ severity: string }>;
    return s?.some(x => x.severity === "high");
  }).length;

  const psychName = user?.email?.split("@")[0] ?? "Doctor";

  return (
    <div className="px-6 py-7 max-w-5xl space-y-6">

      {/* ── Saludo ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#6B6760] uppercase tracking-widest mb-1">
            {greeting()}
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1B18] tracking-tight">
            {psychName}
          </h1>
        </div>
        {highRisk > 0 && (
          <div className="flex items-center gap-2 bg-[#FDECEA] border border-[#C0392B]/20 text-[#C0392B] text-xs font-medium px-3.5 py-2 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B] animate-pulse flex-shrink-0" />
            {highRisk} señal{highRisk > 1 ? "es" : ""} de riesgo alto
          </div>
        )}
      </div>

      {/* ── Bento de stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pacientes activos",   value: totalPatients  ?? 0, sub: "en seguimiento",    color: "#3B6FA0", bg: "#EAF1F8" },
          { label: "Sesiones este mes",   value: sessionsMonth  ?? 0, sub: "registradas",        color: "#4A7C59", bg: "#EBF4EE" },
          { label: "Reportes generados",  value: reportsTotal   ?? 0, sub: "por IA",             color: "#3B6FA0", bg: "#EAF1F8" },
          { label: "Alertas de riesgo",   value: highRisk,            sub: highRisk > 0 ? "requieren atención" : "sin alertas",
            color: highRisk > 0 ? "#C0392B" : "#4A7C59",
            bg:    highRisk > 0 ? "#FDECEA" : "#EBF4EE" },
        ].map((s) => (
          <div key={s.label}
            className="bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: s.bg }}>
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            </div>
            <p className="font-mono text-3xl font-semibold text-[#1C1B18] mb-1">{s.value}</p>
            <p className="text-xs font-medium text-[#1C1B18]">{s.label}</p>
            <p className="text-xs text-[#6B6760]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Bento principal ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Acciones rápidas — 2 cols */}
        <div className="md:col-span-2 bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-[#1C1B18] mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/sessions/new", label: "Nueva sesión", sub: "Grabar y analizar", color: "#3B6FA0", bg: "#EAF1F8",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
              { href: "/patients/new", label: "Nuevo paciente", sub: "Registrar ficha", color: "#4A7C59", bg: "#EBF4EE",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { href: "/knowledge/upload", label: "Subir libro", sub: "Ampliar biblioteca", color: "#3B6FA0", bg: "#EAF1F8",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
              { href: "/reports", label: "Derivar paciente", sub: "Generar informe", color: "#B07D3A", bg: "#FBF3E4",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-4 bg-[#F5F2ED] border border-[rgba(28,27,24,0.07)] rounded-xl hover:border-[rgba(28,27,24,0.14)] hover:shadow-[0_4px_16px_rgba(28,27,24,0.06)] transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: a.bg, color: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1B18]">{a.label}</p>
                  <p className="text-xs text-[#6B6760]">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Próximas citas — 1 col */}
        <div className="bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-6 flex flex-col">
          <h2 className="font-serif text-lg font-semibold text-[#1C1B18] mb-4">Próximas citas</h2>
          {(pendingSessions ?? []).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF1F8] flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B6FA0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p className="text-xs text-[#6B6760]">Sin citas programadas</p>
              <Link href="/schedule" className="mt-3 text-xs text-[#3B6FA0] hover:underline">Configurar agenda</Link>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {pendingSessions?.map((s) => {
                const d = new Date(s.scheduled_at);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                    <div className="text-center w-10 flex-shrink-0">
                      <p className="font-mono text-lg font-semibold text-[#1C1B18] leading-none">{d.getDate()}</p>
                      <p className="text-[10px] text-[#6B6760] uppercase">{d.toLocaleString("es", { month: "short" })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1C1B18]">{d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-[10px] text-[#6B6760]">Sesión programada</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Pacientes recientes ───────────────────────────────────────────── */}
      <div className="bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-semibold text-[#1C1B18]">Pacientes recientes</h2>
          <Link href="/patients" className="text-xs text-[#3B6FA0] hover:underline font-medium">Ver todos</Link>
        </div>
        {(recentPatients ?? []).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#6B6760] mb-3">Aún no tienes pacientes registrados</p>
            <Link href="/patients/new"
              className="inline-flex items-center gap-2 text-sm font-medium bg-[#3B6FA0] text-white px-4 py-2 rounded-xl hover:bg-[#3B6FA0]/90 transition-colors">
              Registrar primer paciente
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(28,27,24,0.06)]">
            {recentPatients?.map((p) => (
              <Link key={p.id} href={`/patients/${p.id}`}
                className="flex items-center justify-between py-3.5 hover:bg-[#F5F2ED] -mx-2 px-2 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EAF1F8] flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-sm font-semibold text-[#3B6FA0]">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#1C1B18]">{p.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#EBF4EE] text-[#4A7C59] font-medium">
                    Activo
                  </span>
                  <svg className="text-[#6B6760] opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
