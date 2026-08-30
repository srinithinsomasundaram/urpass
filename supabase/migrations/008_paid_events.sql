-- Add paid event fields to events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_paid_event boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticket_price integer NOT NULL DEFAULT 0;

-- Generic updated_at trigger function (no moddatetime extension required)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ticket_orders: tracks attendee ticket payments
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

-- Organizer can read/manage orders for their events
CREATE POLICY "organizer_ticket_orders" ON ticket_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_orders.event_id
        AND events.organizer_id = auth.uid()
    )
  );

-- Anyone can create an order (public apply flow)
CREATE POLICY "public_insert_ticket_order" ON ticket_orders
  FOR INSERT WITH CHECK (true);

-- Public can read their own order by razorpay_order_id (used in payment callback)
CREATE POLICY "public_read_ticket_order" ON ticket_orders
  FOR SELECT USING (true);
