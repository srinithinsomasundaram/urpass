-- Auto-approve: immediately approve attendees and generate their pass on application
ALTER TABLE events ADD COLUMN IF NOT EXISTS auto_approve boolean NOT NULL DEFAULT false;
