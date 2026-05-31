# Reddit Affiliate Discovery — 2026-04-27

**Source:** Background discovery sweep, agent-generated.
**Dedup:** Cross-checked against `_existing_handles.json` (161 known creators, 0 prior Reddit). All 22 below are NEW.
**Method caveat:** Direct Reddit URLs are Cloudflare-gated against the agent's available tools, so candidates were triangulated via third-party articles + verified off-platform footprint (GitHub stars, Substack subs, X presence). Confidence HIGH on off-platform footprint and content fit; MEDIUM on the exact `u/` handle for rows flagged "handle TBD."

---

## Top 5 picks

| # | Name | Off-platform anchor | Why they fit | Score |
|---|------|---------------------|--------------|-------|
| 1 | **Shrivu Shankar** | blog.sshh.io (Substack) · GH `sshh12` · X `@ShrivuShankar` | "How I Use Every Claude Code Feature" went viral on r/ClaudeAI. VP AI @ Abnormal. | 9 |
| 2 | **hesreallyhim** | GH `hesreallyhim` — owns `awesome-claude-code` (~25K stars) | Canonical Claude Code resource hub. GitHub Sponsors active for contact. | 9 |
| 3 | **Sankalp Shubham (dejavucoder)** | sankalp.bearblog.dev · X `@dejavucoder` | "Claude Code 2.0 guide" → 1.5M tweet impressions, 200K reads from Reddit virality. | 9 |
| 4 | **YK (ykdojo)** | github.com/ykdojo/claude-code-tips (3.8K stars) | "Advent of Claude" series on Threads/X. Built dx plugin + reddit-fetch skill. | 8 |
| 5 | **Karo Zieminski** | karozieminski.substack.com (17K subs, "Product with Attitude") | Frequent Claude guide author, gists cross-posted to r/ClaudeAI. | 8 |

## Full list (22)

| # | Name | Reddit handle | Off-platform anchor | Score |
|---|------|---------------|---------------------|-------|
| 1 | Shrivu Shankar | TBD | blog.sshh.io · GH sshh12 · X @ShrivuShankar | 9 |
| 2 | hesreallyhim | TBD | GH hesreallyhim · awesome-claude-code (25K★) | 9 |
| 3 | Sankalp Shubham | u/dejavucoder (TBD) | sankalp.bearblog.dev · X @dejavucoder | 9 |
| 4 | YK | u/ykdojo (TBD) | GH ykdojo/claude-code-tips (3.8K★) | 8 |
| 5 | Karo Zieminski | TBD | karozieminski.substack.com (17K subs) | 8 |
| 6 | Mikhail Shcheglov | TBD | corpwaters.substack.com | 8 |
| 7 | Marco Lancini | TBD | blog.marcolancini.it | 8 |
| 8 | Pietro Schirano | TBD | X @skirano | 8 |
| 9 | Yurukusa | TBD | gist "Migration Playbook" | 7 |
| 10 | Rohit Ghumare | TBD | GH rohitg00/awesome-claude-code-toolkit | 7 |
| 11 | Horselock | u/HORSELOCKSPACEPIRATE ✅ | horselock.us | 7 |
| 12 | Pliny | TBD | X @elder_plinius | 7 |
| 13 | vijaythecoder | TBD | GH awesome-claude-agents (4.1K★) | 7 |
| 14 | karanb192 | TBD | GH reddit-mcp-buddy | 7 |
| 15 | travisvn | TBD | GH awesome-claude-skills (7.5K★) | 6 |
| 16 | d4rkp4ttern | u/d4rkp4ttern ✅ | off-platform unclear | 6 |
| 17 | Shawn Tenam | TBD | shawnos.ai | 6 |
| 18 | Shantanu Ladhwe | TBD | (off-platform site TBD) | 6 |
| 19 | Marco Kotrotsos | TBD | (off-platform site TBD) | 6 |
| 20 | aimaker | TBD | aimaker Substack | 6 |
| 21 | Sigrid Jin (instructkr) | TBD | GH claw-code (30K★) | 6 |
| 22 | Eduardo Lugo | TBD | (off-platform site TBD) | 5 |

## Filtered out (per spec)

- **Reddit-only year-in-review top posters** from r/LocalLLaMA (u/steph_pop, u/alymahryn, u/kocahmet1, u/privacyparachute, u/UniLeverLabelMaker) — high karma but no off-platform site surfaced; can't drive traffic to claude-academy.
- **Boris Cherny (@bcherny)** — Claude Code creator at Anthropic, conflict of interest for affiliate.

## Recommended next steps

1. **Logged-in mod-roster pull** for r/ClaudeAI / r/ClaudeCode / r/Anthropic / r/cursor (mod pages need an authenticated session) — 5 min manual pull, then verify against the GitHub/Substack handles above.
2. **Confirm `u/` handles** for the 18 TBDs — `site:reddit.com/user "<display name>"` search, or check each creator's X bio for a Reddit link.
3. **Email cascade** for the top 9 (scores ≥ 8): Substack contact form → personal-site /contact → GitHub Sponsors → X DM.
