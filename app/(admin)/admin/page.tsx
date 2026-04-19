import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HealthStatus } from "@/components/admin/HealthStatus";

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
    supabase.from("psychologists").select("id, name, email, plan, account_status, created_at, trial_ends_at").neq("is_platform_admin", true).order("created_at", { ascending: false }).limit(8),
  ]);

  const suspendidos = (total ?? 0) - (activos ?? 0);
  const conversion = total ? Math.round((((total ?? 0) - (trial ?? 0)) / total) * 100) : 0;

  const metrics = [
    { label: "Clientes totales", value: total ?? 0,        sub: "base registrada",            accent: "var(--psy-blue)",  bg: "var(--psy-blue-light)" },
    { label: "Cuentas activas",  value: activos ?? 0,      sub: "usando plataforma",          accent: "var(--psy-green)", bg: "var(--psy-green-light)" },
    { label: "En trial",         value: trial ?? 0,        sub: "pendientes de conversión",   accent: "var(--psy-amber)", bg: "var(--psy-amber-light)" },
    { label: "Conversión",       value: `${conversion}%`,  sub: "trial a pago",               accent: "var(--psy-blue)",  bg: "var(--psy-blue-light)" },
  ];

  const planColors: Record<string, { bg: string; text: string }> = {
    trial:        { bg: "var(--psy-amber-light)", text: "var(--psy-amber)" },
    starter:      { bg: "var(--psy-blue-light)",  text: "var(--psy-blue)"  },
    professional: { bg: "var(--psy-green-light)", text: "var(--psy-green)" },
    clinic:       { bg: "var(--psy-ink)",         text: "var(--psy-paper)" },
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">

      {/* ── Hero banner ── */}
      <section className="reveal-rise relative overflow-hidden rounded-[2rem] border border-psy-ink/8 bg-psy-ink p-6 shadow-2xl shadow-psy-ink/20 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-psy-blue/20 via-transparent to-transparent" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Plataforma</p>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
              Panel de control
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/65">
              Salud comercial y operativa en una sola capa: conversiones,
              clientes activos, cuentas en trial y señales de intervención.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/clients/new" className="lift-button inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-psy-ink shadow-lg">
                Nuevo cliente
              </Link>
              <Link href="/admin/clients" className="lift-button inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Ver cartera completa
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 border border-white/10 p-5 backdrop-blur-sm transition hover:-translate-y-0.5">
                <p className="text-[10px] uppercase tracking-widest text-psy-blue font-bold">Clientes totales</p>
                <p className="mt-3 font-sora text-4xl font-bold text-white">{total ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-5 backdrop-blur-sm transition hover:-translate-y-0.5">
                <p className="text-[10px] uppercase tracking-widest text-psy-green font-bold">Activos</p>
                <p className="mt-3 font-sora text-4xl font-bold text-white">{activos ?? 0}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Conversión y riesgo</p>
                  <p className="mt-2 text-sm text-white/70">
                    {conversion}% trial a pago · {suspendidos} cuenta{suspendidos === 1 ? "" : "s"} suspendida{suspendidos === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-psy-blue/20 px-4 py-3 text-center border border-psy-blue/20">
                  <p className="font-sora text-2xl font-bold text-white">{trial ?? 0}</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mt-0.5">en trial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Métricas ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item, index) => (
          <div
            key={item.label}
            className="scroll-reveal card-deliverable rounded-[1.75rem] border border-[rgba(13,34,50,0.08)] bg-white p-5 shadow-[0_14px_34px_rgba(13,34,50,0.05)]"
            data-reveal-delay={String(index * 70)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: item.bg }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.accent }} />
            </div>
            <p className="mt-4 font-mono text-3xl font-semibold text-[var(--psy-ink)]">{item.value}</p>
            <p className="mt-1 text-sm font-medium text-[var(--psy-ink)]">{item.label}</p>
            <p className="text-xs text-[var(--psy-muted)]">{item.sub}</p>
          </div>
        ))}
      </section>

      {/* ── Clientes + Salud ── */}
      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="scroll-reveal rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-white p-6 shadow-[0_16px_42px_rgba(13,34,50,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">Clientes recientes</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--psy-ink)] md:text-3xl">
                Onboarding y cartera
              </h2>
            </div>
            <Link href="/admin/clients" className="text-sm font-medium text-[var(--psy-blue)] transition hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {(recientes ?? []).map((client) => {
              const trialLeft = client.trial_ends_at
                ? Math.max(0, Math.ceil((new Date(client.trial_ends_at).getTime() - Date.now()) / 86400000))
                : null;
              const palette = planColors[client.plan] ?? planColors.trial;

              return (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="hover-panel flex flex-col gap-4 rounded-[1.4rem] border border-[rgba(13,34,50,0.08)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--psy-blue-light)] text-sm font-semibold text-[var(--psy-blue)]">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--psy-ink)]">{client.name}</p>
                      <p className="truncate text-xs text-[var(--psy-muted)]">{client.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {trialLeft !== null && trialLeft > 0 && trialLeft <= 3 ? (
                      <span className="rounded-full bg-[var(--psy-red-light)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--psy-red)]">
                        {trialLeft}d
                      </span>
                    ) : null}
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]"
                      style={{ background: palette.bg, color: palette.text }}>
                      {client.plan}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                      client.account_status === "active" ? "bg-[var(--psy-green-light)] text-[var(--psy-green)]"
                      : client.account_status === "pending" ? "bg-[var(--psy-amber-light)] text-[var(--psy-amber)]"
                      : "bg-[var(--psy-red-light)] text-[var(--psy-red)]"
                    }`}>
                      {client.account_status === "active" ? "Activo" : client.account_status === "pending" ? "Pendiente" : "Suspendido"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="scroll-reveal rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-white p-6 shadow-[0_16px_42px_rgba(13,34,50,0.05)]" data-reveal-delay="80">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">Salud de plataforma</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--psy-ink)] md:text-3xl">
              Estado actual
            </h2>
            <div className="mt-5">
              <HealthStatus />
            </div>
          </div>

          <div className="rounded-[2rem] bg-[var(--psy-ink)] p-6 text-[var(--psy-paper)] shadow-[0_18px_44px_rgba(13,34,50,0.18)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(223,243,248,0.55)]">Acción sugerida</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              Prioriza cuentas en trial corto y suspendidos.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(223,243,248,0.78)]">
              Si la conversión es la métrica a empujar esta semana, el frente más
              claro está en quienes están terminando prueba y en cuentas que se
              quedaron a mitad de activación.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/admin/clients" className="lift-button inline-flex items-center justify-center rounded-[1rem] bg-[var(--psy-paper)] px-4 py-3 text-sm font-medium text-[var(--psy-ink)]">
                Revisar clientes
              </Link>
              <Link href="/admin/clients/new" className="lift-button inline-flex items-center justify-center rounded-[1rem] border border-white/12 px-4 py-3 text-sm font-medium text-white/84">
                Crear nuevo onboarding
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
