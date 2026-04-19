import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIntegration } from "@/lib/integrations/loader";
import { processIncomingMessage } from "@/lib/messaging/processor";
import { createHmac } from "crypto";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psychologistId = searchParams.get("pid");
  if (!psychologistId) return new NextResponse("Missing pid", { status: 400 });

  // Verificar secret del webhook
  const secretHeader = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  const creds = await getIntegration(psychologistId, "telegram");
  if (!creds) return new NextResponse("Not configured", { status: 404 });

  if (creds.webhook_secret && secretHeader !== creds.webhook_secret) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const update = payload as {
    message?: {
      from?: { id: number; first_name?: string; last_name?: string; username?: string };
      text?: string;
      chat?: { id: number };
    };
  };

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const senderId = String(message.from?.id ?? "");
  const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ")
    || message.from?.username
    || senderId;
  const text = message.text ?? "";

  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("messaging_logs").insert({
    psychologist_id: psychologistId,
    channel: "telegram",
    direction: "inbound",
    sender_id: senderId,
    sender_name: senderName,
    message_text: text,
    raw_payload: payload as Record<string, unknown>,
    processed_at: new Date().toISOString(),
  });

  await processIncomingMessage({
    psychologistId,
    channel: "telegram",
    senderId,
    senderName,
    text,
    rawPayload: payload,
  });

  return NextResponse.json({ ok: true });
}
