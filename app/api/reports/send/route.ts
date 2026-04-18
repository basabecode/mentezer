import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReferralPDF } from "@/lib/pdf/generate";
import { sendReferralEmail } from "@/lib/email/send";
import { z } from "zod";

export const maxDuration = 60;

const SendSchema = z.object({
  referralId: z.string().uuid(),
  approvedContent: z.string().min(50),
  recipientEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await request.json();
    const parsed = SendSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const { referralId, approvedContent, recipientEmail } = parsed.data;

    // Verificar ownership
    const { data: referral } = await supabase
      .from("referral_reports")
      .select("id, patient_id, recipient_specialist_name, recipient_specialty, status")
      .eq("id", referralId)
      .eq("psychologist_id", user.id)
      .single();

    if (!referral) return NextResponse.json({ error: "Informe no encontrado" }, { status: 404 });

    // Fetch datos relacionados en paralelo
    const [{ data: patient }, { data: psychologist }] = await Promise.all([
      supabase.from("patients").select("name").eq("id", referral.patient_id).single(),
      supabase.from("psychologists").select("name, professional_license").eq("id", user.id).single(),
    ]);

    if (!patient || !psychologist) {
      return NextResponse.json({ error: "Datos incompletos para generar el PDF" }, { status: 500 });
    }

    const date = new Date().toLocaleDateString("es-CO", {
      day: "numeric", month: "long", year: "numeric",
    });

    // Generar PDF
    const pdfBuffer = await generateReferralPDF({
      patientName: patient.name,
      recipientName: referral.recipient_specialist_name,
      recipientSpecialty: referral.recipient_specialty,
      psychologistName: psychologist.name,
      psychologistLicense: psychologist.professional_license ?? "N/A",
      content: approvedContent,
      date,
    });

    // Subir PDF a Storage
    const pdfPath = `${user.id}/referrals/${referralId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);
      return NextResponse.json({ error: "Error al guardar el PDF" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from("documents").getPublicUrl(pdfPath);

    // Enviar email si se proporcionó
    let emailSentAt: string | null = null;
    if (recipientEmail) {
      try {
        await sendReferralEmail({
          to: recipientEmail,
          recipientName: referral.recipient_specialist_name,
          recipientSpecialty: referral.recipient_specialty,
          patientName: patient.name,
          psychologistName: psychologist.name,
          pdfBuffer,
          referralId,
        });
        emailSentAt = new Date().toISOString();
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // No bloqueamos — el PDF ya fue generado
      }
    }

    // Actualizar registro
    await supabase.from("referral_reports").update({
      approved_content: approvedContent,
      pdf_url: publicData.publicUrl,
      status: emailSentAt ? "sent" : "approved",
      ...(emailSentAt ? { email_sent_at: emailSentAt } : {}),
    }).eq("id", referralId);

    // Audit log
    await supabase.from("audit_logs").insert({
      psychologist_id: user.id,
      action: emailSentAt ? "referral.sent" : "referral.approved",
      resource_type: "referral_report",
      resource_id: referralId,
      metadata: { patient_id: referral.patient_id, specialty: referral.recipient_specialty },
    });

    return NextResponse.json({
      success: true,
      pdfUrl: publicData.publicUrl,
      emailSent: !!emailSentAt,
    });
  } catch (error) {
    console.error("Referral send error:", error);
    return NextResponse.json({ error: "Error al procesar el informe" }, { status: 500 });
  }
}
