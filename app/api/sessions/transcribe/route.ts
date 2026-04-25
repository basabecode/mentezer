import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/ai/whisper";
import type { Json } from "@/types/supabase";

export const maxDuration = 300; // 5 min timeout para audio largo

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const sessionId = formData.get("sessionId") as string | null;
    const metadataRaw = formData.get("metadata");

    if (!audioFile || !sessionId) {
      return NextResponse.json({ error: "Audio y sessionId son requeridos" }, { status: 400 });
    }

    // Verificar que la sesión pertenece al psicólogo
    const { data: session } = await supabase
      .from("sessions")
      .select("id, patient_id")
      .eq("id", sessionId)
      .eq("psychologist_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    // Verificar consentimiento del paciente
    const { data: patient } = await supabase
      .from("patients")
      .select("consent_signed_at")
      .eq("id", session.patient_id)
      .eq("psychologist_id", user.id)
      .single();

    if (!patient?.consent_signed_at && process.env.DEV_BYPASS_CONSENT !== 'true') {
      return NextResponse.json(
        { error: "El paciente no ha firmado el consentimiento informado" },
        { status: 403 }
      );
    }

    // Actualizar estado a 'transcribing'
    await supabase
      .from("sessions")
      .update({ status: "transcribing" })
      .eq("id", sessionId);

    // Transcribir
    const segments = await transcribeAudio(audioFile, sessionId, user.id);
    let metadata: Record<string, unknown> = {};
    if (typeof metadataRaw === "string") {
      try {
        metadata = JSON.parse(metadataRaw) as Record<string, unknown>;
      } catch {
        metadata = {};
      }
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      psychologist_id: user.id,
      action: "session.transcribed",
      resource_type: "session",
      resource_id: sessionId,
      metadata: {
        segment_count: segments.length,
        audio_size_bytes: audioFile.size,
        recording: metadata,
      } as Json,
    });

    return NextResponse.json({ success: true, segmentCount: segments.length });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Error al transcribir el audio. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
