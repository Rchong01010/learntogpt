-- Fix user_missions UPDATE policy: add missing WITH CHECK clause
-- Without this, RLS silently rejects updates and users see "progress cannot be saved"
DROP POLICY IF EXISTS "Users can update own missions" ON user_missions;
CREATE POLICY "Users can update own missions" ON user_missions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
