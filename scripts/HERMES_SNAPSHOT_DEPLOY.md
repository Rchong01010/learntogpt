# Hermes Weekly Affiliate Snapshot — Deploy Steps

One-time setup for the Monday 8am PT affiliate snapshot. Script lives in this
repo for version control; runs on Hermes (Hetzner CX23, `178.105.61.167`).

Per `feedback_credentials_self_service_only.md` — Reid runs all credential
steps himself. This doc gives the steps; Reid never pastes secret values into
chat.

## 1. Apply the Supabase migration

Open the Supabase SQL editor for the **Claude Academy** project and run:

```
supabase/migrations/020_affiliate_snapshots.sql
```

Verify with:

```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'affiliate_snapshots';
```

## 2. Copy the script up to Hermes

From your iMac:

```bash
scp ~/claude-academy/scripts/hermes_weekly_affiliate_snapshot.mjs \
  hermes@178.105.61.167:~/skills/academy-affiliate-snapshot.mjs
```

(If `~/skills/` doesn't exist: `ssh hermes@178.105.61.167 'mkdir -p ~/skills ~/logs'` first.)

## 3. Install the one Node dep on Hermes

```bash
ssh hermes@178.105.61.167
cd ~/skills
npm init -y >/dev/null 2>&1
npm install @supabase/supabase-js
```

(No `stripe` dep needed — current script reads MRR from `affiliate_attributions` only. Add later if we want Stripe-direct MRR cross-check.)

## 4. Add env vars to Hermes

Edit `~/.hermes/.env` (or wherever Hermes loads env from — same file you use for the existing Slack tokens). Append:

```
ACADEMY_SUPABASE_URL=<from claude-academy/.env.local NEXT_PUBLIC_SUPABASE_URL>
ACADEMY_SUPABASE_SERVICE_ROLE_KEY=<from claude-academy/.env.local SUPABASE_SERVICE_ROLE_KEY>
ACADEMY_SLACK_SIGNUPS_WEBHOOK=<the #signups channel incoming-webhook URL>
```

For the Slack webhook: if `#signups` doesn't already have an incoming-webhook
URL, create one at https://api.slack.com/apps → your A Team Slack app →
"Incoming Webhooks" → "Add New Webhook to Workspace" → pick `#signups`. Copy
the URL into the env var. (The existing `SLACK_WEBHOOK_URL` in your local
.env files points at `#claude-releases`, not `#signups` — a different channel.)

## 5. Smoke test before scheduling

```bash
ssh hermes@178.105.61.167
node ~/skills/academy-affiliate-snapshot.mjs
```

Expect:
- A real Slack message in `#signups` with today's numbers (232 creators, $0
  MRR baseline)
- A new row in `affiliate_snapshots` (verify in Supabase: `SELECT * FROM affiliate_snapshots ORDER BY captured_at DESC LIMIT 1;`)
- Stdout: `[snapshot] posted to Slack` + `[snapshot] done`

If Slack 404s, the webhook URL is wrong. If Supabase errors, the migration
hasn't been applied or the service-role key is missing. Script exits non-zero
on Slack failure but still writes the snapshot row, so the next run has a
baseline.

## 6. Schedule it

On Hermes:

```bash
crontab -e
```

Add (Monday 8am Pacific = 15:00 UTC during PDT, 16:00 UTC during PST — using
PDT here since we're in DST through Nov 2026):

```
0 15 * * 1 /usr/bin/env node /home/hermes/skills/academy-affiliate-snapshot.mjs >> /home/hermes/logs/affiliate-snapshot.log 2>&1
```

To confirm: `crontab -l | grep snapshot`.

## 7. (Optional) DST handling

When PDT → PST in Nov 2026, the cron will fire at 7am PT instead of 8am.
Either: (a) live with it, (b) update to `0 16 * * 1` for PST, then back to
`0 15` in March. Set a one-shot `/schedule` reminder for Nov 1 if you want.

## What to expect over time

- **Week 1:** baseline only. Most fields = 0 or "—".
- **Week 2+:** week-over-week deltas appear in `(+N wow)` parens.
- **First conversion:** message gets `🎉 FIRST DOLLAR — ` prefix automatically.
- **Once attributions exist:** top-5 leaderboard appended on a second line.

## Where things live

- Script source of truth: `claude-academy/scripts/hermes_weekly_affiliate_snapshot.mjs` (this repo)
- Deployed copy: `hermes@178.105.61.167:~/skills/academy-affiliate-snapshot.mjs`
- Logs: `hermes@178.105.61.167:~/logs/affiliate-snapshot.log`
- History: `affiliate_snapshots` table in Academy Supabase
- Output channel: Slack `#signups`
