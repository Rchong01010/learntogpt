-- Re-engagement email support.
-- Widens welcome_email_log.email_number to support re-engagement email IDs (10-12).
-- Adds an RPC to find users eligible for re-engagement emails.

-- ============================================================
-- 1. Widen email_number CHECK constraint
-- ============================================================
-- Old: CHECK (email_number BETWEEN 1 AND 3)
-- New: CHECK (email_number BETWEEN 1 AND 12)
-- Values 1-3 = welcome sequence, 10-12 = re-engagement sequence.
ALTER TABLE welcome_email_log DROP CONSTRAINT IF EXISTS welcome_email_log_email_number_check;
ALTER TABLE welcome_email_log ADD CONSTRAINT welcome_email_log_email_number_check
  CHECK (email_number BETWEEN 1 AND 12);

-- ============================================================
-- 2. RPC: find re-engagement-eligible users
-- ============================================================
-- Returns users whose most recent activity (lesson completion) was
-- within a time window around N days ago. Only includes users with
-- total_xp > 0 who haven't already received the given email_number.
--
-- Parameters:
--   p_days_ago       — target days since last activity (3, 7, or 14)
--   p_window_hours   — half-window in hours (default 12 = ±12h)
--   p_email_number   — the email_number to check dedup against (10, 11, or 12)
--   p_limit          — max rows to return
CREATE OR REPLACE FUNCTION get_reengagement_eligible(
  p_days_ago       int,
  p_window_hours   int DEFAULT 12,
  p_email_number   int DEFAULT 10,
  p_limit          int DEFAULT 50
)
RETURNS TABLE (
  user_id      uuid,
  display_name text,
  total_xp     int,
  last_active  timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    up.user_id,
    up.display_name,
    up.total_xp,
    MAX(upr.completed_at) AS last_active
  FROM user_profiles up
  JOIN user_progress upr ON upr.user_id = up.user_id
  WHERE up.total_xp > 0
    AND upr.completed_at IS NOT NULL
    -- Not already sent this re-engagement email
    AND NOT EXISTS (
      SELECT 1 FROM welcome_email_log wel
      WHERE wel.user_id = up.user_id
        AND wel.email_number = p_email_number
        AND wel.status = 'sent'
    )
  GROUP BY up.user_id, up.display_name, up.total_xp
  HAVING MAX(upr.completed_at) BETWEEN
    (now() - make_interval(days => p_days_ago) - make_interval(hours => p_window_hours))
    AND
    (now() - make_interval(days => p_days_ago) + make_interval(hours => p_window_hours))
  ORDER BY MAX(upr.completed_at) DESC
  LIMIT p_limit;
$$;

-- Only service_role should call this (cron endpoint uses admin client).
REVOKE EXECUTE ON FUNCTION get_reengagement_eligible FROM authenticated;
REVOKE EXECUTE ON FUNCTION get_reengagement_eligible FROM anon;
