-- Claude Academy: Campaign Progression System
-- Sequential game campaign with free tier, level gates, and prerequisites.
--
-- ============================================================
-- CAMPAIGN DESIGN RATIONALE
-- ============================================================
--
-- SEQUENTIAL CAMPAIGN ORDER (35 courses, "world map" progression):
--
-- The campaign interleaves tracks so users build skills naturally:
-- - Fundamentals 1-3 first (learn to talk to Claude)
-- - Claude Code 1 (apply prompting skills in terminal - first "oh shit" moment)
-- - Fundamentals 4-5 (deepen practical use)
-- - Work 1-2 (see real professional applications)
-- - Claude Code 2-3 (level up coding skills)
-- - Fundamentals 6-8 (advanced prompting)
-- - Work 3-6 (full professional toolkit)
-- - Claude Code 4-8 (deep technical mastery)
-- - API & Agents 1-8 (build real applications)
-- - Architect Prep 1-5 (exam prep capstone)
--
-- FREE TIER (courses 1-3 in sequence = 15 lessons):
--   1. "What is Claude?" - orientation, low stakes, builds excitement
--   2. "Your First Conversation" - hands-on, user writes real prompts
--   3. "System Prompts & Personas" - THE HOOK. This is where users go
--      "oh shit, I didn't know Claude could do this." Building a custom
--      persona that transforms Claude's behavior is the aha moment.
--      By the end of course 3, users have a prompt library and understand
--      system prompts -- real, lasting value.
--
-- PAYWALL hits at course 4 (Artifacts & Projects). The user just
-- learned system prompts and wants to USE them on real work. They've
-- seen what's possible. The next step is applying it -- and that's
-- where the money is. They're hooked and hungry.
--
-- WHY NOT cut at course 2? Too early. "What is Claude" + "First
-- Conversation" feels like a tutorial that ends before delivering
-- value. Users would say "that was basic" not "oh shit."
--
-- WHY NOT include Claude Code 1 free? It targets a different audience
-- (developers). Including it in free tier dilutes the narrative for
-- non-technical users. Developers who want Claude Code will pay --
-- they already pay for tools.
--
-- ============================================================
-- FULL CAMPAIGN MAP (35 courses)
-- ============================================================
--
-- Seq | Course                            | Track          | Lvl | Free | XP to unlock
-- ----|-----------------------------------|----------------|-----|------|-------------
--   1 | What is Claude?                   | fundamentals   |  1  | YES  |     0
--   2 | Your First Conversation           | fundamentals   |  1  | YES  |     0
--   3 | System Prompts & Personas         | fundamentals   |  1  | YES  |     0
--  ── PAYWALL ──────────────────────────────────────────────────────────────
--   4 | Getting Started with Claude Code  | claude_code    |  2  |  no  |   100
--   5 | Artifacts & Projects              | fundamentals   |  2  |  no  |   100
--   6 | Claude for Writing                | fundamentals   |  3  |  no  |   300
--   7 | Claude for Legal Professionals    | work           |  3  |  no  |   300
--   8 | Claude for Marketing & Sales      | work           |  3  |  no  |   300
--   9 | CLAUDE.md & Project Configuration | claude_code    |  4  |  no  |   600
--  10 | Plan Mode & Task Decomposition    | claude_code    |  4  |  no  |   600
--  11 | Claude for Research               | fundamentals   |  5  |  no  |  1000
--  12 | Claude for Problem-Solving        | fundamentals   |  5  |  no  |  1000
--  13 | Advanced Prompting                | fundamentals   |  6  |  no  |  1500
--  14 | Claude for Operations             | work           |  6  |  no  |  1500
--  15 | Claude for Data Analysis          | work           |  6  |  no  |  1500
--  16 | Claude for HR & People            | work           |  7  |  no  |  2200
--  17 | Building AI Workflows             | work           |  7  |  no  |  2200
--  18 | Custom Commands & Skills          | claude_code    |  8  |  no  |  3000
--  19 | MCP Servers                       | claude_code    |  9  |  no  |  4000
--  20 | Hooks & Automation                | claude_code    | 10  |  no  |  5200
--  21 | Multi-Agent & Advanced Patterns   | claude_code    | 10  |  no  |  5200
--  22 | Real Project: Build a Full App    | claude_code    | 11  |  no  |  6500
--  23 | API Fundamentals                  | api_agents     |  8  |  no  |  3000
--  24 | Tool Use & Function Calling       | api_agents     |  9  |  no  |  4000
--  25 | Structured Output                 | api_agents     |  9  |  no  |  4000
--  26 | The Agent SDK                     | api_agents     | 10  |  no  |  5200
--  27 | Multi-Agent Architectures         | api_agents     | 11  |  no  |  6500
--  28 | MCP Integration                   | api_agents     | 12  |  no  |  8000
--  29 | Production Patterns               | api_agents     | 13  |  no  | 10000
--  30 | Build a Voice Agent               | api_agents     | 14  |  no  | 12500
--  31 | Domain 1 — Agentic Architecture   | architect_prep | 15  |  no  | 15500
--  32 | Domain 2 — Tool Design & MCP      | architect_prep | 16  |  no  | 19000
--  33 | Domain 3 — Claude Code Config     | architect_prep | 17  |  no  | 23000
--  34 | Domain 4 — Prompt Engineering     | architect_prep | 18  |  no  | 27500
--  35 | Domain 5 — Context Management     | architect_prep | 19  |  no  | 32500
--
-- NOTE: Claude Code (seq 18-22) and API & Agents (seq 23-30) run in
-- parallel branches after seq 17. Both paths feed into Architect Prep.
-- Users can do them in either order, but the campaign_order gives a
-- recommended default. The prerequisite system enforces real deps.
--
-- ============================================================
-- LEVEL / XP THRESHOLDS (already in types/index.ts)
-- ============================================================
-- Level  1:     0 XP    Level 11:  6500 XP
-- Level  2:   100 XP    Level 12:  8000 XP
-- Level  3:   300 XP    Level 13: 10000 XP
-- Level  4:   600 XP    Level 14: 12500 XP
-- Level  5:  1000 XP    Level 15: 15500 XP
-- Level  6:  1500 XP    Level 16: 19000 XP
-- Level  7:  2200 XP    Level 17: 23000 XP
-- Level  8:  3000 XP    Level 18: 27500 XP
-- Level  9:  4000 XP    Level 19: 32500 XP
-- Level 10:  5200 XP    Level 20: 38000 XP
--
-- Each course has 5 lessons x ~50 XP avg (lesson + exercises) = ~250 XP/course.
-- 3 free courses = ~750 XP, getting users to Level 4 (600 XP threshold).
-- This means free users hit Level 4 and can SEE they need Level 5+ content,
-- creating a natural "I'm growing but need more" pull.


