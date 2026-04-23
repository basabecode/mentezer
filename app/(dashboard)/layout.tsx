import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authDebug } from "@/lib/auth/debug";
import { Topbar } from "@/components/shell/Topbar";
import { FloatingDock } from "@/components/shell/FloatingDock";
import { SettingsDrawer } from "@/components/shell/SettingsDrawer";
import { DashboardProvider } from "@/components/shell/DashboardContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  authDebug("dashboard.layout.user", {
    hasUser: Boolean(user),
    userId: user?.id ?? null,
    email: user?.email ?? null,
  });

  if (!user) redirect("/login");

  const [{ data: psychologist }, { count: activePatients }, { count: pendingAnalysis }] = await Promise.all([
    supabase
      .from("psychologists")
      .select("name, onboarding_completed_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user.id)
      .eq("status", "active"),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user.id)
      .eq("status", "transcribing"),
  ]);

  authDebug("dashboard.layout.profile", {
    userId: user.id,
    hasProfile: Boolean(psychologist),
    onboardingCompletedAt: psychologist?.onboarding_completed_at ?? null,
  });

  if (!psychologist?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <DashboardProvider>
      <div className="paper-texture flex h-[100dvh] flex-col overflow-hidden bg-psy-cream">
        <Topbar
          psychologistName={psychologist?.name ?? user.email ?? "Psicólogo"}
          activePatients={activePatients ?? 0}
          pendingAnalysis={pendingAnalysis ?? 0}
        />

        <div className="flex-1 overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-[1480px] items-stretch gap-3 px-2 pb-2 sm:px-3 md:px-5 md:pb-5 lg:gap-4">
            <FloatingDock />

            <main className="custom-scrollbar calm-panel h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>

        <SettingsDrawer />
      </div>
    </DashboardProvider>
  );
}
