import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield, Users, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/lib/auth/actions";

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "Resumen" },
  { href: "/admin/clients", icon: Users, label: "Clientes" },
  { href: "/admin/settings", icon: Settings, label: "Configuración" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("psychologists")
    .select("name, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (!admin?.is_platform_admin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(21,134,160,0.14),transparent_28%),linear-gradient(180deg,#C8E6F2_0%,#BEE0EC_100%)]">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-[rgba(13,34,50,0.08)] bg-[rgba(13,34,50,0.96)] text-[#DFF3F8] lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1586A0] shadow-[0_10px_24px_rgba(59,111,160,0.28)]">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-serif text-xl font-semibold tracking-tight">
                PsyAssist
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Panel administrador
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
              Operación
            </p>
            <p className="mt-2 text-sm leading-7 text-white/72">
              Vista global de clientes, conversiones, cuentas activas y salud de
              la plataforma.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm text-white/64 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="rounded-[1.3rem] bg-white/5 p-4">
            <p className="truncate text-sm font-medium text-white/84">
              {admin.name}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
              Administrador
            </p>
            <form action={logout} className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-[1rem] px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-40 border-b border-[rgba(13,34,50,0.08)] bg-[rgba(223,243,248,0.86)] px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1586A0] text-white">
                <Shield size={16} />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold tracking-tight text-[#0D2232]">
                  PsyAssist
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B6760]">
                  Admin
                </p>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-[rgba(13,34,50,0.08)] bg-white/60 px-3 py-2 text-sm text-[#0D2232]"
              >
                Salir
              </button>
            </form>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {adminNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-[rgba(13,34,50,0.08)] bg-white/55 px-4 py-2 text-sm text-[#0D2232]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
