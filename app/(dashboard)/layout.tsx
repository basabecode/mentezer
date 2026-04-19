import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/shell/Topbar";
import { FloatingDock } from "@/components/shell/FloatingDock";
import { SettingsDrawer } from "@/components/shell/SettingsDrawer";
import { PatientPanel } from "@/components/shell/PatientPanel";
import { DashboardProvider } from "@/components/shell/DashboardContext";

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
    supabase
      .from("psychologists")
      .select("name, onboarding_completed_at")
      .eq("id", user.id)
      .single(),
    supabase.from("patients").select("*", { count: "exact", head: true }).eq("psychologist_id", user.id).eq("status", "active"),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("psychologist_id", user.id).eq("status", "transcribing"),
    supabase.from("patients").select("id, name, status").eq("psychologist_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(20),
  ]);

  if (!psychologist?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <DashboardProvider>
      <div className="flex h-[100dvh] flex-col bg-psy-cream overflow-hidden">
        <Topbar
          psychologistName={psychologist?.name ?? user.email ?? "Psicólogo"}
          activePatients={activePatients ?? 0}
          pendingAnalysis={pendingAnalysis ?? 0}
        />

        <div className="flex-1 overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-[1400px] items-start gap-4 px-2 pb-2 md:px-5 md:pb-5">
            {/* Panel de pacientes (Vertical, al lado del contenido, alineado con el header) */}
            <PatientPanel patients={(panelPatients ?? []) as any} />

            {/* Contenido principal */}
            <main className="flex-1 h-full overflow-y-auto rounded-[2.5rem] border border-psy-border bg-psy-paper shadow-sm custom-scrollbar overflow-hidden">
              {children}
            </main>
          </div>
        </div>

        <FloatingDock />
        <SettingsDrawer />
      </div>
    </DashboardProvider>
  );
}
