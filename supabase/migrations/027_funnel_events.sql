-- Activation funnel tracking
-- Records key conversion events: signup → first lesson → first exercise → completion → 24hr return

CREATE TABLE IF NOT EXISTS funnel_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name text        NOT NULL,
  metadata   jsonb       DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Query activation rates: "how many users hit each funnel step?"
CREATE INDEX idx_funnel_events_user_event
  ON funnel_events (user_id, event_name);

-- Time-range queries for dashboards / cohort analysis
CREATE INDEX idx_funnel_events_created
  ON funnel_events (created_at);

-- RLS: users can insert their own events, service_role can read all
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own funnel events"
  ON funnel_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can read all funnel events"
  ON funnel_events
  FOR SELECT
  TO service_role
  USING (true);
