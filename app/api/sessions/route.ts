import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateSessionSchema = z.object({
  patientId: z.string().uuid(),
  mode: z.enum(["presential", "virtual"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await request.json();
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { patientId, mode } = parsed.data;

    // Verificar que el paciente pertenece al psicólogo y tiene consentimiento
    const { data: patient } = await supabase
      .from("patients")
      .select("id, consent_signed_at")
      .eq("id", patientId)
      .eq("psychologist_id", user.id)
      .eq("status", "active")
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    if (!patient.consent_signed_at) {
      return NextResponse.json(
        { error: "El paciente no ha firmado el consentimiento informado" },
        { status: 403 },
      );
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        patient_id: patientId,
        psychologist_id: user.id,
        mode,
        scheduled_at: new Date().toISOString(),
        status: "recording",
      })
      .select("id")
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Error al crear la sesión" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id, hasConsent: !!patient.consent_signed_at });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
