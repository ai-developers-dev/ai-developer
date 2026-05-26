import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { discoveryToCrmStarterConfig } from "./crmStarterMapper";

// ============================================================
// Validators
// ============================================================

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("viewed"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("expired")
);

const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  total: v.number(),
});

const stageLiteral = v.union(
  v.literal("lead"),
  v.literal("proposal"),
  v.literal("review"),
  v.literal("contracted"),
  v.literal("in_progress"),
  v.literal("completed")
);

const triggerValidator = v.union(
  v.object({ type: v.literal("on_acceptance") }),
  v.object({
    type: v.literal("net_days_after_previous"),
    days: v.number(),
  }),
  v.object({ type: v.literal("on_completion") }),
  v.object({ type: v.literal("on_stage"), stage: stageLiteral })
);

// Frontend submits a slimmer shape; backend fills id/order/status.
const installmentInputValidator = v.object({
  label: v.string(),
  percent: v.number(),
  trigger: triggerValidator,
});

// ============================================================
// Helpers
// ============================================================

function validatePercentSum(items: { percent: number }[]) {
  if (items.length === 0) {
    throw new Error("At least one installment is required.");
  }
  const sum = items.reduce((s, i) => s + i.percent, 0);
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error(
      `Installment percentages must sum to 100% (got ${sum.toFixed(2)}%).`
    );
  }
}

export function computeInstallmentAmounts(
  totalAmount: number,
  percents: number[]
): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const amounts: number[] = [];
  let remaining = totalCents;
  for (let i = 0; i < percents.length; i++) {
    if (i === percents.length - 1) {
      amounts.push(remaining / 100);
    } else {
      const rowCents = Math.floor((totalCents * percents[i]) / 100);
      amounts.push(rowCents / 100);
      remaining -= rowCents;
    }
  }
  return amounts;
}

function defaultInstallments(): Array<{
  id: string;
  label: string;
  percent: number;
  order: number;
  trigger: { type: "on_acceptance" };
  status: "pending";
}> {
  return [
    {
      id: crypto.randomUUID(),
      label: "Full payment",
      percent: 100,
      order: 0,
      trigger: { type: "on_acceptance" as const },
      status: "pending" as const,
    },
  ];
}

function buildInstallments(
  input: Array<{ label: string; percent: number; trigger: any }> | undefined
) {
  if (!input || input.length === 0) return defaultInstallments();
  validatePercentSum(input);
  return input.map((row, idx) => ({
    id: crypto.randomUUID(),
    label: row.label,
    percent: row.percent,
    order: idx,
    trigger: row.trigger,
    status: "pending" as const,
  }));
}

// ============================================================
// Queries
// ============================================================

export const list = query({
  args: { status: v.optional(statusValidator) },
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

    let proposals;
    if (status) {
      proposals = await ctx.db
        .query("proposals")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      proposals = await ctx.db.query("proposals").order("desc").collect();
    }

    return await Promise.all(
      proposals.map(async (proposal) => {
        const client = await ctx.db.get(proposal.clientId);
        const project = proposal.projectId
          ? await ctx.db.get(proposal.projectId)
          : null;
        return { ...proposal, client, project };
      })
    );
  },
});

export const getById = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const proposal = await ctx.db.get(id);
    if (!proposal) return null;

    const client = await ctx.db.get(proposal.clientId);
    const project = proposal.projectId
      ? await ctx.db.get(proposal.projectId)
      : null;

    return { ...proposal, client, project };
  },
});

export const getByClient = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user) return [];

    const client = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("contactEmail", user.email))
      .unique();

    if (!client) return [];

    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .order("desc")
      .collect();

    return await Promise.all(
      proposals.map(async (proposal) => {
        const project = proposal.projectId
          ? await ctx.db.get(proposal.projectId)
          : null;
        return { ...proposal, project };
      })
    );
  },
});

export const getPublic = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const proposal = await ctx.db.get(id);
    if (!proposal) return null;
    const client = await ctx.db.get(proposal.clientId);
    return {
      _id: proposal._id,
      title: proposal.title,
      description: proposal.description,
      lineItems: proposal.lineItems,
      totalAmount: proposal.totalAmount,
      status: proposal.status,
      paidAt: proposal.paidAt,
      validUntil: proposal.validUntil,
      clientName: client?.name || client?.businessName,
      clientEmail: client?.contactEmail,
      installments: proposal.installments,
      // Legacy fields retained for any in-flight pre-migration clients
      paymentMode: proposal.paymentMode,
      firstPaymentAmount: proposal.firstPaymentAmount,
      secondPaymentAmount: proposal.secondPaymentAmount,
      firstPaymentStatus: proposal.firstPaymentStatus,
      secondPaymentStatus: proposal.secondPaymentStatus,
      firstPaidAt: proposal.firstPaidAt,
      secondPaidAt: proposal.secondPaidAt,
      secondInvoiceSentAt: proposal.secondInvoiceSentAt,
    };
  },
});

