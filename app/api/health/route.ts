import { createClient } from "@/lib/supabase/server";

/**
 * Health check endpoint.
 *
 * Always responds with HTTP 200 so browsers do not log 5xx errors in the
 * console. The real status lives in the JSON body (`status: "healthy" |
 * "degraded"`), which is what the HealthStatus widget reads.
 */
export async function GET() {
  const checks = {
    supabase: { ok: false, latency: 0 },
    claude: { ok: false, latency: 0 },
    storage: { ok: false, latency: 0 },
  };

  // Supabase DB reachability
  try {
    const start = Date.now();
    const supabase = await createClient();
    const { error } = await supabase
      .from("psychologists")
      .select("id", { count: "exact", head: true })
      .limit(1);
    checks.supabase = { ok: !error, latency: Date.now() - start };
  } catch {
    checks.supabase = { ok: false, latency: 0 };
  }

  // Claude API key presence (cheap check, no outbound request)
  try {
    checks.claude = {
      ok: Boolean(process.env.ANTHROPIC_API_KEY),
      latency: 0,
    };
  } catch {
    checks.claude = { ok: false, latency: 0 };
  }

  // Supabase Storage reachability
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
      status: 200,
      headers: { "Cache-Control": "no-cache" },
    }
  );
}
