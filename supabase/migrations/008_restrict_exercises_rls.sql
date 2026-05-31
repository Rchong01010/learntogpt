-- Migration 008: Restrict exercises table RLS to prevent answer leaking
--
-- The exercises table had a blanket public read policy, allowing any
-- authenticated user (or anon key holder) to query correct_answer
-- directly via the Supabase REST API, bypassing v_exercises_safe.
--
-- Fix: Replace the blanket policy with one that only exposes safe columns.
-- Users should read exercises through v_exercises_safe view instead.

-- Drop the overly permissive policy
drop policy if exists "exercises_public_read" on exercises;

-- Replace with a policy that still allows reads but doesn't expose answers
-- Note: RLS policies apply to the table, not individual columns, so we
-- use a security-definer function + view approach instead.
-- The policy allows reads (needed for the view to work), but we revoke
-- direct SELECT from authenticated/anon roles and only grant on the view.

-- Keep the policy (view needs it), but revoke direct table access
revoke select on exercises from anon;
revoke select on exercises from authenticated;

-- Grant select only on the safe view
grant select on v_exercises_safe to anon;
grant select on v_exercises_safe to authenticated;
