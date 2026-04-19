import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PatchSchema = z.object({
  group_id: z.string().uuid().nullable().optional(),
  personal_label: z.string().max(100).nullable().optional(),
  title: z.string().min(1).max(200).optional(),
  author: z.string().max(200).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("knowledge_documents")
    .update(parsed.data)
    .eq("id", id)
    .eq("psychologist_id", user.id)
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar el documento" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
