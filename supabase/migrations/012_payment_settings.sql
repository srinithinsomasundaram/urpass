-- Payment gateway settings per organizer
-- Organizers on Starter/Pro/Enterprise can store their own Razorpay credentials.
-- key_secret is sensitive: store via Supabase Vault in production.
-- RLS ensures only the owner can read/write their own row.

CREATE TABLE IF NOT EXISTS payment_settings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_key_id     TEXT,
  razorpay_key_secret TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own row.
-- The service role key (used in API routes) bypasses RLS entirely — no extra policy needed.
DROP POLICY IF EXISTS "Users manage own payment settings" ON payment_settings;
CREATE POLICY "Users manage own payment settings"
  ON payment_settings FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS payment_settings_updated_at ON payment_settings;
CREATE TRIGGER payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
