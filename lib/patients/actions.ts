"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PatientSchema = z.object({
  name: z.string().min(2, { error: "Nombre requerido" }),
  document_id: z.string().optional(),
  age: z.coerce.number().min(1).max(120).optional(),
  gender: z.enum(["masculino", "femenino", "no_binario", "prefiero_no_decir"]).optional(),
  contact_email: z.email({ error: "Email inválido" }).optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  reason: z.string().min(5, { error: "Describe el motivo de consulta" }),
  referred_by: z.string().optional(),
});

export type PatientState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createPatient(
  _prev: PatientState,
  formData: FormData
): Promise<PatientState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = PatientSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
    });
    return { fieldErrors };
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...parsed.data,
      psychologist_id: user.id,
      contact_email: parsed.data.contact_email || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear el paciente. Inténtalo de nuevo." };

  // Audit log
  await supabase.from("audit_logs").insert({
    psychologist_id: user.id,
    action: "patient.created",
    resource_type: "patient",
    resource_id: data.id,
    metadata: { patient_name: parsed.data.name },
  });

  revalidatePath("/patients");
  redirect(`/patients/${data.id}`);
}

export async function signConsent(patientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("patients")
    .update({ consent_signed_at: new Date().toISOString() })
    .eq("id", patientId)
    .eq("psychologist_id", user.id);

  if (error) return { error: "Error al registrar el consentimiento" };

  await supabase.from("audit_logs").insert({
    psychologist_id: user.id,
    action: "patient.consent_signed",
    resource_type: "patient",
    resource_id: patientId,
    metadata: {},
  });

  revalidatePath(`/patients/${patientId}`);
  return { success: true };
}

export async function deletePatient(patientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar ownership
  const { data: patient } = await supabase
    .from("patients")
    .select("id, name")
    .eq("id", patientId)
    .eq("psychologist_id", user.id)
    .single();

  if (!patient) return { error: "Paciente no encontrado" };

  // Registrar la solicitud de eliminación
  await supabase.from("data_deletion_requests").insert({
    patient_id: patientId,
    psychologist_id: user.id,
  });

  // Eliminación en cascada (RLS + ON DELETE CASCADE en migraciones)
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId)
    .eq("psychologist_id", user.id);

  if (error) return { error: "Error al eliminar los datos" };

  await supabase.from("audit_logs").insert({
    psychologist_id: user.id,
    action: "patient.deleted_gdpr",
    resource_type: "patient",
    resource_id: patientId,
    metadata: { name: patient.name, deleted_at: new Date().toISOString() },
  });

  revalidatePath("/patients");
  redirect("/patients");
}
