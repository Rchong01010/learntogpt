import { Rocket } from 'lucide-react';
import type { Mission, UserMission } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth';
import { MissionsFilter } from './MissionsFilter';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function MissionsPage() {
  const supabase = await createSupabaseServer();
  const user = await getUser();

  // Fetch all missions
  const { data: missions } = await supabase
    .from('missions')
    .select('id, title, slug, description, difficulty, project_type, project_brief, learning_outcomes, estimated_hours, max_xp, is_free, cover_emoji, step_count, created_at')
    .order('created_at', { ascending: true });

  const missionList = (missions ?? []) as Mission[];

  // Fetch user's active missions if authenticated
  let userMissions: UserMission[] = [];
  if (user) {
    const { data } = await supabase
      .from('user_missions')
      .select('id, user_id, mission_id, status, current_step, progress_percent, project_data, xp_earned, started_at, completed_at')
      .eq('user_id', user.id);
    userMissions = (data ?? []) as UserMission[];
  }

  // Build lookup: mission_id -> UserMission
  const userMissionMap = new Map<string, UserMission>();
  for (const um of userMissions) {
    userMissionMap.set(um.mission_id, um);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border-[3px] border-ink bg-orange/10">
          <Rocket className="size-7 text-orange" />
        </div>
        <h1 className="text-3xl font-extrabold text-ink">
          Choose Your Mission
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-secondary">
          Pick a project. We'll teach you everything you need to build it.
        </p>
      </div>

      {/* Client component handles filtering + grid rendering */}
      <MissionsFilter
        missions={missionList}
        userMissionMap={Object.fromEntries(userMissionMap)}
      />
    </div>
  );
}
