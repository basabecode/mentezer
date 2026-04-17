import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield, Users, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("psychologists")
    .select("name, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (!admin?.is_platform_admin) redirect("/dashboard");

  return (
    <div className="flex h-screen bg-psy-cream">
      {/* Sidebar admin */}
      <aside className="w-56 bg-psy-ink flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-psy-blue flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">PsyAssist</p>
              <p className="text-white/40 text-[10px]">Panel de administración</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { href: "/admin", icon: LayoutDashboard, label: "Resumen" },
            { href: "/admin/clients", icon: Users, label: "Clientes" },
            { href: "/admin/settings", icon: Settings, label: "Configuración" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <p className="text-white/40 text-[10px] px-3 mb-2 truncate">{admin.name}</p>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
