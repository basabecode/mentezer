"use server";

import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/url/app-url";

export interface ResetPasswordState {
  success?: boolean;
  error?: string;
}

export async function resetPassword(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return {
      error: "El correo es requerido",
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAppUrl("/update-password"),
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      error: "Error al enviar el enlace. Verifica que el correo sea correcto.",
    };
  }
}