-- ============================================================
-- 1. Add campaign columns to courses table
-- ============================================================

-- Global sequential position in the campaign (1-35)
alter table courses add column if not exists campaign_order int;

-- Minimum user level required to start this course
alter table courses add column if not exists level_required int default 1;

-- Prerequisite course slug (must complete before unlocking)
-- Nullable: courses with no prerequisite are unlocked by level alone.
alter table courses add column if not exists prerequisite_slug text;

-- Create index for campaign ordering
create index if not exists idx_courses_campaign_order on courses(campaign_order);


-- ============================================================
-- 2. Update is_free: only first 3 courses in campaign are free
-- ============================================================

-- First, reset ALL courses to paid
update courses set is_free = false;

-- Then mark the 3 free-tier courses
update courses set is_free = true where slug = 'what-is-claude';
update courses set is_free = true where slug = 'your-first-conversation';
update courses set is_free = true where slug = 'system-prompts-personas';


-- ============================================================
-- 3. Set campaign_order for all 35 courses
-- ============================================================

-- Fundamentals (beginner flow)
update courses set campaign_order = 1,  level_required = 1  where slug = 'what-is-claude';
update courses set campaign_order = 2,  level_required = 1  where slug = 'your-first-conversation';
update courses set campaign_order = 3,  level_required = 1  where slug = 'system-prompts-personas';

-- First paid courses: branch into Claude Code + continue Fundamentals
update courses set campaign_order = 4,  level_required = 2  where slug = 'getting-started-claude-code';
update courses set campaign_order = 5,  level_required = 2  where slug = 'artifacts-and-projects';

-- Fundamentals + Work courses interleaved
update courses set campaign_order = 6,  level_required = 3  where slug = 'claude-for-writing';
update courses set campaign_order = 7,  level_required = 3  where slug = 'claude-for-legal';
update courses set campaign_order = 8,  level_required = 3  where slug = 'claude-for-marketing-sales';

-- Claude Code intermediate
update courses set campaign_order = 9,  level_required = 4  where slug = 'claude-md-project-config';
update courses set campaign_order = 10, level_required = 4  where slug = 'plan-mode-task-decomposition';

-- Fundamentals advanced
update courses set campaign_order = 11, level_required = 5  where slug = 'claude-for-research';
update courses set campaign_order = 12, level_required = 5  where slug = 'claude-for-problem-solving';
update courses set campaign_order = 13, level_required = 6  where slug = 'advanced-prompting';

