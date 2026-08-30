-- Fix: replace moddatetime()-based triggers with a standard PL/pgSQL function.
-- Migrations 008 and 009 failed because the moddatetime extension is not enabled.
-- This migration creates the tables fresh (IF NOT EXISTS) and wires up proper triggers.

-- Generic updated_at trigger function (no extension required)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── ticket_orders ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ticket_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_id uuid REFERENCES attendees(id) ON DELETE SET NULL,
  razorpay_order_id text NOT NULL UNIQUE,
  razorpay_payment_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  buyer_email text NOT NULL,
  buyer_name text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS ticket_orders_updated_at ON ticket_orders;
CREATE TRIGGER ticket_orders_updated_at
  BEFORE UPDATE ON ticket_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_orders' AND policyname = 'organizer_ticket_orders'
  ) THEN
    CREATE POLICY "organizer_ticket_orders" ON ticket_orders
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = ticket_orders.event_id
            AND events.organizer_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_orders' AND policyname = 'public_insert_ticket_order'
  ) THEN
    CREATE POLICY "public_insert_ticket_order" ON ticket_orders
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_orders' AND policyname = 'public_read_ticket_order'
  ) THEN
    CREATE POLICY "public_read_ticket_order" ON ticket_orders
      FOR SELECT USING (true);
  END IF;
END $$;

-- ── api_keys ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['events:read', 'attendees:read'],
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS api_keys_updated_at ON api_keys;
CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'user_api_keys'
  ) THEN
    CREATE POLICY "user_api_keys" ON api_keys
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── events: add paid event columns if migrations 008 partially failed ────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_paid_event boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticket_price integer NOT NULL DEFAULT 0;
