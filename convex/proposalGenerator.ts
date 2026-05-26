// Pure helper that turns a discovery submission into a draft proposal:
// title, description, line-item breakdown, total.
//
// Tunable constants live at the top so non-engineers (or a future "pricing
// settings" admin page) can tweak the model without touching logic.

import type { Doc } from "./_generated/dataModel";
import { DEFAULT_PRICING, type PricingConfig } from "./pricingSettings";

type Discovery = Doc<"discoverySubmissions">;

export interface GeneratedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface GeneratedProposal {
  title: string;
  description: string;
  service: string;
  lineItems: GeneratedLineItem[];
  totalAmount: number;
}

// Pricing values now live in the Convex `pricingSettings` table (admin-
// editable). DEFAULT_PRICING from pricingSettings.ts is the fallback
// when no row exists yet or callers don't pass a config.

// ============================================================
// Pretty labels (used in description prose)
// ============================================================

const TRADE_LABELS: Record<string, string> = {
  electrician: "electrical contractor",
  plumber: "plumbing business",
  hvac: "HVAC contractor",
  "multi-trade": "multi-trade home service business",
  other: "service business",
};

const EMPLOYEE_LABELS: Record<string, string> = {
  "1": "solo operator",
  "2-5": "2-5 person",
  "6-10": "6-10 person",
  "11-20": "11-20 person",
  "21-50": "21-50 person",
  "50+": "50+ person",
};

const LOCATION_LABELS: Record<string, string> = {
  single: "a single location",
  "2-3": "2-3 service areas",
  "4+": "4+ service areas",
  "multi-state": "multiple states",
};

const LAUNCH_LABELS: Record<string, string> = {
  asap: "the next 2-3 weeks (rush)",
  "3_months": "3 months",
  "3-6_months": "3-6 months",
  "6-12_months": "6-12 months",
  flexible: "a flexible timeline",
};

const BOTTLENECK_LABELS: Record<string, string> = {
  scheduling: "scheduling and dispatch",
  quoting: "quoting and estimating",
  payment: "payment collection",
  job_tracking: "job tracking and follow-up",
  crew_coordination: "crew coordination",
  customer_communication: "customer communication",
  other: "operational workflow",
};

// ============================================================
// Generator
// ============================================================

export function generateProposalFromDiscovery(
  d: Discovery,
  cfg: PricingConfig = DEFAULT_PRICING,
): GeneratedProposal {
  const items: GeneratedLineItem[] = [];
  const push = (description: string, unitPrice: number) => {
    if (unitPrice <= 0) return;
    items.push({ description, quantity: 1, unitPrice, total: unitPrice });
  };

  // Base
  push("Custom CRM platform — core build", cfg.basePrice);

  const scaleLookup = (
    list: { key: string; price: number }[],
    k: string,
  ) => list.find((r) => r.key === k)?.price ?? 0;

  // Scale by employees
  push(
    `Scale: ${EMPLOYEE_LABELS[d.employeeCount] ?? d.employeeCount} shop`,
    scaleLookup(cfg.employeeScale, d.employeeCount),
  );

  // Scale by locations
  push(
    `Multi-location workflows (${LOCATION_LABELS[d.locationCount] ?? d.locationCount})`,
    scaleLookup(cfg.locationScale, d.locationCount),
  );

  // Scale by service radius
  push(
    "Extended service-area routing & territory management",
    scaleLookup(cfg.radiusScale, d.serviceRadiusMiles),
  );

  // Trade complexity
  push(
    "Multi-trade workflow templates",
    scaleLookup(cfg.tradeScale, d.primaryTrade),
  );

  // On-site quoting
  if (d.techsQuoteOnSite && d.techsQuoteOnSite !== "never") {
    push(
      "On-site mobile quoting with deposit collection",
      cfg.onSiteQuotingPrice,
    );
  }

  // Recurring contracts engine
  if (d.recurringContracts && d.recurringContracts !== "none") {
    push(
      "Recurring maintenance contract engine (auto-schedule + auto-invoice)",
      cfg.recurringContractsPrice,
    );
  }

  // Photo documentation — baseline for every build
  push("Photo documentation & job timeline", cfg.photoDocsPrice);

  // Marketing landing page + online booking widget — if they don't have a
  // website OR their site doesn't have online booking.
  if (
    d.hasWebsite === "no" ||
    (d.hasWebsite === "yes" && d.websiteHasOnlineBooking !== "yes")
  ) {
    push(
      "Marketing landing page + online booking widget",
      cfg.landingPagePrice ?? 0,
    );
  }

  // Automated review request engine — unless they already do this religiously.
  if (d.collectsGoogleReviews !== "yes_routinely") {
    push(
      "Automated post-job review request engine",
      cfg.reviewsPrice ?? 0,
    );
  }

  // Reporting dashboard — only worth it once they have a few techs.
  const REPORTING_THRESHOLDS = new Set([
    "6-10",
    "11-20",
    "21-50",
    "50+",
  ])
  if (REPORTING_THRESHOLDS.has(d.employeeCount)) {
    push(
      "Reporting dashboard (KPIs, technician performance)",
      cfg.reportingPrice ?? 0,
    );
  }

  // Calendar + dispatch board — needed for crews > 5 or multi-location.
  if (
    REPORTING_THRESHOLDS.has(d.employeeCount) ||
    d.locationCount !== "single"
  ) {
    push(
      "Calendar + dispatch board (drag-and-drop tech assignment)",
      cfg.calendarDispatchPrice ?? 0,
    );
  }

  // Per-integration line items
  const integrationMap = new Map(
    cfg.integrations.map((i) => [
      i.key,
      { label: i.label, price: i.price, customBuild: i.customBuild ?? false },
    ]),
  );
  let hasCustomBuildLine = false;
  for (const integration of d.requiredIntegrations || []) {
    const entry = integrationMap.get(integration);
    if (entry) {
      const label = entry.customBuild
        ? `${entry.label} — custom build`
        : entry.label;
      if (entry.customBuild) hasCustomBuildLine = true;
      push(label, entry.price);
    }
  }

  // Cross-sell: Voice AI receptionist
  const usesVoiceAI =
    d.missedCallHandling === "ai_receptionist" ||
    d.afterHoursHandling === "ai_agent";
  if (usesVoiceAI) {
    push(
      "Voice AI receptionist (24/7 call handling, booking, triage)",
      cfg.voiceAiCrossSellPrice,
    );
  }

  // Cross-sell: Automations bundle if they have nothing today
  const nothingAutomated =
    !d.currentAutomations ||
    d.currentAutomations.length === 0 ||
    d.currentAutomations.every((a) => a === "Nothing yet");
  if (nothingAutomated) {
    push(
      "Automations bundle (review requests, lead routing, follow-ups)",
      cfg.automationsCrossSellPrice,
    );
  }

  // Subtotal + rush
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  if (d.desiredLaunch === "asap") {
    const rushFee = Math.round(subtotal * cfg.rushFeePct);
    const pctLabel = Math.round(cfg.rushFeePct * 100);
    push(
      `Rush delivery (ASAP timeline — ${pctLabel}% expedite fee)`,
      rushFee,
    );
  }

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  // Title
  const title = `Custom CRM for ${d.businessName}`;

  // Description
  const description = buildDescription(d, { hasCustomBuildLine });

  return {
    title,
    description,
    service: "Custom CRM",
    lineItems: items,
    totalAmount,
  };
}

