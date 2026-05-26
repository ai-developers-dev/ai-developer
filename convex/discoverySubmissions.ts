import { v } from "convex/values";
import {
  mutation,
  query,
  internalAction,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";

// ===========================================================
// Validators (must match schema.ts)
// ===========================================================

const employeeCountV = v.union(
  v.literal("1"),
  v.literal("2-5"),
  v.literal("6-10"),
  v.literal("11-20"),
  v.literal("21-50"),
  v.literal("50+")
);

const primaryTradeV = v.union(
  v.literal("electrician"),
  v.literal("plumber"),
  v.literal("hvac"),
  v.literal("multi-trade"),
  v.literal("other")
);

const topBottleneckV = v.union(
  v.literal("scheduling"),
  v.literal("quoting"),
  v.literal("payment"),
  v.literal("job_tracking"),
  v.literal("crew_coordination"),
  v.literal("customer_communication"),
  v.literal("other")
);

const locationCountV = v.union(
  v.literal("single"),
  v.literal("2-3"),
  v.literal("4+"),
  v.literal("multi-state")
);

const serviceRadiusMilesV = v.union(
  v.literal("under_25"),
  v.literal("25-50"),
  v.literal("50-100"),
  v.literal("100+")
);

const techsQuoteOnSiteV = v.union(
  v.literal("always"),
  v.literal("sometimes"),
  v.literal("never")
);

const changeOrderFrequencyV = v.union(
  v.literal("rarely"),
  v.literal("sometimes_30"),
  v.literal("often_50")
);

const recurringContractsV = v.union(
  v.literal("none"),
  v.literal("under_20"),
  v.literal("20-50"),
  v.literal("over_50")
);

const collectsGoogleReviewsV = v.union(
  v.literal("yes_routinely"),
  v.literal("occasionally"),
  v.literal("no")
);

const missedCallHandlingV = v.union(
  v.literal("voicemail"),
  v.literal("answering_service"),
  v.literal("ai_receptionist"),
  v.literal("callback_later"),
  v.literal("unanswered"),
  v.literal("other")
);

const afterHoursHandlingV = v.union(
  v.literal("staff_on_call"),
  v.literal("answering_service"),
  v.literal("ai_agent"),
  v.literal("voicemail"),
  v.literal("no_after_hours"),
  v.literal("other")
);

const desiredLaunchV = v.union(
  v.literal("asap"),
  v.literal("3_months"),
  v.literal("3-6_months"),
  v.literal("6-12_months"),
  v.literal("flexible")
);

const statusV = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("quoted"),
  v.literal("converted"),
  v.literal("archived")
);

// ===========================================================
// Submit (public)
// ===========================================================

export const submit = mutation({
  args: {
    businessName: v.string(),
    businessAddress: v.optional(v.string()),
    hasWebsite: v.union(v.literal("yes"), v.literal("no")),
    businessPhone: v.string(),
    businessEmail: v.string(),
    employeeCount: employeeCountV,
    primaryTrade: primaryTradeV,
    servicesOffered: v.array(v.string()),
    currentCrm: v.string(),
    otherTools: v.array(v.string()),
    leadSources: v.array(v.string()),
    topBottleneck: topBottleneckV,
    locationCount: locationCountV,
    serviceRadiusMiles: serviceRadiusMilesV,
    techsQuoteOnSite: techsQuoteOnSiteV,
    changeOrderFrequency: changeOrderFrequencyV,
    recurringContracts: recurringContractsV,
    collectsGoogleReviews: collectsGoogleReviewsV,
    websiteHasChat: v.optional(v.union(v.literal("yes"), v.literal("no"))),
    websiteHasOnlineBooking: v.optional(
      v.union(v.literal("yes"), v.literal("no"))
    ),
    missedCallHandling: missedCallHandlingV,
    afterHoursHandling: afterHoursHandlingV,
    accountingSystem: v.string(),
    requiredIntegrations: v.array(v.string()),
    currentAutomations: v.array(v.string()),
    desiredLaunch: desiredLaunchV,
    successDefinition: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("discoverySubmissions", {
      ...args,
      status: "new",
    });
    // Notify admin via Resend in the background.
    await ctx.scheduler.runAfter(
      0,
      internal.discoverySubmissions.notify,
      { id }
    );
    return id;
  },
});

// ===========================================================
// Admin queries / mutations
// ===========================================================

