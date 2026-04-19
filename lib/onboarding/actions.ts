"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const TRACK_VALUES = ["lite", "pro"] as const;

const BaseOnboardingSchema = z.object({
  track: z.enum(TRACK_VALUES),
  country: z.string().trim().min(2, { error: "Selecciona el país de tu práctica." }),
  specialty: z.string().trim().min(2, { error: "Indica tu enfoque o especialidad principal." }),
  selected_group_ids: z.string().trim().min(2, { error: "Selecciona al menos un enfoque clínico." }),
});

export type OnboardingState = {
  error?: string;
  fieldErrors?: {
    country?: string;
    specialty?: string;
    groups?: string;
  };
};

function parseGroupIds(rawValue: string) {
  const parsed = JSON.parse(rawValue) as unknown;
  return z.array(z.string().uuid()).parse(parsed);
}

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Inicia sesión de nuevo." };
  }

  const raw = {
    track: String(formData.get("track") ?? ""),
    country: String(formData.get("country") ?? ""),
    specialty: String(formData.get("specialty") ?? ""),
    selected_group_ids: String(formData.get("selected_group_ids") ?? "[]"),
  };

  const parsed = BaseOnboardingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: OnboardingState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "country" || field === "specialty") {
        fieldErrors[field] = issue.message;
      }
      if (field === "selected_group_ids") {
        fieldErrors.groups = issue.message;
      }
    }
    return { fieldErrors };
  }

  let groupIds: string[];
  try {
    groupIds = [...new Set(parseGroupIds(parsed.data.selected_group_ids))];
  } catch {
    return {
      fieldErrors: {
        groups: "No pudimos leer los enfoques seleccionados. Intenta de nuevo.",
      },
    };
  }

  if (groupIds.length === 0) {
    return {
      fieldErrors: {
        groups: "Selecciona al menos un enfoque clínico para continuar.",
      },
    };
  }

  const maxGroups = parsed.data.track === "lite" ? 3 : 8;
  if (groupIds.length > maxGroups) {
    return {
      fieldErrors: {
        groups:
          parsed.data.track === "lite"
            ? "Lite permite hasta 3 enfoques activos en el onboarding inicial."
            : "Pro permite hasta 8 enfoques activos.",
      },
    };
  }

  const { data: existingGroups, error: groupsError } = await supabase
    .from("knowledge_groups")
    .select("id")
    .in("id", groupIds);

  if (groupsError || (existingGroups ?? []).length !== groupIds.length) {
    return {
      fieldErrors: {
        groups: "Uno o más enfoques ya no están disponibles. Recarga la página.",
      },
    };
  }

  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("psychologists")
    .update({
      country: parsed.data.country,
      specialty: parsed.data.specialty,
      onboarding_completed_at: now,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "No pudimos guardar tu perfil inicial. Intenta de nuevo." };
  }

  const { error: deactivateError } = await supabase
    .from("psychologist_knowledge_groups")
    .update({ is_active: false })
    .eq("psychologist_id", user.id);

  if (deactivateError) {
    return { error: "No pudimos actualizar tus enfoques activos." };
  }

  const { error: activateError } = await supabase
    .from("psychologist_knowledge_groups")
    .upsert(
      groupIds.map((groupId) => ({
        psychologist_id: user.id,
        group_id: groupId,
        is_active: true,
        activated_at: now,
      })),
      { onConflict: "psychologist_id,group_id" }
    );

  if (activateError) {
    return { error: "No pudimos guardar los enfoques seleccionados." };
  }

  await supabase.from("audit_logs").insert({
    psychologist_id: user.id,
    action: "onboarding.completed",
    resource_type: "psychologist",
    resource_id: user.id,
    metadata: {
      track: parsed.data.track,
      country: parsed.data.country,
      specialty: parsed.data.specialty,
      selected_group_ids: groupIds,
    },
  });

  revalidatePath("/dashboard", "layout");
  revalidatePath("/knowledge");
  revalidatePath("/settings");
  redirect("/dashboard");
}
