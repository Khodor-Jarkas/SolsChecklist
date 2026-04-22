import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { AchievementsChecklist } from "@/components/AchievementsChecklist";

export default async function AchievementsPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  const [{ data: achievements }, { data: unlocked }] = await Promise.all([
    supabase.from("achievements").select("*").order("category").order("id"),
    supabase.from("user_achievements").select("achievement_id, unlocked_at"),
  ]);

  const unlockedMap = new Map<number, string>();
  for (const row of unlocked ?? []) {
    unlockedMap.set(row.achievement_id, row.unlocked_at);
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-sm text-[var(--foreground)]/70 mt-1">
          {unlockedMap.size} / {achievements?.length ?? 0} unlocked.
        </p>
      </header>
      <AchievementsChecklist
        achievements={achievements ?? []}
        initialUnlocked={Object.fromEntries(unlockedMap)}
      />
    </section>
  );
}