export const list = query({
  args: { status: v.optional(statusV) },
  handler: async (ctx, { status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user || user.role !== "admin") return [];

    if (status) {
      return await ctx.db
        .query("discoverySubmissions")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("discoverySubmissions")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("discoverySubmissions") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") return null;
    return await ctx.db.get(id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("discoverySubmissions"),
    status: statusV,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.notes = notes;
    await ctx.db.patch(id, update);
  },
});

export const remove = mutation({
  args: { id: v.id("discoverySubmissions") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") throw new Error("Not authorized");
    await ctx.db.delete(id);
  },
});

// ===========================================================
// Internal: notify admin via Resend
// ===========================================================

export const _getForNotify = internalQuery({
  args: { id: v.id("discoverySubmissions") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

const PRETTY_LABELS: Record<string, Record<string, string>> = {
  employeeCount: {
    "1": "1 (solo)",
    "2-5": "2-5",
    "6-10": "6-10",
    "11-20": "11-20",
    "21-50": "21-50",
    "50+": "50+",
  },
  primaryTrade: {
    electrician: "Electrician",
    plumber: "Plumber",
    hvac: "HVAC",
    "multi-trade": "Multi-trade",
    other: "Other",
  },
  topBottleneck: {
    scheduling: "Scheduling / dispatch",
    quoting: "Quoting & estimating",
    payment: "Payment collection",
    job_tracking: "Job tracking & follow-up",
    crew_coordination: "Crew coordination",
    customer_communication: "Customer communication",
    other: "Other",
  },
  locationCount: {
    single: "Single location",
    "2-3": "2-3 areas",
    "4+": "4+ areas",
    "multi-state": "Multi-state",
  },
  serviceRadiusMiles: {
    under_25: "Under 25 miles",
    "25-50": "25-50 miles",
    "50-100": "50-100 miles",
    "100+": "100+ miles",
  },
  techsQuoteOnSite: {
    always: "Always",
    sometimes: "Sometimes",
    never: "Never",
  },
  changeOrderFrequency: {
    rarely: "Rarely",
    sometimes_30: "Sometimes (~30%)",
    often_50: "Often (50%+)",
  },
  recurringContracts: {
    none: "None",
    under_20: "<20% of revenue",
    "20-50": "20-50% of revenue",
    over_50: ">50% of revenue",
  },
  collectsGoogleReviews: {
    yes_routinely: "Yes — routinely",
    occasionally: "Sometimes",
    no: "No",
  },
  missedCallHandling: {
    voicemail: "Goes to voicemail",
    answering_service: "Answering service",
    ai_receptionist: "AI receptionist",
    callback_later: "We call back later",
    unanswered: "Calls go unanswered",
    other: "Other",
  },
  afterHoursHandling: {
    staff_on_call: "Staff on-call rotation",
    answering_service: "Answering service",
    ai_agent: "AI agent",
    voicemail: "Voicemail only",
    no_after_hours: "No after-hours service",
    other: "Other",
  },
  desiredLaunch: {
    asap: "ASAP",
    "3_months": "Within 3 months",
    "3-6_months": "3-6 months",
    "6-12_months": "6-12 months",
    flexible: "Flexible",
  },
};

function label(field: string, value: string): string {
  return PRETTY_LABELS[field]?.[value] ?? value;
}

export const notify = internalAction({
  args: { id: v.id("discoverySubmissions") },
  handler: async (ctx, { id }) => {
    const sub: any = await ctx.runQuery(
      internal.discoverySubmissions._getForNotify,
      { id }
    );
    if (!sub) return;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set; skipping discovery email.");
      return;
    }

    const row = (lbl: string, val: string) => `
      <tr>
        <td style="padding:6px 12px;color:#9CA3AF;font-size:12px;width:200px;border-bottom:1px solid #F3F4F6;">${lbl}</td>
        <td style="padding:6px 12px;color:#333123;font-size:13px;font-weight:500;border-bottom:1px solid #F3F4F6;">${val}</td>
      </tr>`;

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#1c1110;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:720px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);padding:32px 40px;">
        <h1 style="color:white;font-size:22px;margin:0;font-weight:700;">New Discovery Submission</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;">
          ${sub.businessName} · ${label("primaryTrade", sub.primaryTrade)} · ${(sub.employeeCount ?? "?")} employees
        </p>
      </div>
      <div style="padding:28px 40px;">
        <h3 style="color:#333123;font-size:15px;margin:0 0 8px;font-weight:600;border-bottom:2px solid #E5E7EB;padding-bottom:6px;">Business</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row("Business name", sub.businessName)}
          ${row("Has website?", sub.hasWebsite === "yes" ? "Yes" : "No")}
          ${sub.hasWebsite === "yes" ? row("Website has chat?", sub.websiteHasChat === "yes" ? "Yes" : sub.websiteHasChat === "no" ? "No" : "—") : ""}
          ${sub.hasWebsite === "yes" ? row("Online appointment booking?", sub.websiteHasOnlineBooking === "yes" ? "Yes" : sub.websiteHasOnlineBooking === "no" ? "No" : "—") : ""}
          ${row("Address", sub.businessAddress || "—")}
          ${row("Phone", sub.businessPhone)}
          ${row("Email", sub.businessEmail)}
          ${row("Employees", label("employeeCount", sub.employeeCount))}
        </table>

        <h3 style="color:#333123;font-size:15px;margin:0 0 8px;font-weight:600;border-bottom:2px solid #E5E7EB;padding-bottom:6px;">What they do</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row("Primary trade", label("primaryTrade", sub.primaryTrade))}
          ${row("Services offered", (sub.servicesOffered || []).join(", ") || "—")}
          ${row("Current CRM", sub.currentCrm || "—")}
          ${row("Other tools", (sub.otherTools || []).join(", ") || "—")}
          ${row("Lead sources", (sub.leadSources || []).join(", ") || "—")}
          ${row("Top bottleneck", label("topBottleneck", sub.topBottleneck))}
        </table>

        <h3 style="color:#333123;font-size:15px;margin:0 0 8px;font-weight:600;border-bottom:2px solid #E5E7EB;padding-bottom:6px;">Operations</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row("Locations", label("locationCount", sub.locationCount))}
          ${row("Service radius", label("serviceRadiusMiles", sub.serviceRadiusMiles))}
          ${row("On-site quoting", label("techsQuoteOnSite", sub.techsQuoteOnSite))}
          ${row("Change-order freq", label("changeOrderFrequency", sub.changeOrderFrequency))}
          ${row("Recurring contracts", label("recurringContracts", sub.recurringContracts))}
          ${row("Collects Google reviews", label("collectsGoogleReviews", sub.collectsGoogleReviews))}
          ${row("Missed-call handling", label("missedCallHandling", sub.missedCallHandling))}
          ${row("After-hours handling", label("afterHoursHandling", sub.afterHoursHandling))}
        </table>

        <h3 style="color:#333123;font-size:15px;margin:0 0 8px;font-weight:600;border-bottom:2px solid #E5E7EB;padding-bottom:6px;">Tech & project</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row("Accounting system", sub.accountingSystem || "—")}
          ${row("Required integrations", (sub.requiredIntegrations || []).join(", ") || "—")}
          ${row("Current AI / automations", (sub.currentAutomations || []).join(", ") || "—")}
          ${row("Desired launch", label("desiredLaunch", sub.desiredLaunch))}
          ${row("Source", sub.source || "direct")}
        </table>

        ${
          sub.successDefinition
            ? `<h3 style="color:#333123;font-size:15px;margin:0 0 8px;font-weight:600;border-bottom:2px solid #E5E7EB;padding-bottom:6px;">Success in 6 months</h3>
               <p style="color:#374151;font-size:14px;line-height:1.6;background:#FAFAFA;border-radius:8px;padding:14px 16px;border-left:3px solid #d4cebb;">${sub.successDefinition}</p>`
            : ""
        }
      </div>
      <div style="background:#FAFAFA;border-top:1px solid #F3F4F6;padding:20px 40px;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;margin:0;">Review in the dashboard at https://aideveloper.dev/dashboard/discoveries</p>
      </div>
    </div>
  </div>
</body></html>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AI Developer <onboarding@resend.dev>",
          to: "doug@aideveloper.dev",
          subject: `Discovery: ${sub.businessName} (${label("primaryTrade", sub.primaryTrade)} · ${sub.employeeCount} employees)`,
          html,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Resend send failed:", res.status, text);
      }
    } catch (err) {
      console.error("Resend fetch threw:", err);
    }
  },
});
