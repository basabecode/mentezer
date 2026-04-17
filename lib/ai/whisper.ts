import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: "psicólogo" | "paciente" | "desconocido";
}

export async function transcribeAudio(
  audioFile: File,
  sessionId: string,
  psychologistId: string
): Promise<TranscriptSegment[]> {
  // Transcribir con Whisper large-v3, idioma español
  const response = await getOpenAI().audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",          // API name (maps to large-v3)
    language: "es",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments: TranscriptSegment[] = (response.segments ?? []).map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
    speaker: "desconocido",
  }));

  const supabase = await createClient();

  // Guardar transcript en DB
  await supabase.from("transcripts").upsert({
    session_id: sessionId,
    content: segments as unknown as import("@/types/supabase").Json,
    edited_at: null,
  });

  // Actualizar estado de la sesión
  await supabase
    .from("sessions")
    .update({ status: "analyzing" })
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId);

  return segments;
}

export function segmentsToText(segments: TranscriptSegment[]): string {
  return segments.map((s) => s.text).join(" ");
}

export function segmentsToReadable(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => {
      const time = formatTime(s.start);
      return `[${time}] ${s.text}`;
    })
    .join("\n");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
