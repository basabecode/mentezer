import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/shell/Topbar";
import { FloatingDock } from "@/components/shell/FloatingDock";
import { SettingsDrawer } from "@/components/shell/SettingsDrawer";
import { PatientPanel } from "@/components/shell/PatientPanel";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: psychologist },
    { count: activePatients },
    { count: pendingAnalysis },
    { data: panelPatients },
  ] = await Promise.all([
    supabase.from("psychologists").select("name").eq("id", user.id).single(),
    supabase.from("patients").select("*", { count: "exact", head: true }).eq("psychologist_id", user.id).eq("status", "active"),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("psychologist_id", user.id).eq("status", "transcribing"),
    supabase.from("patients").select("id, name, status").eq("psychologist_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="flex h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(21,134,160,0.14),transparent_28%),linear-gradient(180deg,#C8E6F2_0%,#BEE0EC_100%)]">
      <Topbar
        psychologistName={psychologist?.name ?? user.email ?? "Psicólogo"}
        activePatients={activePatients ?? 0}
        pendingAnalysis={pendingAnalysis ?? 0}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Panel lateral de pacientes */}
        <PatientPanel patients={(panelPatients ?? []) as Parameters<typeof PatientPanel>[0]["patients"]} />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-32">
          {children}
        </main>
      </div>

      <FloatingDock />
      <SettingsDrawer />
    </div>
  );
}
