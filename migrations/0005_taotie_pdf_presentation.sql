ALTER TABLE patterns ADD COLUMN detail_url TEXT;
ALTER TABLE patterns ADD COLUMN pdf_url TEXT;

UPDATE patterns
SET
  preview_url = '/images/patterns/taotie-finished-photo.png',
  detail_url = '/images/patterns/taotie-chart-detail.png',
  download_url = NULL,
  pdf_url = '/downloads/taotie-bead-pattern.pdf'
WHERE id = 'pat_taotie';
