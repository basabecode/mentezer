type DebugPayload = Record<string, unknown>;

function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.includes("@")) {
      const [localPart, domain] = value.split("@");
      if (domain) {
        const visible = localPart.slice(0, 3);
        return `${visible}***@${domain}`;
      }
    }

    if (value.length > 120) {
      return `${value.slice(0, 117)}...`;
    }
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as DebugPayload).map(([key, nestedValue]) => [
        key,
        sanitize(nestedValue),
      ])
    );
  }

  return value;
}

export function authDebug(scope: string, payload: DebugPayload) {
  if (process.env.AUTH_DEBUG !== "true") return;

  console.log(
    `[AUTH_DEBUG:${scope}]`,
    JSON.stringify(sanitize(payload))
  );
}
