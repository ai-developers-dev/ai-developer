// Pure mapper: AI Developer discovery row → CRM Starter wizard config.
// Mirrors the structure expected by the CRM Starter CLI at
// /Users/dougallen/Desktop/crm-starter/cli/src/prompts/runPrompts.ts.
//
// Output is JSON-serializable and ready to drop into a --config file.

import type { Doc } from "./_generated/dataModel";

type Discovery = Doc<"discoverySubmissions">;

// Mirror of /Users/dougallen/Desktop/crm-starter/cli/src/prompts/types.ts
// — keep these aligned with that file.

export type CrmIndustry = "hvac" | "plumbing" | "electrical" | "general";
export type CrmStack = "clerk-convex" | "better-auth-drizzle";
export type CrmRole =
  | "admin"
  | "dispatcher"
  | "technician"
  | "csr"
  | "sales"
  | "accountant";
export type CrmCommsChannel = "sms" | "email";

export interface CrmStarterConfig {
  projectName: string;
  industry: CrmIndustry;
  brandColor: string;
  landingPage: boolean;
  onlineBooking: boolean;
  stack: CrmStack;
  roles: CrmRole[];
  customers: boolean;
  jobs: boolean;
  estimatesInvoices: boolean;
  calendarDispatch: boolean;
  payments: boolean;
  comms: CrmCommsChannel[];
  reviews: boolean;
  reporting: boolean;
  industryExtras: string[];
  seed: boolean;
  initGit: boolean;
  install: boolean;
}

const INDUSTRY_DEFAULT_COLORS: Record<CrmIndustry, string> = {
  hvac: "#ea580c",
  plumbing: "#0ea5e9",
  electrical: "#eab308",
  general: "#6366f1",
};

function tradeToIndustry(trade: Discovery["primaryTrade"]): CrmIndustry {
  switch (trade) {
    case "electrician":
      return "electrical";
    case "plumber":
      return "plumbing";
    case "hvac":
      return "hvac";
    default:
      return "general";
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function rolesForSize(count: Discovery["employeeCount"]): CrmRole[] {
  // Always include admin. Roles compound as the shop grows.
  const r: CrmRole[] = ["admin"];
  if (count === "1") return r;
  // 2-5 → tech + csr
  r.push("technician", "csr");
  if (count === "2-5") return r;
  // 6-10 → +dispatcher
  r.push("dispatcher");
  if (count === "6-10") return r;
  // 11-20 → +sales
  r.push("sales");
  if (count === "11-20") return r;
  // 21-50, 50+ → +accountant
  r.push("accountant");
  return r;
}

export function discoveryToCrmStarterConfig(
  d: Discovery,
  opts: { projectName?: string; brandColor?: string } = {},
): CrmStarterConfig {
  const industry = tradeToIndustry(d.primaryTrade);
  const projectName =
    opts.projectName ?? `${slugify(d.businessName)}-crm`;

  // Landing page logic: include it whenever the prospect either doesn't
  // have a website at all, or has one with no online booking widget.
  const landingPage =
    d.hasWebsite === "no" ||
    (d.hasWebsite === "yes" && d.websiteHasOnlineBooking !== "yes");

  // Online booking only makes sense when we're shipping a landing page.
  const onlineBooking = landingPage;

  const integrations = d.requiredIntegrations ?? [];
  const automations = d.currentAutomations ?? [];

  const comms: CrmCommsChannel[] = [];
  if (
    integrations.includes("SMS reminders") ||
    d.missedCallHandling === "ai_receptionist" ||
    automations.includes("SMS automation")
  ) {
    comms.push("sms");
  }
  if (
    integrations.includes("Email marketing") ||
    automations.includes("Email automation (Mailchimp, Klaviyo, etc.)")
  ) {
    comms.push("email");
  }

  const REPORTING_THRESHOLDS = new Set(["6-10", "11-20", "21-50", "50+"]);
  const reporting = REPORTING_THRESHOLDS.has(d.employeeCount);

  // Calendar + dispatch ships in the Starter, so it's always on. (Pricing
  // engine only adds a line item when the shop is 6+ or multi-location,
  // but the module itself is always available in the build.)
  const calendarDispatch = true;

  const payments =
    integrations.includes("Stripe / Square (card payments)") ||
    d.techsQuoteOnSite !== "never";

  const reviews = d.collectsGoogleReviews !== "yes_routinely";

  return {
    projectName,
    industry,
    brandColor: opts.brandColor ?? INDUSTRY_DEFAULT_COLORS[industry],
    landingPage,
    onlineBooking,
    stack: "clerk-convex",
    roles: rolesForSize(d.employeeCount),
    customers: true,
    jobs: true,
    estimatesInvoices: true,
    calendarDispatch,
    payments,
    comms,
    reviews,
    reporting,
    industryExtras: [], // CRM Starter auto-includes industry extras
    seed: true,
    initGit: true,
    install: true,
  };
}
