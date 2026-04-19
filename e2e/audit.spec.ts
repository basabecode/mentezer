import { test, expect, Page, ConsoleMessage, Response } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

type AuditFinding = {
  route: string;
  title: string;
  consoleErrors: string[];
  pageErrors: string[];
  httpErrors: Array<{ url: string; status: number }>;
  finalUrl: string;
  screenshot: string;
};

const SCREENSHOT_DIR = path.resolve(__dirname, "screenshots");
const REPORT_PATH = path.resolve(__dirname, "screenshots", "audit-report.json");

const PSY_EMAIL = "psicologo.test@example.invalid";
const PSY_PASSWORD = "[REDACTED_TEST_PASSWORD]";
const ADMIN_EMAIL = "admin.test@example.invalid";
const ADMIN_PASSWORD = "[REDACTED_TEST_PASSWORD]";

const PSY_ROUTES = [
  { path: "/dashboard",    name: "dashboard" },
  { path: "/patients",     name: "patients" },
  { path: "/sessions/new", name: "sessions-new" },
  { path: "/knowledge",    name: "knowledge" },
  { path: "/schedule",     name: "schedule" },
  { path: "/finance",      name: "finance" },
  { path: "/reports",      name: "reports" },
  { path: "/cases",        name: "cases" },
  { path: "/settings",     name: "settings" },
  { path: "/settings/privacy", name: "settings-privacy" },
];

const ADMIN_ROUTES = [
  { path: "/admin",           name: "admin-dashboard" },
  { path: "/admin/clients",   name: "admin-clients" },
  { path: "/admin/settings",  name: "admin-settings" },
];

const allFindings: AuditFinding[] = [];

function attachListeners(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const httpErrors: Array<{ url: string; status: number }> = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (err: Error) => {
    pageErrors.push(err.message);
  };
  const onResponse = (res: Response) => {
    const status = res.status();
    if (status >= 400 && status !== 401) {
      const url = res.url();
      // Ignore favicon and next hot reload errors
      if (url.includes("favicon") || url.includes("_next/webpack-hmr")) return;
      httpErrors.push({ url, status });
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return { consoleErrors, pageErrors, httpErrors };
}

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"], input[type="email"]').first().fill(email);
  await page.locator('input[name="password"], input[type="password"]').first().fill(password);
  await Promise.all([
    page.waitForURL(/(dashboard|admin|onboarding)/i, { timeout: 20_000 }).catch(() => null),
    page.locator('button[type="submit"]').first().click(),
  ]);
  // small settle time
  await page.waitForTimeout(800);
}

async function auditRoute(
  page: Page,
  route: { path: string; name: string },
  prefix: string,
) {
  const listeners = attachListeners(page);
  let finalUrl = "";
  let title = "";
  let errored = false;

  try {
    const response = await page.goto(route.path, {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
    });
    finalUrl = page.url();
    if (response && response.status() >= 400) {
      listeners.httpErrors.push({ url: route.path, status: response.status() });
    }
    await page.waitForTimeout(1400); // let async stuff render
    title = await page.title().catch(() => "");
  } catch (err) {
    errored = true;
    listeners.pageErrors.push(`Navigation error: ${(err as Error).message}`);
  }

  const screenshotPath = path.join(SCREENSHOT_DIR, `${prefix}-${route.name}.png`);
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch {
    // full page failed, try viewport only
    await page.screenshot({ path: screenshotPath }).catch(() => null);
  }

  allFindings.push({
    route: route.path,
    title,
    consoleErrors: listeners.consoleErrors.slice(0, 20),
    pageErrors: listeners.pageErrors.slice(0, 20),
    httpErrors: listeners.httpErrors.slice(0, 20),
    finalUrl,
    screenshot: path.relative(path.dirname(REPORT_PATH), screenshotPath).replace(/\\/g, "/"),
  });

  // cleanup listeners
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.removeAllListeners("response");

  if (errored) {
    console.warn(`[AUDIT] route ${route.path} failed to navigate cleanly`);
  }
}

test.describe.serial("Mentezer visual audit", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test("Psychologist portal", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, PSY_EMAIL, PSY_PASSWORD);
    // Login screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "psy-00-after-login.png"), fullPage: true }).catch(() => null);
    for (const r of PSY_ROUTES) {
      await auditRoute(page, r, "psy");
    }
    await context.close();
  });

  test("Admin portal", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "admin-00-after-login.png"), fullPage: true }).catch(() => null);
    for (const r of ADMIN_ROUTES) {
      await auditRoute(page, r, "admin");
    }
    await context.close();
  });

  test.afterAll(() => {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(allFindings, null, 2), "utf8");
    // Summary to stdout
    let routesWithIssues = 0;
    for (const f of allFindings) {
      const issues = f.consoleErrors.length + f.pageErrors.length + f.httpErrors.length;
      if (issues > 0) routesWithIssues++;
      console.log(
        `[AUDIT] ${f.route} -> console:${f.consoleErrors.length} page:${f.pageErrors.length} http:${f.httpErrors.length}`,
      );
    }
    console.log(`[AUDIT] ${allFindings.length} routes audited, ${routesWithIssues} with issues`);
    expect(allFindings.length).toBeGreaterThan(0);
  });
});
