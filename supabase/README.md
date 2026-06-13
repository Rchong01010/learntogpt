# Migrations live in claude-academy

Both claude-academy.com and learntogpt.com share ONE Supabase project
(`mazngjrfjvjxsufjrscv`). To prevent numbering collisions and drift, the
**claude-academy repo is the sole owner of `supabase/migrations/`**.

- Author every migration in `~/claude-academy/supabase/migrations/`.
- Apply via Supabase MCP `apply_migration` (keeps the ledger in sync).
- This repo's stale copies (001–030) were removed 2026-06-12; they had
  already drifted from claude-academy's set (missing 031–034) and a
  colliding number was one PR away.
