-- Add missing RLS policies for subscriptions table to allow authenticated owners to insert & delete their row
CREATE POLICY "subscriptions_owner_insert" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_owner_delete" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);
