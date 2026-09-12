-- FuseMosaic admin v1. Apply with `wrangler d1 migrations apply <database>`.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES categories(id),
  preview_url TEXT,
  download_url TEXT,
  original_url TEXT,
  grid_width INTEGER,
  grid_height INTEGER,
  colors TEXT NOT NULL DEFAULT '[]',
  total_beads INTEGER,
  difficulty TEXT,
  estimated_size TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden', 'removed')),
  rights_status TEXT NOT NULL DEFAULT 'review' CHECK (rights_status IN ('review', 'approved', 'blocked')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  removed_at TEXT,
  seo_title TEXT,
  seo_description TEXT
);

CREATE INDEX IF NOT EXISTS patterns_public_idx ON patterns(status, rights_status, published_at DESC);
CREATE INDEX IF NOT EXISTS patterns_category_idx ON patterns(category_id, status, rights_status);
CREATE INDEX IF NOT EXISTS patterns_slug_idx ON patterns(slug);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  detail TEXT NOT NULL DEFAULT '{}'
);

INSERT OR IGNORE INTO categories (id, name, slug, description, sort_order) VALUES
  ('cat_animals', 'Animals', 'animals', 'Wildlife, pets and creatures.', 10),
  ('cat_people', 'People', 'people', 'People and character studies.', 20),
  ('cat_chinese_style', 'Chinese Style', 'chinese-style', 'Traditional forms and motifs.', 30),
  ('cat_food', 'Food', 'food', 'Fruit, sweets and tiny kitchen favorites.', 40),
  ('cat_fruit', 'Fruit', 'fruit', 'Fresh and graphic fruit patterns.', 50),
  ('cat_traditional_culture', 'Traditional Culture', 'traditional-culture', 'Cultural and decorative traditions.', 60),
  ('cat_decorations', 'Decorations', 'decorations', 'Ornaments and decorative designs.', 70),
  ('cat_large_patterns', 'Large Patterns', 'large-patterns', 'Ambitious, larger grids.', 80),
  ('cat_other', 'Other', 'other', 'Patterns awaiting a permanent collection.', 90);

-- Existing source artwork is retained in the repository. This seed preserves its metadata
-- until its files are uploaded to R2 through /rake.
INSERT OR IGNORE INTO patterns (
  id, slug, title, description, category_id, grid_width, grid_height, colors,
  total_beads, difficulty, estimated_size, status, rights_status, featured, seo_title, seo_description
) VALUES (
  'pat_celestial_deer', 'celestial-deer', 'Celestial Deer Fuse Bead Pattern',
  'A 64 by 90 celestial deer design retained from the original FuseMosaic working files.',
  'cat_other', 64, 90,
  '[{"code":"A","name":"Black","hex":"#2C2618","beads":42},{"code":"I","name":"Cream","hex":"#FCEFBA","beads":671}]',
  1661, 'Intermediate', '32 × 45 cm with 5 mm beads', 'draft', 'review', 0,
  'Celestial Deer Fuse Bead Pattern', 'A 64 × 90 celestial deer fuse bead pattern.'
);