-- Work continued
update courses set campaign_order = 14, level_required = 6  where slug = 'claude-for-operations';
update courses set campaign_order = 15, level_required = 6  where slug = 'claude-for-data-analysis';
update courses set campaign_order = 16, level_required = 7  where slug = 'claude-for-hr';
update courses set campaign_order = 17, level_required = 7  where slug = 'building-ai-workflows';

-- Claude Code advanced
update courses set campaign_order = 18, level_required = 8  where slug = 'custom-commands-skills';
update courses set campaign_order = 19, level_required = 9  where slug = 'mcp-servers';
update courses set campaign_order = 20, level_required = 10 where slug = 'hooks-automation';
update courses set campaign_order = 21, level_required = 10 where slug = 'multi-agent-advanced';
update courses set campaign_order = 22, level_required = 11 where slug = 'real-project-full-app';

-- API & Agents track (can run parallel with Claude Code advanced)
update courses set campaign_order = 23, level_required = 8  where slug = 'api-fundamentals';
update courses set campaign_order = 24, level_required = 9  where slug = 'tool-use-function-calling';
update courses set campaign_order = 25, level_required = 9  where slug = 'structured-output';
update courses set campaign_order = 26, level_required = 10 where slug = 'the-agent-sdk';
update courses set campaign_order = 27, level_required = 11 where slug = 'multi-agent-architectures';
update courses set campaign_order = 28, level_required = 12 where slug = 'mcp-integration';
update courses set campaign_order = 29, level_required = 13 where slug = 'production-patterns';
update courses set campaign_order = 30, level_required = 14 where slug = 'build-a-voice-agent';

-- Architect Prep capstone
update courses set campaign_order = 31, level_required = 15 where slug = 'domain-1-agentic-architecture';
update courses set campaign_order = 32, level_required = 16 where slug = 'domain-2-tool-design-mcp';
update courses set campaign_order = 33, level_required = 17 where slug = 'domain-3-claude-code-config';
update courses set campaign_order = 34, level_required = 18 where slug = 'domain-4-prompt-engineering';
update courses set campaign_order = 35, level_required = 19 where slug = 'domain-5-context-management';


-- ============================================================
-- 4. Set prerequisite chains
-- ============================================================
-- Within a track, each course requires the previous one.
-- Cross-track prerequisites enforce that advanced tracks need foundation.

-- Fundamentals chain
update courses set prerequisite_slug = 'what-is-claude'           where slug = 'your-first-conversation';
update courses set prerequisite_slug = 'your-first-conversation'  where slug = 'system-prompts-personas';
update courses set prerequisite_slug = 'system-prompts-personas'  where slug = 'artifacts-and-projects';
update courses set prerequisite_slug = 'artifacts-and-projects'       where slug = 'claude-for-writing';
update courses set prerequisite_slug = 'claude-for-writing'       where slug = 'claude-for-research';
update courses set prerequisite_slug = 'claude-for-research'      where slug = 'claude-for-problem-solving';
update courses set prerequisite_slug = 'claude-for-problem-solving' where slug = 'advanced-prompting';

-- Work chain: requires System Prompts to start, then linear
update courses set prerequisite_slug = 'system-prompts-personas'      where slug = 'claude-for-legal';
update courses set prerequisite_slug = 'claude-for-legal'             where slug = 'claude-for-marketing-sales';
update courses set prerequisite_slug = 'claude-for-marketing-sales'   where slug = 'claude-for-operations';
update courses set prerequisite_slug = 'claude-for-operations'        where slug = 'claude-for-data-analysis';
update courses set prerequisite_slug = 'claude-for-data-analysis'     where slug = 'claude-for-hr';
update courses set prerequisite_slug = 'claude-for-hr'         where slug = 'building-ai-workflows';

-- Claude Code chain: requires System Prompts to start, then linear
update courses set prerequisite_slug = 'system-prompts-personas'          where slug = 'getting-started-claude-code';
update courses set prerequisite_slug = 'getting-started-claude-code'      where slug = 'claude-md-project-config';
update courses set prerequisite_slug = 'claude-md-project-config'  where slug = 'plan-mode-task-decomposition';
update courses set prerequisite_slug = 'plan-mode-task-decomposition'     where slug = 'custom-commands-skills';
update courses set prerequisite_slug = 'custom-commands-skills'           where slug = 'mcp-servers';
update courses set prerequisite_slug = 'mcp-servers'                      where slug = 'hooks-automation';
update courses set prerequisite_slug = 'hooks-automation'                 where slug = 'multi-agent-advanced';
update courses set prerequisite_slug = 'multi-agent-advanced'    where slug = 'real-project-full-app';

