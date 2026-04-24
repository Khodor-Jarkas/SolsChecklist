import { createClient, getUser } from "@/lib/supabase/server";
import { AchievementsChecklist } from "@/components/AchievementsChecklist";
import { SignInBanner } from "@/components/SignInBanner";

export default async function AchievementsPage() {
  const user = await getUser();
  const supabase = await createClient();

  const [{ data: achievements }, { data: unlocked }] = await Promise.all([
    supabase.from("achievements").select("*").order("category").order("id"),
    user
      ? supabase
          .from("user_achievements")
          .select("achievement_id, unlocked_at")
          .eq("user_id", user.id)
      : Promise.resolve({ data: [] as { achievement_id: number; unlocked_at: string }[] }),
  ]);

  const unlockedMap = new Map<number, string>();
  for (const row of unlocked ?? []) {
    unlockedMap.set(row.achievement_id, row.unlocked_at);
  }

  const total = achievements?.length ?? 0;
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-sm text-[var(--foreground)]/70 mt-1">
          {user ? `${unlockedMap.size} / ${total} unlocked.` : `${total} badges to hunt for.`}
        </p>
      </header>
      {!user && <SignInBanner what="track your unlocks" />}
      <AchievementsChecklist
        achievements={achievements ?? []}
        initialUnlocked={Object.fromEntries(unlockedMap)}
        readOnly={!user}
      />
    </section>
  );
}
