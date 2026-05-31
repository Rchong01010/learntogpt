-- Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  project_type TEXT NOT NULL, -- 'website', 'automation', 'agent', 'saas'
  project_brief TEXT NOT NULL, -- detailed project description
  learning_outcomes TEXT[] NOT NULL DEFAULT '{}',
  estimated_hours INT NOT NULL DEFAULT 10,
  max_xp INT NOT NULL DEFAULT 500,
  is_free BOOLEAN NOT NULL DEFAULT false,
  cover_emoji TEXT DEFAULT '🚀', -- emoji for the card
  step_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Missions are publicly readable" ON missions FOR SELECT USING (true);

-- Mission steps (ordered progression within a mission)
CREATE TABLE mission_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('learn', 'build', 'deploy', 'checkpoint')),
  -- For 'learn' steps: links to an existing course
  course_slug TEXT, -- nullable, references courses.slug
  lesson_slug TEXT, -- nullable, specific lesson within course
  -- For 'build'/'deploy' steps: instructions
  instructions JSONB, -- { sections: [{ type: 'text'|'code_example'|'action', content: '...' }] }
  xp_reward INT NOT NULL DEFAULT 25,
  estimated_minutes INT NOT NULL DEFAULT 15,
  UNIQUE(mission_id, step_number)
);

ALTER TABLE mission_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mission steps are publicly readable" ON mission_steps FOR SELECT USING (true);
CREATE INDEX idx_mission_steps_mission ON mission_steps(mission_id, step_number);

-- User mission progress
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed')),
  current_step INT NOT NULL DEFAULT 1,
  progress_percent INT NOT NULL DEFAULT 0,
  project_data JSONB DEFAULT '{}', -- stores user's project state across steps
  xp_earned INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_id)
);

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own missions" ON user_missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions" ON user_missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON user_missions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