// ============================================================
// Create / Update / Delete
// ============================================================

export const create = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    service: v.optional(v.string()),
    lineItems: v.array(lineItemValidator),
    totalAmount: v.number(),
    validUntil: v.optional(v.number()),
    installments: v.optional(v.array(installmentInputValidator)),
    // Legacy: accept paymentMode for back-compat; converted to installments.
    paymentMode: v.optional(v.union(v.literal("full"), v.literal("split"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    let projectId = args.projectId;
    if (!projectId) {
      projectId = await ctx.db.insert("projects", {
        clientId: args.clientId,
        title: args.title,
        service: args.service || "General",
        stage: "proposal",
        budget: args.totalAmount,
      });
    }

    // Resolve installments: explicit > legacy paymentMode > default full.
    let installments;
    if (args.installments && args.installments.length > 0) {
      installments = buildInstallments(args.installments);
    } else if (args.paymentMode === "split") {
      installments = buildInstallments([
        { label: "Deposit", percent: 50, trigger: { type: "on_acceptance" } },
        { label: "Final", percent: 50, trigger: { type: "on_completion" } },
      ]);
    } else {
      installments = defaultInstallments();
    }

    const { paymentMode: _ignored, installments: _ignoredInst, ...rest } = args;

    return await ctx.db.insert("proposals", {
      ...rest,
      projectId,
      status: "draft",
      installments,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("proposals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    service: v.optional(v.string()),
    lineItems: v.optional(v.array(lineItemValidator)),
    totalAmount: v.optional(v.number()),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
  },
});

// ============================================================
// Discovery → CRM Starter config (for the "Provision CRM" button)
// ============================================================

export const getCrmStarterConfig = query({
  args: { id: v.id("proposals") },
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

    const proposal = await ctx.db.get(id);
    if (!proposal) return null;

    // Find the most recent discovery for this client by matching email.
    // (We don't store discoveryId directly on the proposal; clientId →
    // contactEmail → discoverySubmissions.businessEmail.)
    const client = await ctx.db.get(proposal.clientId);
    if (!client) return null;

    const discoveries = await ctx.db
      .query("discoverySubmissions")
      .collect();
    const discovery = discoveries
      .filter((d) => d.businessEmail === client.contactEmail)
      .sort((a, b) => b._creationTime - a._creationTime)[0];

    if (!discovery) return null;
    return discoveryToCrmStarterConfig(discovery);
  },
});

export const remove = mutation({
  args: { id: v.id("proposals") },
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

    // Cancel any future scheduled installment-invoice jobs for this proposal.
    const proposal = await ctx.db.get(id);
    if (proposal?.installments) {
      for (const row of proposal.installments) {
        if (row.scheduledJobId) {
          try {
            await ctx.scheduler.cancel(row.scheduledJobId);
          } catch {
            // ignore; job may have already run
          }
        }
      }
    }

    await ctx.db.delete(id);
  },
});

// ============================================================
// Schedule editing
// ============================================================

export const replaceSchedule = mutation({
  args: {
    id: v.id("proposals"),
    installments: v.array(installmentInputValidator),
  },
  handler: async (ctx, { id, installments }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const proposal = await ctx.db.get(id);
    if (!proposal) throw new Error("Proposal not found");

    if (proposal.installments) {
      const hasLockedRow = proposal.installments.some(
        (r) => r.status !== "pending"
      );
      if (hasLockedRow) {
        throw new Error(
          "Schedule is locked once any installment has been invoiced or paid."
        );
      }
      // Cancel any orphaned scheduled jobs (shouldn't exist on pending rows but be safe)
      for (const row of proposal.installments) {
        if (row.scheduledJobId) {
          try {
            await ctx.scheduler.cancel(row.scheduledJobId);
          } catch {
            // ignore
          }
        }
      }
    }

    await ctx.db.patch(id, { installments: buildInstallments(installments) });
  },
});

// ============================================================
// Status transitions
// ============================================================

export const markSent = mutation({
  args: { id: v.id("proposals") },
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

    const proposal = await ctx.db.get(id);
    if (!proposal) return;

    const patch: Record<string, unknown> = {
      status: "sent",
      sentAt: Date.now(),
    };

    // Flip the first on_acceptance row to invoiced — the proposal email IS its invoice.
    if (proposal.installments) {
      const next = [...proposal.installments].sort((a, b) => a.order - b.order);
      const firstPending = next.find((r) => r.status === "pending");
      if (firstPending && firstPending.trigger.type === "on_acceptance") {
        firstPending.status = "invoiced";
        firstPending.invoicedAt = Date.now();
        patch.installments = next;
      }
    }

    await ctx.db.patch(id, patch);
  },
});

