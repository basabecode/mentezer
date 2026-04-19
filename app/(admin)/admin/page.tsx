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
    supabase
      .from("psychologists")
      .select("*", { count: "exact", head: true })
      .neq("is_platform_admin", true),
    supabase
      .from("psychologists")
      .select("*", { count: "exact", head: true })
      .eq("account_status", "active")
      .neq("is_platform_admin", true),
    supabase
      .from("psychologists")
      .select("*", { count: "exact", head: true })
      .eq("plan", "trial")
      .neq("is_platform_admin", true),
    supabase
      .from("psychologists")
      .select("id, name, email, plan, account_status, created_at, trial_ends_at")
      .neq("is_platform_admin", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const suspendidos = (total ?? 0) - (activos ?? 0);
  const conversion = total ? Math.round((((total ?? 0) - (trial ?? 0)) / total) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
      <section className="paper-texture reveal-rise overflow-hidden rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-6 shadow-[0_20px_60px_rgba(13,34,50,0.08)] md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#6B6760]">
              Plataforma
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#0D2232] md:text-5xl">
              Panel de control
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[rgba(13,34,50,0.74)]">
              Aquí ves salud comercial y operativa en una sola capa:
              conversiones, clientes activos, cuentas en trial y señales que
              requieren intervención rápida.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/clients/new"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-[1.2rem] bg-[#0D2232] px-5 py-3 text-sm font-medium text-[#DFF3F8]"
              >
                Nuevo cliente
              </Link>
              <Link
                href="/admin/clients"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-[rgba(13,34,50,0.10)] bg-white/55 px-5 py-3 text-sm font-medium text-[#0D2232]"
              >
                Ver cartera completa
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-[rgba(13,34,50,0.08)] bg-white/62 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B6760]">
                Resumen ejecutivo
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[#D4EFF5] p-4">
                  <p className="text-xs text-[#1586A0]">Clientes totales</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#0D2232]">
                    {total ?? 0}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[#EBF4EE] p-4">
                  <p className="text-xs text-[#4A7C59]">Activos</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#0D2232]">
                    {activos ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] bg-[#0D2232] p-5 text-[#DFF3F8] shadow-[0_18px_44px_rgba(13,34,50,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(223,243,248,0.55)]">
                    Conversión y riesgo
                  </p>
                  <p className="mt-2 text-sm text-[rgba(223,243,248,0.78)]">
                    {conversion}% de conversión trial a pago y {suspendidos} cuenta
                    {suspendidos === 1 ? "" : "s"} suspendida
                    {suspendidos === 1 ? "" : "s"} para revisar.
                  </p>
                </div>
                <div className="rounded-[1.1rem] bg-[rgba(223,243,248,0.08)] px-4 py-3 text-center">
                  <p className="font-mono text-2xl font-semibold">{trial ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(223,243,248,0.55)]">
                    en trial
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Clientes totales",
            value: total ?? 0,
            sub: "base registrada",
            color: "#1586A0",
            bg: "#D4EFF5",
          },
          {
            label: "Cuentas activas",
            value: activos ?? 0,
            sub: "usando plataforma",
            color: "#4A7C59",
            bg: "#EBF4EE",
          },
          {
            label: "En trial",
            value: trial ?? 0,
            sub: "pendientes de conversión",
            color: "#B07D3A",
            bg: "#FBF3E4",
          },
          {
            label: "Conversión",
            value: `${conversion}%`,
            sub: "trial a pago",
            color: "#1586A0",
            bg: "#D4EFF5",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="hover-panel rounded-[1.75rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-5 shadow-[0_14px_34px_rgba(13,34,50,0.05)]"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: item.bg }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
            </div>
            <p className="mt-4 font-mono text-3xl font-semibold text-[#0D2232]">
              {item.value}
            </p>
            <p className="mt-1 text-sm font-medium text-[#0D2232]">{item.label}</p>
            <p className="text-xs text-[#6B6760]">{item.sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-6 shadow-[0_16px_42px_rgba(13,34,50,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B6760]">
                Clientes recientes
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#0D2232]">
                Onboarding y cartera
              </h2>
            </div>
            <Link href="/admin/clients" className="text-sm font-medium text-[#1586A0]">
              Ver todos
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {(recientes ?? []).map((client) => {
              const trialLeft = client.trial_ends_at
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(client.trial_ends_at).getTime() - Date.now()) /
                        86400000
                    )
                  )
                : null;

              const planColors: Record<string, { bg: string; text: string }> = {
                trial: { bg: "#FBF3E4", text: "#B07D3A" },
                starter: { bg: "#D4EFF5", text: "#1586A0" },
                professional: { bg: "#EBF4EE", text: "#4A7C59" },
                clinic: { bg: "#0D2232", text: "#DFF3F8" },
              };
              const palette = planColors[client.plan] ?? planColors.trial;

              return (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="hover-panel flex items-center justify-between gap-4 rounded-[1.4rem] border border-[rgba(13,34,50,0.08)] bg-white/62 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D4EFF5] text-sm font-semibold text-[#1586A0]">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0D2232]">
                        {client.name}
                      </p>
                      <p className="text-xs text-[#6B6760]">{client.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {trialLeft !== null && trialLeft > 0 && trialLeft <= 3 ? (
                      <span className="rounded-full bg-[#FDECEA] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#C0392B]">
                        {trialLeft}d
                      </span>
                    ) : null}
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]"
                      style={{ background: palette.bg, color: palette.text }}
                    >
                      {client.plan}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                        client.account_status === "active"
                          ? "bg-[#EBF4EE] text-[#4A7C59]"
                          : client.account_status === "pending"
                          ? "bg-[#FBF3E4] text-[#B07D3A]"
                          : "bg-[#FDECEA] text-[#C0392B]"
                      }`}
                    >
                      {client.account_status === "active"
                        ? "Activo"
                        : client.account_status === "pending"
                        ? "Pendiente"
                        : "Suspendido"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[2rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.90)] p-6 shadow-[0_16px_42px_rgba(13,34,50,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#6B6760]">
              Salud de plataforma
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#0D2232]">
              Estado actual
            </h2>

            <div className="mt-5 grid gap-3">
              {[
                { label: "API Claude", ok: true },
                { label: "API OpenAI", ok: true },
                { label: "Supabase DB", ok: true },
                { label: "Storage", ok: true },
                { label: "Webhooks activos", ok: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[1.2rem] bg-white/62 px-4 py-3"
                >
                  <p className="text-sm text-[#0D2232]">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.ok ? "bg-[#4A7C59]" : "bg-[#C0392B] animate-pulse"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        item.ok ? "text-[#4A7C59]" : "text-[#C0392B]"
                      }`}
                    >
                      {item.ok ? "Operativo" : "Error"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#0D2232] p-6 text-[#DFF3F8] shadow-[0_18px_44px_rgba(13,34,50,0.18)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(223,243,248,0.55)]">
              Acción sugerida
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
              Prioriza cuentas en trial corto y suspendidos.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[rgba(223,243,248,0.78)]">
              Si la conversión es la métrica a empujar esta semana, el frente más
              claro está en quienes están terminando prueba y en cuentas que se
              quedaron a mitad de activación.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/admin/clients"
                className="inline-flex items-center justify-center rounded-[1rem] bg-[#DFF3F8] px-4 py-3 text-sm font-medium text-[#0D2232]"
              >
                Revisar clientes
              </Link>
              <Link
                href="/admin/clients/new"
                className="inline-flex items-center justify-center rounded-[1rem] border border-white/12 px-4 py-3 text-sm font-medium text-white/84"
              >
                Crear nuevo onboarding
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
