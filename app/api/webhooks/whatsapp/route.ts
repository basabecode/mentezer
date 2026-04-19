import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIntegration } from "@/lib/integrations/loader";
import { processIncomingMessage } from "@/lib/messaging/processor";

// Verificación del webhook de Meta/Twilio
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psychologistId = searchParams.get("pid");
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!psychologistId || mode !== "subscribe") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Verificar token contra el configurado para este psicólogo
  const creds = await getIntegration(psychologistId, "whatsapp_meta");
  if (!creds || creds.verify_token !== token) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psychologistId = searchParams.get("pid");

  if (!psychologistId) return new NextResponse("Missing pid", { status: 400 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const supabase = createAdminClient();

  // Extraer mensaje del payload de Meta
  const entry = (payload as { entry?: { changes?: { value?: { messages?: { from: string; text?: { body: string }; profile?: { name: string } }[] } }[] }[] })
    ?.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];

  if (!message) return NextResponse.json({ ok: true }); // Sin mensaje relevante

  const senderPhone = message.from;
  const text = message.text?.body ?? "";
  const senderName = message.profile?.name ?? senderPhone;

  // Log del mensaje
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("messaging_logs").insert({
    psychologist_id: psychologistId,
    channel: "whatsapp",
    direction: "inbound",
    sender_id: senderPhone,
    sender_name: senderName,
    message_text: text,
    raw_payload: payload as Record<string, unknown>,
    processed_at: new Date().toISOString(),
  });

  // Procesar mensaje (detectar intención y responder)
  await processIncomingMessage({
    psychologistId,
    channel: "whatsapp",
    senderId: senderPhone,
    senderName,
    text,
    rawPayload: payload,
  });

  return NextResponse.json({ ok: true });
}
