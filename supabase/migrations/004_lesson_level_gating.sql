-- Add is_free flag to lessons table
alter table lessons add column if not exists is_free boolean default false;

-- Mark first 7 campaign lessons as free
-- Course 1: "What is Claude?" (slug: what-is-claude) - all 5 lessons free
update lessons set is_free = true
where course_id = (select id from courses where slug = 'what-is-claude');

-- Course 2: "Your First Conversation" (slug: your-first-conversation) - first 2 lessons free
-- Lessons: "How Conversations Work" (order 1) and "Writing Your First Prompt" (order 2)
update lessons set is_free = true
where course_id = (select id from courses where slug = 'your-first-conversation')
and order_index <= 2;

-- Keep courses.is_free for backward compat but the lesson-level flag is authoritative
-- Mark course 1 as free (all lessons free)
update courses set is_free = true where slug = 'what-is-claude';
-- Course 2 is partially free - set true since the course page is accessible
update courses set is_free = true where slug = 'your-first-conversation';
-- All other courses: ensure is_free = false
update courses set is_free = false where slug not in ('what-is-claude', 'your-first-conversation');
