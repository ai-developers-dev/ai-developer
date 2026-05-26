// Pure helper that turns a discovery submission into a draft proposal:
// title, description, line-item breakdown, total.
//
// Tunable constants live at the top so non-engineers (or a future "pricing
// settings" admin page) can tweak the model without touching logic.

import type { Doc } from "./_generated/dataModel";

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

// ============================================================
// Pricing constants (USD)
// ============================================================

export const BASE_PRICE = 15_000;

const EMPLOYEE_SCALE: Record<string, number> = {
  "1": 0,
  "2-5": 0,
  "6-10": 3_000,
  "11-20": 6_000,
  "21-50": 10_000,
  "50+": 15_000,
};

const LOCATION_SCALE: Record<string, number> = {
  single: 0,
  "2-3": 2_000,
  "4+": 4_000,
  "multi-state": 6_000,
};

const RADIUS_SCALE: Record<string, number> = {
  under_25: 0,
  "25-50": 0,
  "50-100": 500,
  "100+": 1_500,
};

const TRADE_SCALE: Record<string, number> = {
  electrician: 0,
  plumber: 0,
  hvac: 0,
  "multi-trade": 3_000,
  other: 2_000,
};

const INTEGRATION_PRICES: Record<string, { label: string; price: number }> = {
  QuickBooks: {
    label: "QuickBooks Online integration",
    price: 2_500,
  },
  "Stripe / Square (card payments)": {
    label: "Stripe / Square card processing",
    price: 1_000,
  },
  "ACH payments": { label: "ACH payments", price: 1_500 },
  "Supplier catalog": { label: "Supplier catalog integration", price: 3_000 },
  "Google Maps routing": { label: "Google Maps routing & ETAs", price: 1_500 },
  "SMS reminders": { label: "SMS reminders & notifications", price: 1_500 },
  "Email marketing": { label: "Email marketing integration", price: 1_500 },
  "Calendar sync (Google/Outlook)": {
    label: "Calendar sync (Google / Outlook)",
    price: 1_000,
  },
};

const ON_SITE_QUOTING_PRICE = 2_000;
const RECURRING_CONTRACTS_PRICE = 3_000;
const PHOTO_DOCS_PRICE = 1_000;
const VOICE_AI_CROSS_SELL_PRICE = 8_000;
const AUTOMATIONS_CROSS_SELL_PRICE = 3_000;
const RUSH_FEE_PCT = 0.2;

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

export function generateProposalFromDiscovery(d: Discovery): GeneratedProposal {
  const items: GeneratedLineItem[] = [];
  const push = (description: string, unitPrice: number) => {
    if (unitPrice <= 0) return;
    items.push({ description, quantity: 1, unitPrice, total: unitPrice });
  };

  // Base
  push("Custom CRM platform — core build", BASE_PRICE);

  // Scale by employees
  const empScale = EMPLOYEE_SCALE[d.employeeCount] ?? 0;
  push(`Scale: ${EMPLOYEE_LABELS[d.employeeCount] ?? d.employeeCount} shop`, empScale);

  // Scale by locations
  const locScale = LOCATION_SCALE[d.locationCount] ?? 0;
  push(
    `Multi-location workflows (${LOCATION_LABELS[d.locationCount] ?? d.locationCount})`,
    locScale,
  );

  // Scale by service radius
  push(
    "Extended service-area routing & territory management",
    RADIUS_SCALE[d.serviceRadiusMiles] ?? 0,
  );

  // Trade complexity
  push(
    "Multi-trade workflow templates",
    TRADE_SCALE[d.primaryTrade] ?? 0,
  );

  // On-site quoting
  if (d.techsQuoteOnSite && d.techsQuoteOnSite !== "never") {
    push(
      "On-site mobile quoting with deposit collection",
      ON_SITE_QUOTING_PRICE,
    );
  }

  // Recurring contracts engine
  if (d.recurringContracts && d.recurringContracts !== "none") {
    push(
      "Recurring maintenance contract engine (auto-schedule + auto-invoice)",
      RECURRING_CONTRACTS_PRICE,
    );
  }

  // Photo documentation — baseline for every build
  push("Photo documentation & job timeline", PHOTO_DOCS_PRICE);

  // Per-integration line items
  for (const integration of d.requiredIntegrations || []) {
    const entry = INTEGRATION_PRICES[integration];
    if (entry) push(entry.label, entry.price);
  }

  // Cross-sell: Voice AI receptionist
  const usesVoiceAI =
    d.missedCallHandling === "ai_receptionist" ||
    d.afterHoursHandling === "ai_agent";
  if (usesVoiceAI) {
    push(
      "Voice AI receptionist (24/7 call handling, booking, triage)",
      VOICE_AI_CROSS_SELL_PRICE,
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
      AUTOMATIONS_CROSS_SELL_PRICE,
    );
  }

  // Subtotal + rush
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  if (d.desiredLaunch === "asap") {
    const rushFee = Math.round(subtotal * RUSH_FEE_PCT);
    push("Rush delivery (ASAP timeline — 20% expedite fee)", rushFee);
  }

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  // Title
  const title = `Custom CRM for ${d.businessName}`;

  // Description
  const description = buildDescription(d);

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

function buildDescription(d: Discovery): string {
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
