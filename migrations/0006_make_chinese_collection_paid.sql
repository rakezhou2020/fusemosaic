ALTER TABLE patterns ADD COLUMN access_type TEXT NOT NULL DEFAULT 'free' CHECK (access_type IN ('free', 'paid'));

UPDATE categories
SET
  slug = 'chinese-collection',
  name = 'Chinese Collection',
  description = 'Original premium patterns inspired by Chinese myth and decorative forms.'
WHERE id = 'cat_chinese_style';

UPDATE patterns
SET
  access_type = 'paid',
  download_url = NULL,
  pdf_url = NULL
WHERE id = 'pat_taotie';
