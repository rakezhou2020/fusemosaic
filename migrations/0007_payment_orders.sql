-- Orders stay in the existing D1 database. Amount and currency are snapshots
-- taken only from the server-side product catalog at checkout creation time.
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  pattern_id TEXT NOT NULL REFERENCES patterns(id),
  pattern_slug TEXT NOT NULL,
  payment_id TEXT UNIQUE,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired', 'failed')),
  access_token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS payment_orders_payment_id_idx ON payment_orders(payment_id);
CREATE INDEX IF NOT EXISTS payment_orders_access_idx ON payment_orders(access_token_hash, pattern_id, payment_status);
