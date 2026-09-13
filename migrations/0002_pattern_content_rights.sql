-- Optional content-rights metadata. This is distinct from rights_status,
-- which remains the publication-review gate used by the admin workflow.
ALTER TABLE patterns ADD COLUMN content_rights_status TEXT CHECK (content_rights_status IN ('original', 'public-domain', 'fan-made', 'licensed', 'review'));
ALTER TABLE patterns ADD COLUMN franchise TEXT;
ALTER TABLE patterns ADD COLUMN rights_note TEXT;