export const markViewed = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const proposal = await ctx.db.get(id);
    if (proposal && proposal.status === "sent") {
      await ctx.db.patch(id, {
        status: "viewed",
        viewedAt: Date.now(),
      });

      if (proposal.projectId) {
        const project = await ctx.db.get(proposal.projectId);
        if (
          project &&
          (project.stage === "lead" || project.stage === "proposal")
        ) {
          await ctx.db.patch(proposal.projectId, { stage: "review" });
        }
      }
    }
  },
});

export const updateStatus = mutation({
  args: { id: v.id("proposals"), status: statusValidator },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

// Records the Stripe session id on a specific installment so the pay page
// can reconcile in-flight checkouts. Public (called from /pay route).
export const setInstallmentSessionId = mutation({
  args: {
    proposalId: v.id("proposals"),
    installmentId: v.string(),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, { proposalId, installmentId, stripeSessionId }) => {
    const proposal = await ctx.db.get(proposalId);
    if (!proposal?.installments) return;
    const updated = proposal.installments.map((r) =>
      r.id === installmentId ? { ...r, stripeSessionId } : r
    );
    await ctx.db.patch(proposalId, { installments: updated });
  },
});

// ============================================================
// Payment lifecycle (webhook → mutation → schedule next)
// ============================================================

export const markInstallmentPaid = internalMutation({
  args: {
    proposalId: v.id("proposals"),
    installmentId: v.string(),
    paymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, { proposalId, installmentId, paymentIntentId }) => {
    const proposal = await ctx.db.get(proposalId);
    if (!proposal?.installments) return;

    const sorted = [...proposal.installments].sort(
      (a, b) => a.order - b.order
    );
    const row = sorted.find((r) => r.id === installmentId);
    if (!row || row.status === "paid") return;

    const now = Date.now();
    row.status = "paid";
    row.paidAt = now;
    if (paymentIntentId) row.stripePaymentIntentId = paymentIntentId;

    const isFirstPaid = !sorted.some(
      (r) => r.status === "paid" && r.id !== installmentId
    );

    const patch: Record<string, unknown> = { installments: sorted };

    if (isFirstPaid) {
      patch.status = "accepted";
      patch.acceptedAt = now;
      patch.paidAt = now;
      if (paymentIntentId) patch.stripePaymentIntentId = paymentIntentId;

      if (proposal.projectId) {
        const project = await ctx.db.get(proposal.projectId);
        if (
          project &&
          (project.stage === "lead" || project.stage === "proposal")
        ) {
          await ctx.db.patch(proposal.projectId, { stage: "contracted" });
        }
      }
    }

    await ctx.db.patch(proposalId, patch);
    await ctx.scheduler.runAfter(
      0,
      internal.proposals.advanceSchedule,
      { proposalId }
    );
  },
});

/**
 * Walk installments in order; for the first pending row decide what to do:
 *  - on_acceptance: only fires once proposal is sent (handled by markSent)
 *  - net_days_after_previous: schedule the invoice action at previousPaidAt+days
 *  - on_completion / on_stage: wait for project stage transition
 * Stops after first row processed.
 */
export const advanceSchedule = internalMutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, { proposalId }) => {
    const proposal = await ctx.db.get(proposalId);
    if (!proposal?.installments) return;

    const sorted = [...proposal.installments].sort(
      (a, b) => a.order - b.order
    );
    const next = sorted.find((r) => r.status === "pending");
    if (!next) return;

    if (next.trigger.type === "on_acceptance") {
      // Becomes invoiced on markSent; nothing to do here.
      return;
    }

    if (next.trigger.type === "net_days_after_previous") {
      const prev = sorted.find((r) => r.order === next.order - 1);
      if (!prev || prev.status !== "paid" || prev.paidAt === undefined) {
        // Waiting for prior row to be paid.
        return;
      }
      const dueAt = prev.paidAt + next.trigger.days * 86_400_000;
      const delay = Math.max(0, dueAt - Date.now());
      const jobId = await ctx.scheduler.runAfter(
        delay,
        internal.proposals.sendInstallmentInvoice,
        { proposalId, installmentId: next.id }
      );
      // Stamp the row with the scheduled job id + due date.
      const updated = sorted.map((r) =>
        r.id === next.id ? { ...r, scheduledJobId: jobId, dueAt } : r
      );
      await ctx.db.patch(proposalId, { installments: updated });
      return;
    }

    if (next.trigger.type === "on_completion") {
      const project = proposal.projectId
        ? await ctx.db.get(proposal.projectId)
        : null;
      if (project?.stage === "completed") {
        await ctx.scheduler.runAfter(
          0,
          internal.proposals.sendInstallmentInvoice,
          { proposalId, installmentId: next.id }
        );
      }
      return;
    }

    if (next.trigger.type === "on_stage") {
      const project = proposal.projectId
        ? await ctx.db.get(proposal.projectId)
        : null;
      if (project?.stage === next.trigger.stage) {
        await ctx.scheduler.runAfter(
          0,
          internal.proposals.sendInstallmentInvoice,
          { proposalId, installmentId: next.id }
        );
      }
      return;
    }
  },
});

