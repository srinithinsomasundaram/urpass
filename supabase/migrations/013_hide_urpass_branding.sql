-- Add user-controlled branding toggle to profiles.
-- Starter/Pro users can explicitly hide URPASS branding — it is NOT hidden automatically.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS hide_urpass_branding BOOLEAN NOT NULL DEFAULT FALSE;
