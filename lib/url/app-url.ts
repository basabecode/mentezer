function normalizeBaseUrl(rawValue?: string | null): string {
  const value = rawValue?.trim();
  if (!value) return "";

  const withProtocol =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : value.includes("localhost")
        ? `http://${value}`
        : `https://${value}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getAppUrl(path = ""): string {
  const baseUrl =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeBaseUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000";

  if (!path) return baseUrl;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
