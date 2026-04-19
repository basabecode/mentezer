import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type PsychologistRow = Database["public"]["Tables"]["psychologists"]["Row"];
type PsychologistInsert = Database["public"]["Tables"]["psychologists"]["Insert"];
type PsychologistProfile = Pick<PsychologistRow, "id" | "is_platform_admin" | "account_status">;

const ADMIN_ROLE_VALUES = new Set(["admin", "platform_admin", "superadmin", "super_admin", "administrador"]);
const ACTIVE_ACCOUNT_STATUS: PsychologistRow["account_status"] = "active";

function metadataRecord(user: User): Record<string, unknown> {
  return {
    ...(user.app_metadata ?? {}),
    ...(user.user_metadata ?? {}),
  };
}

function metadataString(metadata: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }

  return null;
}

function metadataBoolean(metadata: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "si", "sí"].includes(normalized)) return true;
      if (["false", "0", "no"].includes(normalized)) return false;
    }
  }

  return false;
}

function inferDisplayName(user: User, metadata: Record<string, unknown>): string {
  const explicitName = metadataString(metadata, "name", "full_name", "display_name");
  if (explicitName) return explicitName;

  const emailPrefix = user.email?.split("@")[0]?.replace(/[._-]+/g, " ")?.trim();
  if (!emailPrefix) return "Profesional";

  return emailPrefix
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferPlan(metadata: Record<string, unknown>): PsychologistRow["plan"] {
  const rawPlan = metadataString(metadata, "plan")?.toLowerCase();
  if (rawPlan === "starter" || rawPlan === "professional" || rawPlan === "clinic") {
    return rawPlan;
  }

  return "trial";
}

function inferAccountStatus(metadata: Record<string, unknown>): PsychologistRow["account_status"] {
  const rawStatus = metadataString(metadata, "account_status", "status")?.toLowerCase();
  if (rawStatus === "suspended" || rawStatus === "pending") {
    return rawStatus;
  }

  return ACTIVE_ACCOUNT_STATUS;
}

function inferAdminFlag(metadata: Record<string, unknown>): boolean {
  const rawRole = metadataString(metadata, "role", "rol", "user_role", "account_role")?.toLowerCase();
  if (rawRole && ADMIN_ROLE_VALUES.has(rawRole)) return true;

  return metadataBoolean(metadata, "is_platform_admin", "isPlatformAdmin", "platform_admin");
}

export function buildPsychologistProfileInsert(user: User): PsychologistInsert | null {
  if (!user.email) return null;

  const metadata = metadataRecord(user);

  return {
    id: user.id,
    email: user.email,
    name: inferDisplayName(user, metadata),
    professional_license: metadataString(metadata, "professional_license", "license", "tp"),
    specialty: metadataString(metadata, "specialty", "speciality"),
    country: metadataString(metadata, "country") ?? "CO",
    timezone: metadataString(metadata, "timezone") ?? "America/Bogota",
    plan: inferPlan(metadata),
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    google_calendar_connected: false,
    is_platform_admin: inferAdminFlag(metadata),
    account_status: inferAccountStatus(metadata),
  };
}

export async function ensurePsychologistProfile(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<PsychologistProfile | null> {
  const existingQuery = await supabase
    .from("psychologists")
    .select("id, is_platform_admin, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (existingQuery.error) {
    console.error("Error loading psychologist profile:", existingQuery.error.message);
    return null;
  }

  if (existingQuery.data) {
    return existingQuery.data;
  }

  const profileInsert = buildPsychologistProfileInsert(user);
  if (!profileInsert) return null;

  const insertedQuery = await supabase
    .from("psychologists")
    .insert(profileInsert)
    .select("id, is_platform_admin, account_status")
    .single();

  if (!insertedQuery.error && insertedQuery.data) {
    return insertedQuery.data;
  }

  console.error("Error creating missing psychologist profile:", insertedQuery.error?.message);

  const fallbackQuery = await supabase
    .from("psychologists")
    .select("id, is_platform_admin, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (fallbackQuery.error) {
    console.error("Error loading psychologist profile after retry:", fallbackQuery.error.message);
    return null;
  }

  return fallbackQuery.data;
}
