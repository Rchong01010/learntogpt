import { NextRequest } from "next/server";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { alertReid } from "@/lib/alerts";
import { pingSignupSlack } from "@/lib/slack-signups";
import { PLATFORM } from "@/lib/config";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Extract the (single) Stripe coupon id applied to a subscription, if any.
 *
 * Stripe's dahlia API exposes discounts two ways depending on expand state:
 *   - subscription.discount       (legacy, optional, deprecated but still present)
 *   - subscription.discounts      (array of Discount | string ids)
 *
 * For each Discount we read `source.coupon` (dahlia nested the coupon under
 * source). Coupon can be a bare id string or an expanded Coupon object.
 *
 * Returns the first coupon id found, or null.
 */
function extractCouponId(subscription: Stripe.Subscription): string | null {
  type DiscountLike = {
    source?: { coupon?: string | { id?: string } | null } | null;
  };

  const pickFromDiscount = (d: DiscountLike | string | null | undefined): string | null => {
    if (!d || typeof d === "string") return null;
    const coupon = d.source?.coupon;
    if (!coupon) return null;
    if (typeof coupon === "string") return coupon;
    return coupon.id ?? null;
  };

  // Legacy singular field — still emitted by some API paths
  const legacy = (subscription as unknown as { discount?: DiscountLike | null }).discount;
  const fromLegacy = pickFromDiscount(legacy);
  if (fromLegacy) return fromLegacy;

  // Modern array field
  const arr = (subscription as unknown as { discounts?: Array<DiscountLike | string> }).discounts;
  if (Array.isArray(arr)) {
    for (const d of arr) {
      const id = pickFromDiscount(d);
      if (id) return id;
    }
  }
  return null;
}

/**
 * On subscription create: if a coupon was applied, record an attribution row
 * against the matching affiliate_creators entry. Wrapped in try/catch — a
 * failure here MUST NOT break the core subscription upsert path.
 */
async function tryRecordAffiliateAttribution(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  userId: string
): Promise<void> {
  try {
    const couponId = extractCouponId(subscription);
    if (!couponId) return;

    const { data: creator, error: lookupError } = await supabase
      .from("affiliate_creators")
      .select("id, coupon_code")
      .eq("stripe_coupon_id", couponId)
      .maybeSingle();

    if (lookupError) {
      await alertReid({
        severity: "warning",
        source: "stripe.affiliate_lookup",
        message: "Could not look up affiliate creator by coupon — attribution skipped",
        context: {
          coupon_id: couponId,
          subscription_id: subscription.id,
          error: lookupError.message,
        },
      });
      return;
    }
    if (!creator) {
      // Coupon used but not one of ours — harmless (e.g. a one-off promo coupon).
      return;
    }

    // MRR cents at signup = the subscription's recurring item price, pre-discount.
    // Uses items.data[0].price.unit_amount (in cents) when available.
    const firstItem = subscription.items?.data?.[0];
    const unitAmount = firstItem?.price?.unit_amount ?? 0;
    const quantity = firstItem?.quantity ?? 1;
    const mrrCents = unitAmount * quantity;

    const createdAt = new Date(subscription.created * 1000).toISOString();

    // Upsert on stripe_subscription_id so duplicate webhook deliveries are safe.
    const { error: insertError } = await supabase
      .from("affiliate_attributions")
      .upsert(
        {
          user_id: userId,
          creator_id: creator.id,
          coupon_code: creator.coupon_code,
          stripe_subscription_id: subscription.id,
          stripe_customer_id:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null,
          subscription_created_at: createdAt,
          subscription_status: "active",
          mrr_cents: mrrCents,
        },
        { onConflict: "stripe_subscription_id" }
      );

    if (insertError) {
      await alertReid({
        severity: "high",
        source: "stripe.affiliate_attribution_insert",
        message: "Affiliate attribution row failed to insert — payout will be missing for this sub",
        context: {
          creator_id: creator.id,
          coupon_code: creator.coupon_code,
          user_id: userId,
          subscription_id: subscription.id,
          mrr_cents: mrrCents,
          error: insertError.message,
        },
      });
    }
  } catch (err) {
    await alertReid({
      severity: "high",
      source: "stripe.affiliate_attribution",
      message: "Affiliate attribution recording threw an exception",
      context: {
        user_id: userId,
        subscription_id: subscription.id,
        error: err instanceof Error ? err.message : String(err),
      },
    });
  }
}

