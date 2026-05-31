-- Welcome email sequence tracking table.
-- Prevents duplicate sends via unique constraint on (user_id, email_number).
-- Service-role only — no user-facing access needed.

CREATE TABLE IF NOT EXISTS welcome_email_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  email_number int NOT NULL CHECK (email_number BETWEEN 1 AND 3),
  sent_at     timestamptz NOT NULL DEFAULT now(),
  status      text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  UNIQUE (user_id, email_number)
);

-- Index for the cron query: find users who haven't received a given email yet.
CREATE INDEX idx_welcome_email_log_user ON welcome_email_log (user_id, email_number);

-- RLS: service_role only. No policies = no access via anon/authenticated keys.
ALTER TABLE welcome_email_log ENABLE ROW LEVEL SECURITY;
