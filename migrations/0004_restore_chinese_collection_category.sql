-- The existing category record was repurposed as Culture & Fantasy by an older
-- admin setup. It is now the dedicated Chinese Collection category for Taotie.
UPDATE categories
SET
  slug = 'chinese-style',
  name = 'Chinese Style',
  description = 'Traditional forms and motifs reinterpreted as bead mosaics.',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'cat_chinese_style';
