-- The Taotie pattern is owner-created original artwork for the Chinese Collection.
-- It is published directly with approved rights; all non-original work still follows review.
INSERT OR IGNORE INTO patterns (
  id, slug, title, description, category_id, preview_url, download_url,
  grid_width, grid_height, colors, total_beads, difficulty, estimated_size,
  status, rights_status, content_rights_status, featured, published_at,
  seo_title, seo_description
) VALUES (
  'pat_taotie', 'taotie', 'Taotie Fuse Bead Pattern',
  'An original Taotie, rebuilt as a subject-only 120 by 110 fuse bead mosaic. The English printable chart includes an overview, color key, counts, and nine coordinate sections.',
  'cat_chinese_style', '/images/patterns/taotie-preview.png', '/downloads/taotie-bead-pattern.jpg',
  120, 110,
  '[{"code":"A","name":"Outline Black","hex":"#101712","beads":1735},{"code":"B","name":"Dark Green","hex":"#075339","beads":624},{"code":"C","name":"Forest Green","hex":"#126447","beads":823},{"code":"D","name":"Grass Green","hex":"#8CAB3F","beads":1176},{"code":"E","name":"Light Green","hex":"#B5C95C","beads":32},{"code":"F","name":"Vermilion","hex":"#EE2815","beads":415},{"code":"G","name":"Orange","hex":"#FF851B","beads":214},{"code":"H","name":"Dark Red","hex":"#830E14","beads":45},{"code":"I","name":"Bright Yellow","hex":"#FFF044","beads":66},{"code":"J","name":"Cream Yellow","hex":"#FFE797","beads":207},{"code":"K","name":"Brown","hex":"#855738","beads":272},{"code":"L","name":"Khaki","hex":"#C5AF67","beads":90}]',
  5699, 'Advanced', '60 × 55 cm with 5 mm beads',
  'published', 'approved', 'original', 0, CURRENT_TIMESTAMP,
  'Taotie Fuse Bead Pattern', 'Original 120 by 110 Taotie fuse bead pattern with English printable chart and color key.'
);
