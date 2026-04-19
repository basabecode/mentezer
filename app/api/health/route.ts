import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks = {
    supabase: { ok: false, latency: 0 },
    claude: { ok: false, latency: 0 },
    storage: { ok: false, latency: 0 },
  };

  // Check Supabase
  try {
    const start = Date.now();
    const supabase = await createClient();
    const { data, error } = await supabase.from("psychologists").select("count()", { count: "exact", head: true });
    checks.supabase = {
      ok: !error,
      latency: Date.now() - start,
    };
  } catch {
    checks.supabase = { ok: false, latency: 0 };
  }

  // Check Claude API (via environment)
  try {
    checks.claude = {
      ok: !!process.env.ANTHROPIC_API_KEY,
      latency: 0,
    };
  } catch {
    checks.claude = { ok: false, latency: 0 };
  }

  // Check Storage (Supabase)
  try {
    const start = Date.now();
    const supabase = await createClient();
    const { data, error } = await supabase.storage.listBuckets();
    checks.storage = {
      ok: !error && Array.isArray(data),
      latency: Date.now() - start,
    };
  } catch {
    checks.storage = { ok: false, latency: 0 };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return Response.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { "Cache-Control": "no-cache" },
    }
  );
}
