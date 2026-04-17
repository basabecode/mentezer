import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: total },
    { count: activos },
    { count: trial },
    { data: recientes },
  ] = await Promise.all([
    supabase.from("psychologists").select("*", { count: "exact", head: true }).neq("is_platform_admin", true),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("account_status", "active").neq("is_platform_admin", true),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("plan", "trial").neq("is_platform_admin", true),
    supabase.from("psychologists")
      .select("id, name, email, plan, account_status, created_at, trial_ends_at")
      .neq("is_platform_admin", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const suspendidos = (total ?? 0) - (activos ?? 0);
  const conversion = total ? Math.round(((total - (trial ?? 0)) / total) * 100) : 0;

  return (
    <div className="px-6 py-7 max-w-5xl space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#6B6760] uppercase tracking-widest mb-1">
            Plataforma
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1B18] tracking-tight">
            Panel de control
          </h1>
        </div>
        <Link href="/admin/clients/new"
          className="flex items-center gap-2 bg-[#1C1B18] text-[#FAF8F4] text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#1C1B18]/85 transition-all">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo cliente
        </Link>
      </div>

      {/* ── Bento de métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total clientes",  value: total      ?? 0, sub: "registrados",           color: "#3B6FA0", bg: "#EAF1F8" },
          { label: "Cuentas activas", value: activos    ?? 0, sub: "en uso hoy",             color: "#4A7C59", bg: "#EBF4EE" },
          { label: "En trial",        value: trial      ?? 0, sub: "período de prueba",      color: "#B07D3A", bg: "#FBF3E4" },
          { label: "Conversión",      value: `${conversion}%`, sub: "trial → pago",         color: "#3B6FA0", bg: "#EAF1F8" },
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

        {/* Tabla de clientes recientes — 2 cols */}
        <div className="md:col-span-2 bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg font-semibold text-[#1C1B18]">Clientes recientes</h2>
            <Link href="/admin/clients" className="text-xs text-[#3B6FA0] hover:underline font-medium">
              Ver todos
            </Link>
          </div>

          <div className="space-y-1">
            {(recientes ?? []).map((c) => {
              const trialLeft = c.trial_ends_at
                ? Math.max(0, Math.ceil((new Date(c.trial_ends_at).getTime() - Date.now()) / 86400000))
                : null;
              const planColors: Record<string, { bg: string; text: string }> = {
                trial:        { bg: "#FBF3E4", text: "#B07D3A" },
                starter:      { bg: "#EAF1F8", text: "#3B6FA0" },
                professional: { bg: "#EBF4EE", text: "#4A7C59" },
                clinic:       { bg: "#1C1B18", text: "#FAF8F4" },
              };
              const pc = planColors[c.plan] ?? planColors.trial;

              return (
                <Link key={c.id} href={`/admin/clients/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F2ED] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EAF1F8] flex items-center justify-center flex-shrink-0">
                      <span className="font-serif text-sm font-semibold text-[#3B6FA0]">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C1B18]">{c.name}</p>
                      <p className="text-xs text-[#6B6760]">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trialLeft !== null && trialLeft <= 3 && trialLeft > 0 && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#FDECEA] text-[#C0392B] rounded-full font-medium">
                        <span className="w-1 h-1 rounded-full bg-[#C0392B] animate-pulse" />
                        {trialLeft}d
                      </span>
                    )}
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-medium capitalize"
                      style={{ background: pc.bg, color: pc.text }}>
                      {c.plan}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      c.account_status === "active"    ? "bg-[#EBF4EE] text-[#4A7C59]" :
                      c.account_status === "pending"   ? "bg-[#FBF3E4] text-[#B07D3A]" :
                                                         "bg-[#FDECEA] text-[#C0392B]"
                    }`}>
                      {c.account_status === "active" ? "Activo" : c.account_status === "pending" ? "Pendiente" : "Suspendido"}
                    </span>
                    <svg className="text-[#6B6760] opacity-0 group-hover:opacity-100 transition-opacity" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Estado de la plataforma — 1 col */}
        <div className="bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-serif text-lg font-semibold text-[#1C1B18]">Estado</h2>

          {[
            { label: "API Claude",      ok: true },
            { label: "API OpenAI",      ok: true },
            { label: "Supabase DB",     ok: true },
            { label: "Storage",         ok: true },
            { label: "Webhooks activos",ok: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <p className="text-sm text-[#1C1B18]">{s.label}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-[#4A7C59]" : "bg-[#C0392B] animate-pulse"}`} />
                <span className={`text-xs font-medium ${s.ok ? "text-[#4A7C59]" : "text-[#C0392B]"}`}>
                  {s.ok ? "Operativo" : "Error"}
                </span>
              </div>
            </div>
          ))}

          <div className="border-t border-[rgba(28,27,24,0.07)] pt-4 mt-auto">
            <p className="text-xs text-[#6B6760] mb-1">Clientes suspendidos</p>
            <p className="font-mono text-2xl font-semibold text-[#1C1B18]">{suspendidos}</p>
            {suspendidos > 0 && (
              <Link href="/admin/clients?status=suspended"
                className="text-xs text-[#C0392B] hover:underline mt-1 inline-block">
                Revisar cuentas
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Accesos rápidos de admin ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: "/admin/clients", label: "Gestionar clientes", sub: "Ver todas las cuentas",     color: "#3B6FA0", bg: "#EAF1F8" },
          { href: "/admin/clients/new", label: "Onboarding manual", sub: "Crear cuenta de psicólogo", color: "#4A7C59", bg: "#EBF4EE" },
          { href: "/settings", label: "Configuración",   sub: "Integraciones y ajustes",  color: "#B07D3A", bg: "#FBF3E4" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-4 bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-5 hover:shadow-[0_8px_32px_rgba(28,27,24,0.07)] transition-all">
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: a.bg }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1C1B18]">{a.label}</p>
              <p className="text-xs text-[#6B6760]">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
