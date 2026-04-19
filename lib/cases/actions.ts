"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface CreateCaseState {
  error?: string;
  errors?: Record<string, string>;
}

export async function createCase(
  prevState: CreateCaseState,
  formData: FormData
): Promise<CreateCaseState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const sessions_count = parseInt(formData.get("sessions_count") as string, 10);
  const outcome = formData.get("outcome") as string;
  const interventions_json = formData.get("interventions_json") as string;

  if (!title || !description || !outcome) {
    return {
      errors: {
        title: !title ? "El título es requerido" : "",
        description: !description ? "La descripción es requerida" : "",
        outcome: !outcome ? "El resultado es requerido" : "",
      },
    };
  }

  const interventions = interventions_json ? JSON.parse(interventions_json) : [];

  try {
    const { error } = await supabase.from("clinical_cases").insert({
      psychologist_id: user.id,
      title,
      description,
      sessions_count: sessions_count || 0,
      outcome,
      interventions_used: interventions,
    });

    if (error) {
      throw error;
    }

    redirect("/cases");
  } catch (err: any) {
    return {
      error: err.message || "Error al guardar el caso. Intenta de nuevo.",
    };
  }
}
