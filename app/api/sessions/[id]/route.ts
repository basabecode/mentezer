import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", id)
      .eq("psychologist_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .eq("psychologist_id", user.id);

    if (error) {
      return NextResponse.json({ error: "No se pudo eliminar la sesión" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
