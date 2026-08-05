-- orca-demand-radar — durable demand clusters + X latent signals
-- Default DB: ~/.grok/data/orca-demand-radar.sqlite
-- Exchange format: demand_db.py export / list (JSON lines or files)

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS demand_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  repo TEXT NOT NULL DEFAULT 'stablyai/orca',
  mode TEXT NOT NULL DEFAULT 'full',
  args_json TEXT,
  summary TEXT,
  issue_rows INTEGER NOT NULL DEFAULT 0,
  theme_new INTEGER NOT NULL DEFAULT 0,
  theme_updated INTEGER NOT NULL DEFAULT 0,
  post_rows INTEGER NOT NULL DEFAULT 0,
  latent_new INTEGER NOT NULL DEFAULT 0,
  latent_updated INTEGER NOT NULL DEFAULT 0,
  inventory_path TEXT,
  report_path TEXT
);

-- Open feature issues (deduped per repo+number)
CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  labels_json TEXT,
  comments INTEGER NOT NULL DEFAULT 0,
  reactions INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  url TEXT,
  body_snippet TEXT,
  content_hash TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  last_run_id INTEGER REFERENCES demand_runs(id),
  raw_json TEXT,
  UNIQUE(repo, number)
);

CREATE INDEX IF NOT EXISTS idx_issues_repo_updated ON issues(repo, updated_at);
CREATE INDEX IF NOT EXISTS idx_issues_reactions ON issues(reactions DESC, comments DESC);
CREATE INDEX IF NOT EXISTS idx_issues_hash ON issues(content_hash);

-- Merged demand themes (deduped by fingerprint across runs)
CREATE TABLE IF NOT EXISTS themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL UNIQUE,
  theme_id TEXT NOT NULL,
  title TEXT NOT NULL,
  surface TEXT,
  user_job TEXT,
  summary TEXT NOT NULL,
  demand_score REAL NOT NULL DEFAULT 0,
  priority_hint TEXT,
  rank INTEGER,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN (
      'active',
      'parked',
      'shipped',
      'duplicate',
      'needs_review'
    )),
  issue_count INTEGER NOT NULL DEFAULT 0,
  why_real_need TEXT,
  evidence TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  last_run_id INTEGER REFERENCES demand_runs(id),
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_themes_score ON themes(demand_score DESC);
CREATE INDEX IF NOT EXISTS idx_themes_surface ON themes(surface);
CREATE INDEX IF NOT EXISTS idx_themes_theme_id ON themes(theme_id);

-- Many-to-many theme ↔ issue
CREATE TABLE IF NOT EXISTS theme_issues (
  theme_id INTEGER NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  repo TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  last_run_id INTEGER REFERENCES demand_runs(id),
  PRIMARY KEY (theme_id, repo, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_theme_issues_issue ON theme_issues(repo, issue_number);

-- Raw shard clusters (pre-merge) for audit / resume
CREATE TABLE IF NOT EXISTS shard_clusters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL REFERENCES demand_runs(id) ON DELETE CASCADE,
  shard TEXT NOT NULL,
  theme_id TEXT,
  title TEXT,
  surface TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_shard_clusters_run ON shard_clusters(run_id, shard);

-- X posts (deduped by post_id)
CREATE TABLE IF NOT EXISTS x_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL UNIQUE,
  author TEXT,
  url TEXT,
  posted_at TEXT,
  text TEXT,
  engagement INTEGER NOT NULL DEFAULT 0,
  demand_kind TEXT,
  slice_name TEXT,
  why_relevant TEXT,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_run_id INTEGER REFERENCES demand_runs(id),
  raw_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_x_posts_author ON x_posts(author);
CREATE INDEX IF NOT EXISTS idx_x_posts_engagement ON x_posts(engagement DESC);

-- X ↔ theme amplifiers
CREATE TABLE IF NOT EXISTS theme_x_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_row_id INTEGER REFERENCES themes(id) ON DELETE SET NULL,
  theme_fingerprint TEXT,
  theme_id TEXT,
  title TEXT,
  priority_boost TEXT,
  x_support TEXT,
  issue_support TEXT,
  evidence TEXT,
  sample_urls_json TEXT,
  last_run_id INTEGER REFERENCES demand_runs(id),
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(theme_fingerprint, title)
);

-- Latent social demand (weak/no GH cluster)
CREATE TABLE IF NOT EXISTS latent_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  surface TEXT,
  user_job TEXT,
  summary TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  why_unfiled TEXT,
  evidence TEXT,
  suggested_issue_title TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN (
      'open',
      'promoted_to_theme',
      'filed_issue',
      'dismissed',
      'duplicate'
    )),
  sample_urls_json TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  last_run_id INTEGER REFERENCES demand_runs(id),
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_latent_status ON latent_signals(status);
CREATE INDEX IF NOT EXISTS idx_latent_confidence ON latent_signals(confidence DESC);

-- Optional worker queue for follow-up agents
CREATE TABLE IF NOT EXISTS worker_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('theme', 'latent')),
  ref_id INTEGER NOT NULL,
  priority INTEGER NOT NULL DEFAULT 50,
  claimed_by TEXT,
  claimed_at TEXT,
  available_at TEXT NOT NULL DEFAULT (datetime('now')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  UNIQUE(kind, ref_id)
);

CREATE INDEX IF NOT EXISTS idx_demand_queue_available
  ON worker_queue(available_at, priority DESC)
  WHERE claimed_by IS NULL;

CREATE TABLE IF NOT EXISTS demand_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  actor TEXT NOT NULL,
  kind TEXT NOT NULL,
  ref_id INTEGER,
  note TEXT
);

INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', '1');
INSERT OR IGNORE INTO meta(key, value) VALUES ('product', 'orca-demand-radar');
