import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateManualSessionSchema = z.object({
  patientId: z.string().uuid(),
  note: z.string().trim().min(30).max(20000),
  mode: z.enum(["presential", "virtual"]).default("presential"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateManualSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos para documentar la sesión" }, { status: 400 });
    }

    const { patientId, note, mode } = parsed.data;

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("psychologist_id", user.id)
      .eq("status", "active")
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        patient_id: patientId,
        psychologist_id: user.id,
        mode,
        scheduled_at: now,
        status: "complete",
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "No se pudo crear la sesión escrita" }, { status: 500 });
    }

    const { error: transcriptError } = await supabase.from("transcripts").upsert({
      session_id: session.id,
      content: [
        {
          start: 0,
          end: 0,
          text: note,
          speaker: "psicólogo",
        },
      ] as unknown as import("@/types/supabase").Json,
      edited_at: now,
    });

    if (transcriptError) {
      await supabase.from("sessions").delete().eq("id", session.id).eq("psychologist_id", user.id);
      return NextResponse.json({ error: "No se pudo guardar la documentación escrita" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Create manual session error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
