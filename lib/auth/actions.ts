"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensurePsychologistProfile } from "@/lib/auth/profile";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z.string().min(6, { error: "Mínimo 6 caracteres" }),
});

const RegisterSchema = z.object({
  name: z.string().min(2, { error: "Mínimo 2 caracteres" }),
  email: z.email({ error: "Email inválido" }),
  password: z.string().min(8, { error: "Mínimo 8 caracteres" }),
  professional_license: z.string().optional(),
});

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Credenciales incorrectas. Verifica tu email y contraseña." };
  }

  const profile = await ensurePsychologistProfile(supabase, authData.user);
  if (!profile) {
    await supabase.auth.signOut();
    return {
      error: "La cuenta existe en autenticación, pero no tiene perfil en psychologists. Se intentó recrearlo y falló.",
    };
  }

  if (profile.account_status === "suspended") {
    await supabase.auth.signOut();
    return { error: "Tu cuenta está suspendida. Contacta al administrador de la plataforma." };
  }

  revalidatePath("/", "layout");
  redirect(profile?.is_platform_admin ? "/admin" : "/dashboard");
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    professional_license: formData.get("professional_license") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        professional_license: parsed.data.professional_license ?? null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Crear perfil del psicólogo en la tabla psychologists
  if (data.user) {
    const { error: profileError } = await supabase.from("psychologists").insert({
      id: data.user.id,
      email: parsed.data.email,
      name: parsed.data.name,
      professional_license: parsed.data.professional_license ?? null,
      country: "CO",
      timezone: "America/Bogota",
      plan: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      google_calendar_connected: false,
    });

    if (profileError) {
      console.error("Error creating psychologist profile:", profileError);
    }
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
