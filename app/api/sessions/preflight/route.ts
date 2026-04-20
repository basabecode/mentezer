import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { segmentsToText, transcribePreviewAudio } from "@/lib/ai/whisper";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File)) {
      return NextResponse.json({ error: "Se requiere una muestra de audio" }, { status: 400 });
    }

    if (audioFile.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "La muestra de prueba supera el límite permitido" }, { status: 400 });
    }

    const segments = await transcribePreviewAudio(audioFile);
    const transcript = segmentsToText(segments).trim();

    if (!transcript) {
      return NextResponse.json(
        { error: "La IA no detectó una transcripción utilizable en la muestra." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      transcript,
      segmentCount: segments.length,
    });
  } catch (error) {
    console.error("Audio preflight error:", error);
    return NextResponse.json(
      { error: "No se pudo validar la muestra con IA. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
