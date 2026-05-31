# Affiliate program — creator attribution + payouts

Claude Academy runs a manual-payout affiliate program built on Stripe coupons
and two Supabase tables. Creators get a custom coupon code; subscribers who
use it are attributed to the creator; Reid pays creators monthly off a CSV
report.

## Schema overview

Tables live in [`supabase/migrations/013_affiliate_tracking.sql`](../supabase/migrations/013_affiliate_tracking.sql).

### `affiliate_creators`

One row per partner creator.

| Column                 | Notes                                                                 |
|------------------------|-----------------------------------------------------------------------|
| `id`                   | uuid PK                                                               |
| `name`                 | display name                                                          |
| `handle`               | `@handle` on their primary channel                                    |
| `email`                | contact email                                                         |
| `channel`              | `youtube`, `twitter`, `tiktok`, `newsletter`, `email`, ...            |
| `reach_estimate`       | subs / followers / list size                                          |
| `language`             | ISO 639-1, default `en`                                               |
| `coupon_code`          | UNIQUE — also used as the Stripe coupon id                            |
| `stripe_coupon_id`     | filled in when the coupon script runs                                 |
| `rev_share_pct`        | 0..100, default 30 (lifetime rev-share on every attributed subscriber) |
| `outreach_status`      | `not_started` → `pitched` → `replied` → `negotiating` → `signed` → `live` → `dormant` / `declined` |
| `agreement_signed`     | boolean                                                               |
| `outreach_sent_at`     | timestamptz                                                           |
| `notes`                | free-form                                                             |

### `affiliate_attributions`

One row per subscription that used a creator's coupon.

| Column                     | Notes                                                           |
|----------------------------|-----------------------------------------------------------------|
| `user_id`                  | FK → `auth.users` (cascade delete)                              |
| `creator_id`               | FK → `affiliate_creators` (restrict delete)                     |
| `coupon_code`              | denormalized for speed                                          |
| `stripe_subscription_id`   | UNIQUE — idempotency key for webhook                            |
| `stripe_customer_id`       | for cross-reference                                             |
| `subscription_created_at`  | from Stripe `subscription.created`                              |
| `subscription_status`      | `active` / `trialing` / `past_due` / `canceled` / `churned` / `incomplete` |
| `mrr_cents`                | current MRR contribution in cents                               |
| `total_paid_cents`         | cumulative invoice total (needs a future `invoice.paid` hook)   |
| `last_payment_at`          | timestamptz                                                     |
| `churned_at`               | timestamptz, nullable                                           |

### RLS

Both tables have RLS enabled with no `anon` / `authenticated` policies and
explicit `REVOKE ALL ON ... FROM anon, authenticated`. Every read and write
goes through server-side code using `createSupabaseAdmin()` (service role).

## Adding a new creator

1. Prepare a `creators.json` (or `creators.csv`) with at least `name` and
   `suggested_code`:

   ```json
   [
     {
       "name": "Jane Doe",
       "handle": "@janedoe",
       "email": "jane@example.com",
       "channel": "youtube",
       "language": "en",
       "reach_estimate": 125000,
       "suggested_code": "JANE20",
       "rev_share_pct": 30
     }
   ]
   ```

2. Dry-run to confirm the plan:

   ```bash
   npx tsx scripts/create-affiliate-coupons.ts creators.json --dry-run
   ```

3. Execute:

   ```bash
   npx tsx scripts/create-affiliate-coupons.ts creators.json
   ```

The script:

- creates a Stripe coupon with id = `suggested_code`, 20% off for 3 months
  (idempotent — reuses the coupon if it already exists)
- inserts / upserts an `affiliate_creators` row with `outreach_status = 'not_started'`
- prints a one-line summary per creator and a final count

**Coupon code hygiene:** codes must be 4–32 chars, `[A-Z0-9_-]`. The script
normalizes to uppercase. Anything that fails this check is skipped with a
warning.

## Monthly payouts

```bash
# Print to stdout (defaults to current UTC month label)
npx tsx scripts/affiliate-payouts.ts

# Write to a file with a specific label
npx tsx scripts/affiliate-payouts.ts --month 2026-04 --out payouts-2026-04.csv

# Restrict the attributions counted to those who signed up in a given month
npx tsx scripts/affiliate-payouts.ts --signup-month 2026-04 --out april-signups.csv
```

The report groups by creator and computes

```
payout_usd = SUM(active_attribution.mrr_cents) × rev_share_pct / 100 / 100
```

where "active" means `subscription_status IN ('active', 'trialing')`. Creators
in `not_started` or `declined` outreach states are excluded.

Reid reviews the CSV, then pays each creator manually via Wise or PayPal.

## Stripe webhook flow

Handler lives at `src/app/api/webhooks/stripe/route.ts`.

| Stripe event                      | Affiliate action                                                                 |
|-----------------------------------|----------------------------------------------------------------------------------|
| `checkout.session.completed`      | If the resulting subscription has a discount that matches an `affiliate_creators.stripe_coupon_id`, insert an `affiliate_attributions` row (upsert on `stripe_subscription_id`). |
| `customer.subscription.updated`   | Map Stripe status → our enum, update the attribution row. If canceled, stamp `churned_at`. |
| `customer.subscription.deleted`   | Set `subscription_status = 'churned'`, stamp `churned_at`.                       |

All affiliate logic is wrapped in `try/catch`. If attribution recording fails
(e.g. the coupon is ours but the Supabase insert errors), the core subscription
upsert still succeeds — the webhook returns `200` and we log the error. The
customer is never blocked from buying because of affiliate bookkeeping.

## Known limitations

- **Manual payouts.** No Stripe Connect, no automated disbursement. Reid pays
  each creator by hand from the monthly CSV.
- **No self-serve creator dashboard.** Creators cannot log in and see their
  own attribution count. Share the column subset manually when asked.
- **`total_paid_cents` is not auto-maintained.** Needs a future
  `invoice.paid` webhook handler to increment `total_paid_cents` and stamp
  `last_payment_at`. Until then it's populated at subscription creation only.
- **No referral-link attribution.** We only attribute via coupon code entered
  at checkout. If Reid ever wants `?ref=JANE` URL attribution, that's a
  separate middleware + cookie layer.
- **One coupon per creator.** The schema enforces `coupon_code UNIQUE`. If a
  creator wants multiple codes (A/B test, landing pages), we'd need either
  multiple creator rows or a child `coupons` table.
- **English-only coupon metadata.** `affiliate_creators.language` is stored
  but not yet piped into per-language landing pages.

## Testing locally

Seed file at [`supabase/seed/affiliate-test.sql`](../supabase/seed/affiliate-test.sql)
inserts 3 test creators and up to 3 attributions (scaling with however many
`auth.users` rows exist in the environment).

```bash
psql "$DATABASE_URL" -f supabase/seed/affiliate-test.sql
npx tsx scripts/affiliate-payouts.ts
```

If no auth users exist, the seed inserts creators only and the payout CSV
shows zero-active-subs rows — which is the correct state for a fresh project.
