import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authDebug } from "@/lib/auth/debug";
import Link from "next/link";
import { Shield, Users, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { MentezerLogo } from "@/components/brand/MentezerLogo";

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
  authDebug("admin.layout.user", {
    hasUser: Boolean(user),
    userId: user?.id ?? null,
    email: user?.email ?? null,
  });
  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("psychologists")
    .select("name, is_platform_admin")
    .eq("id", user.id)
    .single();

  authDebug("admin.layout.profile", {
    userId: user.id,
    hasProfile: Boolean(admin),
    isPlatformAdmin: admin?.is_platform_admin ?? null,
  });

  if (!admin?.is_platform_admin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[#F7F9F9]">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#1c4c96] text-psy-paper lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <MentezerLogo variant="dark" size="sm" />
          </div>
          <p className="mt-1.5 text-xs uppercase tracking-widest text-white/40">
            Panel administrador
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Operación
            </p>
            <p className="mt-2 text-sm leading-7 text-white/72">
              Vista global de clientes, conversiones, cuentas activas y salud de
              la plataforma.
            </p>
          </div>
        </div>

        <AdminNav items={adminNav} />

        <div className="border-t border-white/10 px-3 py-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="truncate text-sm font-medium text-white/84">
              {admin.name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
              Administrador
            </p>
            <form action={logout} className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-40 border-b border-psy-border bg-white/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MentezerLogo variant="light" size="sm" />
              <span className="text-xs uppercase tracking-widest text-psy-muted">Admin</span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-psy-ink/10 bg-white/60 px-3 py-2 text-sm text-psy-ink"
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
                className="rounded-full border border-psy-ink/10 bg-white/55 px-4 py-2 text-sm text-psy-ink"
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