/**
 * On subscription cancel/churn: flip the attribution row's status so monthly
 * payouts stop counting it. Safe to call for subs with no attribution row.
 */
async function tryMarkAttributionChurned(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  try {
    const { error } = await supabase
      .from("affiliate_attributions")
      .update({
        subscription_status: "churned",
        churned_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      await alertReid({
        severity: "warning",
        source: "stripe.affiliate_churn_update",
        message: "Could not flip affiliate attribution to churned",
        context: {
          subscription_id: subscription.id,
          error: error.message,
        },
      });
    }
  } catch (err) {
    await alertReid({
      severity: "warning",
      source: "stripe.affiliate_churn_update",
      message: "Affiliate churn update threw",
      context: {
        subscription_id: subscription.id,
        error: err instanceof Error ? err.message : String(err),
      },
    });
  }
}

/**
 * On subscription update (e.g. past_due, canceled, reactivated): reflect the
 * status on the attribution row. Keeps payout counts in sync.
 */
async function tryUpdateAttributionStatus(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<void> {
  try {
    const stripeStatus = subscription.status;
    // Map stripe status → affiliate_subscription_status enum (see migration 013)
    const statusMap: Record<string, string> = {
      active: "active",
      trialing: "trialing",
      past_due: "past_due",
      canceled: "canceled",
      unpaid: "past_due",
      incomplete: "incomplete",
      incomplete_expired: "canceled",
    };
    const mapped = statusMap[stripeStatus] ?? "canceled";

    const update: Record<string, unknown> = { subscription_status: mapped };
    if (mapped === "canceled" || mapped === "churned") {
      update.churned_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("affiliate_attributions")
      .update(update)
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      await alertReid({
        severity: "warning",
        source: "stripe.affiliate_status_update",
        message: "Could not sync affiliate attribution status",
        context: {
          subscription_id: subscription.id,
          stripe_status: stripeStatus,
          mapped_status: mapped,
          error: error.message,
        },
      });
    }
  } catch (err) {
    await alertReid({
      severity: "warning",
      source: "stripe.affiliate_status_update",
      message: "Affiliate status update threw",
      context: {
        subscription_id: subscription.id,
        error: err instanceof Error ? err.message : String(err),
      },
    });
  }
}

/**
 * Best-effort lookup of a customer email by Stripe customer id. Returns null on
 * any failure (deleted customer, network blip, missing id). Used to enrich
 * #signups Slack pings — never load-bearing.
 */
async function lookupCustomerEmail(
  stripe: Stripe,
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
): Promise<string | null> {
  try {
    if (!customerId) return null;
    if (typeof customerId !== "string") {
      // Already an expanded object on the event
      const maybe = customerId as Partial<Stripe.Customer>;
      return maybe.email ?? null;
    }
    const customer = await stripe.customers.retrieve(customerId);
    if ((customer as Stripe.DeletedCustomer).deleted) return null;
    return (customer as Stripe.Customer).email ?? null;
  } catch (err) {
    console.warn(
      "[stripe] lookupCustomerEmail failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Format an amount in the smallest currency unit (cents) into "$X.XX" or
 * "EUR X.XX" for non-USD. Defaults to USD if currency is null/undefined.
 */
function formatAmount(
  amount: number | null | undefined,
  currency: string | null | undefined
): string | null {
  if (amount === null || amount === undefined) return null;
  const cur = (currency || "usd").toUpperCase();
  const dollars = (amount / 100).toFixed(2);
  return cur === "USD" ? `$${dollars}` : `${cur} ${dollars}`;
}

/**
 * Derive the current period end from a Stripe Subscription.
 * In dahlia API, current_period_end was removed. We compute it from
 * the latest invoice's period_end, or fall back to cancel_at / billing_cycle_anchor.
 */
async function getPeriodEnd(subscription: Stripe.Subscription): Promise<string> {
  const stripe = getStripe();
  // Try to get from latest invoice
  if (subscription.latest_invoice && typeof subscription.latest_invoice === "string") {
    try {
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
      if (invoice.lines?.data?.[0]?.period?.end) {
        return new Date(invoice.lines.data[0].period.end * 1000).toISOString();
      }
    } catch (err) {
      // Non-fatal: we have a billing_cycle_anchor fallback below. Log so the
      // antipattern of silently swallowing the error doesn't recur.
      console.warn(
        "[stripe] invoice retrieve failed, falling back to billing_cycle_anchor:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Fall back to cancel_at or 30 days from now
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000).toISOString();
  }

  // Default: 30 days from billing_cycle_anchor
  const anchor = subscription.billing_cycle_anchor ?? Math.floor(Date.now() / 1000);
  const thirtyDays = anchor + 30 * 24 * 60 * 60;
  return new Date(thirtyDays * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let webhookSecret: string;
  try {
    webhookSecret = getWebhookSecret();
  } catch {
    // Without the secret EVERY Stripe webhook 500s. Config-level outage.
    await alertReid({
      severity: "critical",
      source: "stripe.config",
      message: "STRIPE_WEBHOOK_SECRET is not configured — all Stripe webhooks are failing",
    });
    return new Response("Internal server error", { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    // Most likely cause: webhook secret rotated in Stripe but not updated in
    // Vercel env. Less likely: attacker probing. Either way, every legitimate
    // webhook is now bouncing — escalate.
    await alertReid({
      severity: "high",
      source: "stripe.signature_verification",
      message: "Stripe webhook signature verification failed — likely STRIPE_WEBHOOK_SECRET drift",
      context: { error: err instanceof Error ? err.message : String(err) },
    });
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  const supabase = await createSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const product = session.metadata?.product;
        const userId = session.metadata?.user_id;

        if (!userId) {
          // Customer paid but checkout session was created without a user_id
          // in metadata. The only place we attach this is /api/checkout, so
          // this means that route shipped a bug. Subscription is unlinkable.
          await alertReid({
            severity: "critical",
            source: "stripe.checkout_no_user_id",
            message: "Customer paid but checkout session has no user_id metadata — cannot be linked",
            context: {
              session_id: session.id,
              product: product ?? null,
              stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
              event_id: event.id,
            },
          });
          break;
        }

        // ── One-time course unlock ──────────────────────────────────────────
        if (product === "course_unlock") {
          // Read platform from checkout session metadata; fall back to PLATFORM
          // constant so rows are always tagged even if metadata is missing.
          const unlockPlatform = session.metadata?.platform ?? PLATFORM;
          const { error: unlockError } = await supabase
            .from("course_unlocks")
            .upsert(
              {
                user_id: userId,
                platform: unlockPlatform,
                stripe_payment_intent_id:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : null,
                stripe_checkout_session_id: session.id,
              },
              { onConflict: "user_id,platform" }
            );

          if (unlockError) {
            await alertReid({
              severity: "critical",
              source: "stripe.course_unlock_upsert",
              message: "Customer paid for course unlock but DB row failed — user still sees paywall",
              context: {
                user_id: userId,
                session_id: session.id,
                error: unlockError.message,
                event_id: event.id,
              },
            });
          } else {
            await pingSignupSlack({
              tag: "Academy",
              title: "course unlock purchased",
              emoji: ":unlock:",
              fields: [
                ["Email", session.customer_email],
                ["User ID", userId],
                ["Session", session.id],
              ],
            });
          }
          break;
        }

        // ── Recurring subscription (existing flow) ───────────────────────────
        if (!session.customer || !session.subscription) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const periodEnd = await getPeriodEnd(subscription);

        const { error } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            status: "active",
            current_period_end: periodEnd,
          },
          { onConflict: "user_id" }
        );

        if (error) {
          // CRITICAL: customer was charged by Stripe but we failed to record
          // their subscription. Without an alert, they'd appear unpaid in our
          // DB and lose Pro access on next page load.
          await alertReid({
            severity: "critical",
            source: "stripe.subscription_upsert",
            message: "Customer paid but subscription row failed to upsert — Pro access broken",
            context: {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              error: error.message,
              event_id: event.id,
            },
          });
        } else {
          // Subscription upsert succeeded — fire #signups Slack ping.
          // Best-effort; pingSignupSlack never throws.
          const firstItem = subscription.items?.data?.[0];
          const unitAmount = firstItem?.price?.unit_amount ?? 0;
          const currency = (firstItem?.price?.currency || "usd").toUpperCase();
          const interval = firstItem?.price?.recurring?.interval || "mo";
          const planLabel =
            unitAmount > 0
              ? `${currency === "USD" ? "$" : `${currency} `}${(unitAmount / 100).toFixed(2)}/${interval === "month" ? "mo" : interval}`
              : null;
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null;

          await pingSignupSlack({
            tag: "Academy",
            title: "paid signup",
            emoji: ":moneybag:",
            fields: [
              ["Email", session.customer_email],
              ["Plan", planLabel],
              ["Stripe Sub", subscription.id],
              ["Customer", customerId],
            ],
          });
        }

        // Affiliate attribution — only place we have userId + coupon together.
        // Wrapped helper is fully guarded; never throws.
        await tryRecordAffiliateAttribution(supabase, subscription, userId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          unpaid: "past_due",
          trialing: "active",
        };

        const status = statusMap[subscription.status] ?? "canceled";
        const periodEnd = await getPeriodEnd(subscription);

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_end: periodEnd,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          await alertReid({
            severity: "high",
            source: "stripe.subscription_update",
            message: "Subscription status update failed — DB will show stale status",
            context: {
              stripe_subscription_id: subscription.id,
              new_status: status,
              stripe_status: subscription.status,
              error: error.message,
              event_id: event.id,
            },
          });
        }

        // Keep affiliate attribution status in sync (past_due, canceled, etc.).
        await tryUpdateAttributionStatus(supabase, subscription);

        // #signups ping when transitioning active → past_due. Stripe surfaces
        // the previous status under event.data.previous_attributes.status. We
        // only fire on that exact transition to avoid noise from repeated
        // subscription.updated events that don't change billing health.
        try {
          const prev = (event.data as { previous_attributes?: { status?: string } })
            .previous_attributes;
          if (
            prev?.status === "active" &&
            subscription.status === "past_due"
          ) {
            const customerId =
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer?.id ?? null;
            const email = await lookupCustomerEmail(stripe, subscription.customer);
            await pingSignupSlack({
              tag: "Academy",
              title: "past due",
              emoji: ":hourglass:",
              fields: [
                ["Email", email],
                ["Subscription", subscription.id],
                ["Customer", customerId],
                ["New status", subscription.status],
                ["Current period end", periodEnd],
              ],
            });
          }
        } catch (err) {
          console.error(
            "[stripe] past_due slack ping threw:",
            err instanceof Error ? err.message : err
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          await alertReid({
            severity: "high",
            source: "stripe.subscription_cancel",
            message: "Subscription cancel update failed — DB still shows active",
            context: {
              stripe_subscription_id: subscription.id,
              error: error.message,
              event_id: event.id,
            },
          });
        }

        // Mark any affiliate attribution as churned.
        await tryMarkAttributionChurned(supabase, subscription);

        // #signups churn ping. Best-effort.
        try {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null;
          const email = await lookupCustomerEmail(stripe, subscription.customer);
          const firstItem = subscription.items?.data?.[0];
          const unitAmount = firstItem?.price?.unit_amount ?? null;
          const currency = firstItem?.price?.currency ?? null;
          const lastMrr = formatAmount(unitAmount, currency);
          // Stripe sets canceled_at on the subscription when it ends.
          const cancelledAt = subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : new Date().toISOString();
          await pingSignupSlack({
            tag: "Academy",
            title: "churn",
            emoji: ":x:",
            fields: [
              ["Email", email],
              ["Subscription", subscription.id],
              ["Customer", customerId],
              ["Cancelled at", cancelledAt],
              ["Last MRR", lastMrr],
            ],
          });
        } catch (err) {
          console.error(
            "[stripe] churn slack ping threw:",
            err instanceof Error ? err.message : err
          );
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        try {
          // Modern Stripe API path: invoice.parent.subscription_details.subscription.
          // (Top-level invoice.subscription was removed in dahlia.) We fall back
          // to the legacy field on older events to be safe.
          const subRef =
            invoice.parent?.subscription_details?.subscription ??
            (invoice as unknown as { subscription?: string | Stripe.Subscription })
              .subscription ??
            null;
          const subscriptionId =
            typeof subRef === "string"
              ? subRef
              : (subRef as Stripe.Subscription | null)?.id ?? null;
          const amountDue = formatAmount(invoice.amount_due, invoice.currency);
          const attemptCount =
            typeof invoice.attempt_count === "number"
              ? String(invoice.attempt_count)
              : null;
          const nextAttempt = invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000).toISOString()
            : null;
          const email =
            invoice.customer_email ??
            (await lookupCustomerEmail(stripe, invoice.customer));

          await pingSignupSlack({
            tag: "Academy",
            title: "payment failed",
            emoji: ":credit_card::warning:",
            fields: [
              ["Email", email],
              ["Amount due", amountDue],
              ["Subscription", subscriptionId],
              ["Attempt count", attemptCount],
              ["Next attempt at", nextAttempt],
            ],
          });
        } catch (err) {
          console.error(
            "[stripe] payment_failed slack ping threw:",
            err instanceof Error ? err.message : err
          );
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        try {
          const email =
            charge.billing_details?.email ??
            charge.receipt_email ??
            (await lookupCustomerEmail(stripe, charge.customer));
          const amount = formatAmount(
            charge.amount_refunded ?? charge.amount,
            charge.currency
          );
          // Most-recent refund's reason, if present.
          const refunds = charge.refunds?.data ?? [];
          const reason = refunds.length > 0 ? refunds[refunds.length - 1].reason : null;

          await pingSignupSlack({
            tag: "Academy",
            title: "refund",
            emoji: ":money_with_wings:",
            fields: [
              ["Email", email],
              ["Amount", amount],
              ["Charge ID", charge.id],
              ["Reason", reason],
            ],
          });
        } catch (err) {
          console.error(
            "[stripe] refund slack ping threw:",
            err instanceof Error ? err.message : err
          );
        }

        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        try {
          // Resolve email via the underlying charge → customer chain.
          let email: string | null = null;
          const chargeRef = dispute.charge;
          let chargeId: string | null = null;
          if (typeof chargeRef === "string") {
            chargeId = chargeRef;
            try {
              const charge = await stripe.charges.retrieve(chargeRef);
              email =
                charge.billing_details?.email ??
                charge.receipt_email ??
                (await lookupCustomerEmail(stripe, charge.customer));
            } catch (err) {
              console.warn(
                "[stripe] dispute charge retrieve failed:",
                err instanceof Error ? err.message : err
              );
            }
          } else if (chargeRef) {
            chargeId = chargeRef.id;
            email =
              chargeRef.billing_details?.email ??
              chargeRef.receipt_email ??
              (await lookupCustomerEmail(stripe, chargeRef.customer));
          }

          const amount = formatAmount(dispute.amount, dispute.currency);
          const evidenceDue = dispute.evidence_details?.due_by
            ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
            : null;

          await pingSignupSlack({
            tag: "Academy",
            title: "chargeback",
            emoji: ":rotating_light:",
            fields: [
              ["Email", email],
              ["Amount", amount],
              ["Reason", dispute.reason ?? null],
              ["Dispute ID", dispute.id],
              ["Charge ID", chargeId],
              ["Evidence due", evidenceDue],
            ],
          });
        } catch (err) {
          console.error(
            "[stripe] chargeback slack ping threw:",
            err instanceof Error ? err.message : err
          );
        }

        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // CRITICAL: top-level handler threw. Stripe will retry automatically (good),
    // but we still want to know immediately because repeated retries with the
    // same failure mean we're losing real events past Stripe's retry window.
    await alertReid({
      severity: "critical",
      source: "stripe.webhook_handler",
      message: "Stripe webhook handler threw — Stripe will retry, but investigate now",
      context: {
        event_id: event.id,
        event_type: event.type,
        error: message,
      },
    });
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
