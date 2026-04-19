import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET — todos los grupos base + estado activo del psicólogo
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [{ data: groups }, { data: activeGroups }] = await Promise.all([
    supabase.from("knowledge_groups").select("id, slug, name, description, color, book_count").order("name"),
    supabase.from("psychologist_knowledge_groups").select("group_id, is_active").eq("psychologist_id", user.id),
  ]);

  const activeMap = new Map((activeGroups ?? []).map((r) => [r.group_id, r.is_active]));

  const enriched = (groups ?? []).map((g) => ({
    ...g,
    is_active: activeMap.get(g.id) ?? false,
  }));

  return NextResponse.json({ data: enriched });
}

// POST — activar o desactivar un grupo
const ToggleSchema = z.object({
  group_id: z.string().uuid(),
  is_active: z.boolean(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { group_id, is_active } = parsed.data;

  const { error } = await supabase
    .from("psychologist_knowledge_groups")
    .upsert(
      { psychologist_id: user.id, group_id, is_active, activated_at: new Date().toISOString() },
      { onConflict: "psychologist_id,group_id" }
    );

  if (error) return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });

  return NextResponse.json({ data: { group_id, is_active } });
}