/**
 * Called by projects.updateStage when a project's stage changes. Fires any
 * pending on_completion/on_stage installments matching the new stage.
 */
export const onProjectStageChange = internalMutation({
  args: {
    projectId: v.id("projects"),
    stage: stageLiteral,
  },
  handler: async (ctx, { projectId, stage }) => {
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    for (const proposal of proposals) {
      if (!proposal.installments) continue;
      for (const row of proposal.installments) {
        if (row.status !== "pending") continue;
        const matchesCompletion =
          row.trigger.type === "on_completion" && stage === "completed";
        const matchesStage =
          row.trigger.type === "on_stage" && row.trigger.stage === stage;
        if (matchesCompletion || matchesStage) {
          await ctx.scheduler.runAfter(
            0,
            internal.proposals.sendInstallmentInvoice,
            { proposalId: proposal._id, installmentId: row.id }
          );
        }
      }
    }
  },
});

/**
 * Action: flips an installment to "invoiced" and emails the client with a
 * pay link. Safe to call multiple times — exits if already invoiced/paid.
 */
export const sendInstallmentInvoice = internalAction({
  args: {
    proposalId: v.id("proposals"),
    installmentId: v.string(),
  },
  handler: async (ctx, { proposalId, installmentId }) => {
    const ctxData = await ctx.runQuery(internal.proposals.getInstallmentContext, {
      proposalId,
      installmentId,
    });
    if (!ctxData) return;
    if (ctxData.row.status !== "pending") return;

    // Mark invoiced first so we don't double-send if email throws + scheduler retries.
    await ctx.runMutation(internal.proposals.markInstallmentInvoiced, {
      proposalId,
      installmentId,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "RESEND_API_KEY not set on Convex — installment row marked invoiced but no email sent."
      );
      return;
    }
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const payUrl = `${appUrl}/pay/${proposalId}`;

    const totalAmount = ctxData.proposal.totalAmount;
    const rows = ctxData.proposal.installments ?? [];
    const sortedRows = [...rows].sort((a, b) => a.order - b.order);
    const allPercents = sortedRows.map((r) => r.percent);
    const amounts = computeInstallmentAmounts(totalAmount, allPercents);
    const sortedIndex = sortedRows.findIndex((r) => r.id === installmentId);
    const amount = amounts[sortedIndex] ?? 0;
    const totalRows = allPercents.length;
    const positionLabel = `Payment ${sortedIndex + 1} of ${totalRows}`;

    const clientName = ctxData.client?.name || ctxData.client?.businessName || "there";
    const to = ctxData.client?.contactEmail;
    if (!to) {
      console.error("No client email; skipping installment invoice send.");
      return;
    }

    const fmt = (n: number) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const subject = `Invoice: ${ctxData.row.label} — ${ctxData.proposal.title}`;
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#1c1110;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);padding:36px 40px;text-align:center;">
        <h1 style="color:white;font-size:22px;margin:0;font-weight:700;">AI Developer</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;">${positionLabel}</p>
      </div>
      <div style="padding:36px 40px;">
        <p style="color:#374151;font-size:16px;margin:0 0 6px;">Hi ${clientName},</p>
        <p style="color:#6B7280;font-size:15px;margin:0 0 24px;">Your next installment is due for <strong>${ctxData.proposal.title}</strong>.</p>
        <div style="background:#FAFAFA;border:1px solid #F3F4F6;border-radius:10px;padding:20px;margin-bottom:24px;">
          <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">${ctxData.row.label}</p>
          <p style="color:#333123;font-size:28px;font-weight:800;margin:0;">$${fmt(amount)}</p>
          <p style="color:#9CA3AF;font-size:12px;margin:8px 0 0;">Project total: $${fmt(totalAmount)}</p>
        </div>
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="${payUrl}" style="display:inline-block;background:#d4cebb;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Pay $${fmt(amount)}</a>
        </div>
      </div>
      <div style="background:#FAFAFA;border-top:1px solid #F3F4F6;padding:20px 40px;text-align:center;">
        <p style="color:#9CA3AF;font-size:12px;margin:0;">AI Developer — Websites, Apps &amp; AI Solutions Built Faster</p>
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
          to,
          subject,
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

export const getInstallmentContext = internalQuery({
  args: {
    proposalId: v.id("proposals"),
    installmentId: v.string(),
  },
  handler: async (ctx, { proposalId, installmentId }) => {
    const proposal = await ctx.db.get(proposalId);
    if (!proposal?.installments) return null;
    const row = proposal.installments.find((r) => r.id === installmentId);
    if (!row) return null;
    const client = await ctx.db.get(proposal.clientId);
    return { proposal, row, client };
  },
});

export const markInstallmentInvoiced = internalMutation({
  args: {
    proposalId: v.id("proposals"),
    installmentId: v.string(),
  },
  handler: async (ctx, { proposalId, installmentId }) => {
    const proposal = await ctx.db.get(proposalId);
    if (!proposal?.installments) return;
    const now = Date.now();
    const updated = proposal.installments.map((r) =>
      r.id === installmentId && r.status === "pending"
        ? { ...r, status: "invoiced" as const, invoicedAt: now, dueAt: now }
        : r
    );
    await ctx.db.patch(proposalId, { installments: updated });
  },
});

// Admin override: send an invoice for a specific pending installment right now.
export const sendInvoiceNow = mutation({
  args: {
    proposalId: v.id("proposals"),
    installmentId: v.string(),
  },
  handler: async (ctx, { proposalId, installmentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const proposal = await ctx.db.get(proposalId);
    if (!proposal?.installments) throw new Error("No installments");
    const row = proposal.installments.find((r) => r.id === installmentId);
    if (!row || row.status !== "pending")
      throw new Error("Installment is not pending");

    if (row.scheduledJobId) {
      try {
        await ctx.scheduler.cancel(row.scheduledJobId);
      } catch {
        // ignore
      }
    }

    await ctx.scheduler.runAfter(
      0,
      internal.proposals.sendInstallmentInvoice,
      { proposalId, installmentId }
    );
  },
});

// ============================================================
// Legacy webhook fallback (sessions created before installment migration)
// ============================================================

export const markPaid = internalMutation({
  args: {
    stripeSessionId: v.string(),
    paymentIntentId: v.optional(v.string()),
    paymentNumber: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, { stripeSessionId, paymentIntentId, paymentNumber }) => {
    let proposal;
    if (paymentNumber === 2) {
      proposal = await ctx.db
        .query("proposals")
        .withIndex("by_secondStripeSessionId", (q) =>
          q.eq("secondStripeSessionId", stripeSessionId)
        )
        .unique();
    } else {
      proposal = await ctx.db
        .query("proposals")
        .withIndex("by_stripeSessionId", (q) =>
          q.eq("stripeSessionId", stripeSessionId)
        )
        .unique();
    }
    if (!proposal) return;

    if (proposal.paymentMode === "split") {
      if (paymentNumber === 1 && proposal.firstPaidAt === undefined) {
        await ctx.db.patch(proposal._id, {
          status: "accepted",
          acceptedAt: Date.now(),
          paidAt: Date.now(),
          stripePaymentIntentId: paymentIntentId,
          firstPaymentStatus: "paid",
          firstPaidAt: Date.now(),
        });
        if (proposal.projectId) {
          const project = await ctx.db.get(proposal.projectId);
          if (
            project &&
            (project.stage === "lead" || project.stage === "proposal")
          ) {
            await ctx.db.patch(proposal.projectId, { stage: "contracted" });
          }
        }
      } else if (
        paymentNumber === 2 &&
        proposal.secondPaidAt === undefined
      ) {
        await ctx.db.patch(proposal._id, {
          secondPaymentStatus: "paid",
          secondPaidAt: Date.now(),
          secondStripePaymentIntentId: paymentIntentId,
        });
      }
    } else {
      await ctx.db.patch(proposal._id, {
        status: "accepted",
        acceptedAt: Date.now(),
        paidAt: Date.now(),
        stripePaymentIntentId: paymentIntentId,
      });
      if (proposal.projectId) {
        const project = await ctx.db.get(proposal.projectId);
        if (
          project &&
          (project.stage === "lead" || project.stage === "proposal")
        ) {
          await ctx.db.patch(proposal.projectId, { stage: "contracted" });
        }
      }
    }
  },
});

// ============================================================
// Migration: backfill installments for legacy proposals.
// Run once via: npx convex run proposals:migrateLegacyPayments
// ============================================================

export const migrateLegacyPayments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const proposals = await ctx.db.query("proposals").collect();
    let migrated = 0;
    let skipped = 0;
    for (const proposal of proposals) {
      if (proposal.installments && proposal.installments.length > 0) {
        skipped++;
        continue;
      }

      let installments;
      if (proposal.paymentMode === "split") {
        installments = [
          {
            id: crypto.randomUUID(),
            label: "Deposit",
            percent: 50,
            order: 0,
            trigger: { type: "on_acceptance" as const },
            status:
              proposal.firstPaymentStatus === "paid"
                ? ("paid" as const)
                : proposal.status === "sent" || proposal.status === "viewed"
                ? ("invoiced" as const)
                : ("pending" as const),
            paidAt: proposal.firstPaidAt,
            invoicedAt: proposal.sentAt,
            stripeSessionId: proposal.stripeSessionId,
            stripePaymentIntentId: proposal.stripePaymentIntentId,
          },
          {
            id: crypto.randomUUID(),
            label: "Final",
            percent: 50,
            order: 1,
            trigger: { type: "on_completion" as const },
            status:
              proposal.secondPaymentStatus === "paid"
                ? ("paid" as const)
                : proposal.secondPaymentStatus === "invoiced"
                ? ("invoiced" as const)
                : ("pending" as const),
            paidAt: proposal.secondPaidAt,
            invoicedAt: proposal.secondInvoiceSentAt,
            stripeSessionId: proposal.secondStripeSessionId,
            stripePaymentIntentId: proposal.secondStripePaymentIntentId,
          },
        ];
      } else {
        const isPaid =
          proposal.status === "accepted" || proposal.paidAt !== undefined;
        installments = [
          {
            id: crypto.randomUUID(),
            label: "Full payment",
            percent: 100,
            order: 0,
            trigger: { type: "on_acceptance" as const },
            status: isPaid
              ? ("paid" as const)
              : proposal.status === "sent" || proposal.status === "viewed"
              ? ("invoiced" as const)
              : ("pending" as const),
            paidAt: proposal.paidAt,
            invoicedAt: proposal.sentAt,
            stripeSessionId: proposal.stripeSessionId,
            stripePaymentIntentId: proposal.stripePaymentIntentId,
          },
        ];
      }

      await ctx.db.patch(proposal._id, { installments });
      migrated++;
    }
    return { migrated, skipped };
  },
});

// ============================================================
// Legacy helpers (still imported by older code paths)
// ============================================================

export const setStripeSessionId = mutation({
  args: {
    id: v.id("proposals"),
    stripeSessionId: v.string(),
    paymentNumber: v.optional(v.union(v.literal(1), v.literal(2))),
  },
  handler: async (ctx, { id, stripeSessionId, paymentNumber }) => {
    if (paymentNumber === 2) {
      await ctx.db.patch(id, { secondStripeSessionId: stripeSessionId });
    } else {
      await ctx.db.patch(id, { stripeSessionId });
    }
  },
});

export const backfillProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const proposals = await ctx.db.query("proposals").collect();
    let created = 0;
    for (const proposal of proposals) {
      if (!proposal.projectId) {
        const projectId = await ctx.db.insert("projects", {
          clientId: proposal.clientId,
          title: proposal.title,
          service: proposal.service || "General",
          stage: "proposal",
          budget: proposal.totalAmount,
        });
        await ctx.db.patch(proposal._id, { projectId });
        created++;
      }
    }
    return { created };
  },
});

// Silence unused-import warnings for type aliases referenced only in JSDoc.
export type _ProposalId = Id<"proposals">;
