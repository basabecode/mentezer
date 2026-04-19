import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

const CreatePaymentSchema = z.object({
  amount_usd: z.number().positive("Amount must be positive"),
  payment_method: z.enum([
    "cash",
    "transfer",
    "nequi",
    "daviplata",
    "card",
    "waived",
  ]),
  session_id: z.string().uuid().optional().nullable(),
  patient_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  paid_at: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month";

  try {
    let query = supabase
      .from("payments")
      .select("*")
      .eq("psychologist_id", session.user.id)
      .order("created_at", { ascending: false });

    // Filter by period
    const now = new Date();
    if (period === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte("created_at", monthAgo.toISOString());
    } else if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte("created_at", weekAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate stats
    const stats = {
      total: data?.reduce((sum, p) => sum + (p.amount_usd || 0), 0) || 0,
      completed: data
        ?.filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + (p.amount_usd || 0), 0) || 0,
      pending: data
        ?.filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + (p.amount_usd || 0), 0) || 0,
      count: data?.length || 0,
    };

    return new Response(JSON.stringify({ data, stats }), { status: 200 });
  } catch (err) {
    console.error("[Payments] GET error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch payments" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await request.json();
    const payload = CreatePaymentSchema.parse(body);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("payments")
      .insert({
        psychologist_id: session.user.id,
        amount_usd: payload.amount_usd,
        payment_method: payload.payment_method,
        session_id: payload.session_id || null,
        patient_id: payload.patient_id || null,
        notes: payload.notes || null,
        paid_at: payload.paid_at ? new Date(payload.paid_at) : null,
        status: payload.paid_at ? "completed" : "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: err.errors }), {
        status: 400,
      });
    }
    console.error("[Payments] POST error:", err);
    return new Response(JSON.stringify({ error: "Failed to create payment" }), {
      status: 500,
    });
  }
}
