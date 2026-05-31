-- Migration 023: Fix display_name defaults to use email prefix, not raw email
--
-- Bug: handle_new_user() stored the full email as display_name when no
-- display_name was in user metadata. This leaks emails on the leaderboard.
--
-- Fix:
--   1. Update the trigger to use split_part(email, '@', 1) as fallback.
--   2. Backfill existing rows where display_name looks like an email.

-- ============================================================
-- 1. Update trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  );
  RETURN new;
END;
$$;

-- ============================================================
-- 2. Backfill: strip domain from any display_name that is a raw email
-- ============================================================
UPDATE user_profiles
SET display_name = split_part(display_name, '@', 1)
WHERE display_name LIKE '%@%.%';