// ============================================================
// Description template
// ============================================================

function buildDescription(
  d: Discovery,
  opts: { hasCustomBuildLine?: boolean } = {},
): string {
  const tradeLabel = TRADE_LABELS[d.primaryTrade] ?? "home service business";
  const empLabel =
    EMPLOYEE_LABELS[d.employeeCount] ?? `${d.employeeCount} employee`;
  const locLabel = LOCATION_LABELS[d.locationCount] ?? "their service area";
  const launchLabel =
    LAUNCH_LABELS[d.desiredLaunch] ?? "the agreed timeline";

  const bottlenecks = bottleneckList(d);
  const bottleneckLine = bottlenecks.length
    ? `directly addresses the bottleneck${bottlenecks.length === 1 ? "" : "s"} you flagged: **${bottlenecks.join(", ")}**.`
    : "addresses the workflow gaps captured in your discovery.";

  const services = (d.servicesOffered || []).join(", ");
  const integrations = (d.requiredIntegrations || []).join(", ");

  const currentToolLine = d.currentCrm && d.currentCrm !== "None"
    ? `The build replaces your current **${d.currentCrm}** workflow and `
    : "The build "

  const sections: string[] = []

  sections.push(
    `This proposal covers a custom CRM for **${d.businessName}**, a ${empLabel} ${tradeLabel} operating from ${locLabel}. ${currentToolLine}${bottleneckLine}`,
  );

  if (services) {
    sections.push(
      `**Built for the work you actually do.** Service workflows tailored to: ${services}.`,
    );
  }

  const keyFeatures = featureBullets(d);
  if (keyFeatures.length) {
    sections.push(
      `**Key features included:**\n${keyFeatures.map((f) => `• ${f}`).join("\n")}`,
    );
  }

  if (integrations) {
    sections.push(`**Integrations:** ${integrations}.`);
  }

  sections.push(
    `**Timeline.** Built and live within ${launchLabel}.`,
  );

  sections.push(
    `**You own it forever.** No per-seat licensing, no monthly platform fees beyond hosting (typically $50-100/month). The code, the data, the integrations — all yours, for the life of your business.`,
  );

  if (opts.hasCustomBuildLine) {
    sections.push(
      `_Note: items marked **custom build** require additional development time beyond our standard CRM template. Timeline and scope are scoped during kickoff._`,
    );
  }

  return sections.join("\n\n");
}

function bottleneckList(d: Discovery): string[] {
  const raw = d.topBottlenecks?.length
    ? d.topBottlenecks
    : d.topBottleneck
      ? [d.topBottleneck]
      : [];
  return raw.map((b) => BOTTLENECK_LABELS[b] ?? b);
}

function featureBullets(d: Discovery): string[] {
  const out: string[] = [];
  if (d.techsQuoteOnSite && d.techsQuoteOnSite !== "never") {
    out.push("On-site mobile quoting with signature & deposit collection");
  }
  if (d.recurringContracts && d.recurringContracts !== "none") {
    out.push("Recurring maintenance contract engine — auto-schedule and auto-invoice");
  }
  out.push("Photo documentation tied to every job + searchable history");
  if (d.missedCallHandling === "ai_receptionist") {
    out.push("AI receptionist for inbound calls during business hours");
  }
  if (d.afterHoursHandling === "ai_agent") {
    out.push("AI after-hours / emergency call agent");
  }
  if (d.collectsGoogleReviews && d.collectsGoogleReviews !== "no") {
    out.push("Automated post-job Google review request");
  }
  if (d.hasWebsite === "yes" && d.websiteHasOnlineBooking !== "yes") {
    out.push("Online appointment booking widget for your website");
  }
  return out;
}
