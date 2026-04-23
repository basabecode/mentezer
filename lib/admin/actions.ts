"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptJSON } from "@/lib/integrations/crypto";
import { getAppUrl } from "@/lib/url/app-url";
import { redirect } from "next/navigation";
import { z } from "zod";

const NewClientSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  name: z.string().min(2, { message: "Nombre requerido" }),
  professional_license: z.string().optional(),
  specialty: z.string().optional(),
  country: z.string().default("CO"),
  plan: z.enum(["trial", "starter", "professional", "clinic"]).default("trial"),
  trial_days: z.coerce.number().int().min(1).max(90).default(14),
});

const IntegrationSchema = z.object({
  psychologist_id: z.string().uuid(),
  provider: z.enum(["google_calendar", "email_resend", "email_smtp", "whatsapp_twilio", "whatsapp_meta", "telegram"]),
  display_name: z.string().optional(),
  // Campos dinámicos según provider — se validan en el servidor
  credentials_json: z.string().min(2, { message: "Credenciales requeridas" }),
});

export async function createClient_admin(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar que es admin
  const { data: admin } = await supabase
    .from("psychologists")
    .select("is_platform_admin")
    .eq("id", user.id)
    .single();
  if (!admin?.is_platform_admin) return { error: "Sin permisos" };

  const parsed = NewClientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, name, professional_license, specialty, country, plan, trial_days } = parsed.data;

  // Crear usuario en Supabase Auth con service_role
  const adminSupabase = createAdminClient();
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: generateTempPassword(),
  });

  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Error al crear la cuenta" };
  }

  // Crear perfil de psicólogo
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trial_days);

  const { error: profileError } = await adminSupabase
    .from("psychologists")
    .insert({
      id: authUser.user.id,
      email,
      name,
      professional_license: professional_license ?? null,
      specialty: specialty ?? null,
      country,
      plan,
      trial_ends_at: trialEndsAt.toISOString(),
      account_status: "active",
    } as Parameters<typeof adminSupabase.from>[0] extends never ? never : never);

  // Usamos upsert directo
  await adminSupabase.from("psychologists").upsert({
    id: authUser.user.id,
    email,
    name,
    professional_license: professional_license ?? null,
    specialty: specialty ?? null,
    country,
    plan,
    trial_ends_at: trialEndsAt.toISOString(),
  });

  if (profileError) {
    // Revertir usuario de auth
    await adminSupabase.auth.admin.deleteUser(authUser.user.id);
    return { error: "Error al crear el perfil" };
  }

  // Enviar email de bienvenida con link para establecer contraseña
  const passwordSetupUrl = getAppUrl("/update-password");
  const { error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: passwordSetupUrl },
  });

  if (linkError) {
    await adminSupabase.auth.admin.deleteUser(authUser.user.id);
    return { error: `No se pudo generar el enlace de activación: ${linkError.message}` };
  }

  redirect(`/admin/clients/${authUser.user.id}`);
}

export async function saveIntegration(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: admin } = await supabase
    .from("psychologists")
    .select("is_platform_admin")
    .eq("id", user.id)
    .single();
  if (!admin?.is_platform_admin) return { error: "Sin permisos" };

  const parsed = IntegrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { psychologist_id, provider, display_name, credentials_json } = parsed.data;

  let credentialsObj: Record<string, unknown>;
  try {
    credentialsObj = JSON.parse(credentials_json);
  } catch {
    return { error: "JSON de credenciales inválido" };
  }

  const credentials_enc = encryptJSON(credentialsObj);

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("psychologist_integrations").upsert({
    psychologist_id,
    provider,
    credentials_enc,
    display_name: display_name ?? null,
    is_active: true,
    configured_at: new Date().toISOString(),
  });

  if (error) return { error: "Error al guardar las credenciales" };

  redirect(`/admin/clients/${psychologist_id}`);
}

export async function toggleClientStatus(
  psychologistId: string,
  status: "active" | "suspended"
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: admin } = await supabase
    .from("psychologists")
    .select("is_platform_admin")
    .eq("id", user.id)
    .single();
  if (!admin?.is_platform_admin) return;

  const adminSupabase = createAdminClient();
  await adminSupabase
    .from("psychologists")
    .update({ account_status: status })
    .eq("id", psychologistId);
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
