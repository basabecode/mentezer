import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeSession } from "@/lib/ai/analysis";
import { segmentsToText } from "@/lib/ai/whisper";
import type { TranscriptSegment } from "@/lib/ai/whisper";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });

    // Verificar ownership de la sesión
    const { data: session } = await supabase
      .from("sessions")
      .select("id, patient_id, psychologist_id")
      .eq("id", sessionId)
      .eq("psychologist_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });

    // Verificar consentimiento
    const { data: patient } = await supabase
      .from("patients")
      .select("name, age, gender, reason, consent_signed_at")
      .eq("id", session.patient_id)
      .eq("psychologist_id", user.id)
      .single();

    if (!patient?.consent_signed_at) {
      return NextResponse.json({ error: "Consentimiento informado requerido" }, { status: 403 });
    }

    // Obtener transcripción
    const { data: transcript } = await supabase
      .from("transcripts")
      .select("content")
      .eq("session_id", sessionId)
      .single();

    if (!transcript?.content) {
      return NextResponse.json({ error: "Transcripción no encontrada" }, { status: 404 });
    }

    const transcriptText = segmentsToText(transcript.content as unknown as TranscriptSegment[]);

    // Contexto del paciente
    const patientContext = [
      `Nombre: ${patient.name}`,
      patient.age ? `Edad: ${patient.age}` : "",
      patient.gender ? `Género: ${patient.gender}` : "",
      `Motivo de consulta: ${patient.reason}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Sesiones anteriores
    const { data: prevReports } = await supabase
      .from("ai_reports")
      .select("summary, generated_at")
      .in(
        "session_id",
        (
          await supabase
            .from("sessions")
            .select("id")
            .eq("patient_id", session.patient_id)
            .neq("id", sessionId)
            .order("scheduled_at", { ascending: false })
            .limit(3)
        ).data?.map((s) => s.id) ?? []
      )
      .order("generated_at", { ascending: false })
      .limit(3);

    const previousSummary = (prevReports ?? [])
      .map((r) => `[${new Date(r.generated_at).toLocaleDateString("es-CO")}]: ${r.summary}`)
      .join("\n\n");

    // Ejecutar análisis
    const report = await analyzeSession({
      sessionId,
      transcript: transcriptText,
      patientContext,
      previousSessionsSummary: previousSummary,
      psychologistId: user.id,
    });

    // Audit log
    await supabase.from("audit_logs").insert({
      psychologist_id: user.id,
      action: "session.analyzed",
      resource_type: "session",
      resource_id: sessionId,
      metadata: {
        risk_signals_count: report.risk_signals.length,
        high_risk: report.risk_signals.some((s) => s.severity === "high"),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Error al analizar la sesión. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
