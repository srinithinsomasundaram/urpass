-- Add apply_slug to events: short human-readable URL (format: xxxx-xxxx, a-z only)
ALTER TABLE events ADD COLUMN IF NOT EXISTS apply_slug text UNIQUE;

-- Backfill any existing events with a deterministic slug derived from their UUID
UPDATE events
SET apply_slug =
  substring(md5(id::text), 1, 4) || '-' || substring(md5(id::text), 5, 4)
WHERE apply_slug IS NULL;

-- New rows require a slug — app generates it before insert
ALTER TABLE events ALTER COLUMN apply_slug SET NOT NULL;
