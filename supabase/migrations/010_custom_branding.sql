-- Custom branding fields on organizer profiles (Pro plan)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS org_name text,
  ADD COLUMN IF NOT EXISTS brand_color text NOT NULL DEFAULT '#6D28D9',
  ADD COLUMN IF NOT EXISTS org_logo_url text;
