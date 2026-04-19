import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: psychologist, error: psychologistError },
    { data: groups },
    { data: activeGroupRows },
    { count: patientCount },
    { count: documentCount },
  ] = await Promise.all([
    supabase
      .from("psychologists")
      .select("id, name, plan, country, specialty, is_platform_admin, onboarding_completed_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("knowledge_groups")
      .select("id, slug, name, description, color, book_count")
      .order("name"),
    supabase
      .from("psychologist_knowledge_groups")
      .select("group_id, is_active")
      .eq("psychologist_id", user.id)
      .eq("is_active", true),
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user.id),
    supabase
      .from("knowledge_documents")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user.id)
      .eq("source_type", "personal"),
  ]);

  if (psychologistError || !psychologist) {
    redirect("/login");
  }

  if (psychologist.is_platform_admin) {
    redirect("/admin");
  }

  if (psychologist.onboarding_completed_at) {
    redirect("/dashboard");
  }

  const defaultTrack =
    psychologist.plan === "professional" || psychologist.plan === "clinic"
      ? "pro"
      : "lite";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(21,134,160,0.14),transparent_24%),linear-gradient(180deg,#F5F2ED_0%,#E7F0F5_100%)]">
      <OnboardingFlow
        name={psychologist.name}
        defaultTrack={defaultTrack}
        initialCountry={psychologist.country ?? "CO"}
        initialSpecialty={psychologist.specialty ?? ""}
        groups={groups ?? []}
        activeGroupIds={(activeGroupRows ?? []).map((row) => row.group_id)}
        stats={{
          patients: patientCount ?? 0,
          documents: documentCount ?? 0,
          activeGroups: (activeGroupRows ?? []).length,
        }}
      />
    </main>
  );
}