-- API & Agents chain: requires Advanced Prompting to start, then linear
update courses set prerequisite_slug = 'advanced-prompting'           where slug = 'api-fundamentals';
update courses set prerequisite_slug = 'api-fundamentals'             where slug = 'tool-use-function-calling';
update courses set prerequisite_slug = 'tool-use-function-calling'    where slug = 'structured-output';
update courses set prerequisite_slug = 'structured-output'            where slug = 'the-agent-sdk';
update courses set prerequisite_slug = 'the-agent-sdk'                where slug = 'multi-agent-architectures';
update courses set prerequisite_slug = 'multi-agent-architectures'    where slug = 'mcp-integration';
update courses set prerequisite_slug = 'mcp-integration'              where slug = 'production-patterns';
update courses set prerequisite_slug = 'production-patterns'          where slug = 'build-a-voice-agent';

-- Architect Prep: requires BOTH Real Project AND Build a Voice Agent
-- (We use the more restrictive one as the single prerequisite; the
--  level_required gate handles the other implicitly.)
update courses set prerequisite_slug = 'build-a-voice-agent'                  where slug = 'domain-1-agentic-architecture';
update courses set prerequisite_slug = 'domain-1-agentic-architecture'        where slug = 'domain-2-tool-design-mcp';
update courses set prerequisite_slug = 'domain-2-tool-design-mcp'             where slug = 'domain-3-claude-code-config';
update courses set prerequisite_slug = 'domain-3-claude-code-config'          where slug = 'domain-4-prompt-engineering';
update courses set prerequisite_slug = 'domain-4-prompt-engineering'          where slug = 'domain-5-context-management';


-- ============================================================
-- 5. Helper view: campaign map with unlock status
-- ============================================================
create or replace view v_campaign_map as
select
  c.id,
  c.title,
  c.slug,
  c.track,
  c.difficulty,
  c.campaign_order,
  c.level_required,
  c.is_free,
  c.prerequisite_slug,
  c.lesson_count,
  c.icon,
  prereq.title as prerequisite_title
from courses c
left join courses prereq on prereq.slug = c.prerequisite_slug
order by c.campaign_order;


-- ============================================================
-- 6. Function: check if a user can access a course
-- ============================================================
-- Returns true if:
--   (a) course is_free, OR
--   (b) user has active subscription AND meets level_required AND
--       has completed prerequisite course (if any).
create or replace function can_access_course(
  p_user_id uuid,
  p_course_slug text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course record;
  v_user_level int;
  v_has_subscription boolean;
  v_prereq_completed boolean;
begin
  -- Get course details
  select is_free, level_required, prerequisite_slug
    into v_course
    from courses
    where slug = p_course_slug;

  if not found then
    return false;
  end if;

  -- Free courses: always accessible
  if v_course.is_free then
    return true;
  end if;

  -- Check subscription
  select exists(
    select 1 from subscriptions
    where user_id = p_user_id
      and status = 'active'
  ) into v_has_subscription;

  if not v_has_subscription then
    return false;
  end if;

  -- Check level
  select level into v_user_level
    from user_profiles
    where user_id = p_user_id;

  if v_user_level is null or v_user_level < v_course.level_required then
    return false;
  end if;

  -- Check prerequisite (if any)
  if v_course.prerequisite_slug is not null then
    select exists(
      select 1
      from user_progress up
      join lessons l on l.id = up.lesson_id
      join courses prereq on prereq.id = l.course_id
      where up.user_id = p_user_id
        and up.status = 'completed'
        and prereq.slug = v_course.prerequisite_slug
      group by prereq.id
      having count(*) >= (
        select count(*) from lessons where course_id = prereq.id
      )
    ) into v_prereq_completed;

    if not v_prereq_completed then
      return false;
    end if;
  end if;

  return true;
end;
$$;


-- ============================================================
-- 7. Update seed data is_free flag
-- ============================================================
-- Also update the JSON seed files' is_free to match.
-- The migration handles the DB; seed files should be updated
-- separately in the application code.
--
-- Summary of is_free changes from current state:
--   what-is-claude:              true  -> true  (no change)
--   your-first-conversation:     true  -> true  (no change)
--   system-prompts-personas:     false -> true  (CHANGED: now free)
--   getting-started-claude-code: true  -> false (CHANGED: now paid)
--   api-fundamentals:            false -> false (no change)
--   All others:                  false -> false (no change)
