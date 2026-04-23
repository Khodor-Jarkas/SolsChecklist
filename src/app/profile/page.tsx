import { notFound, redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { ProfileView } from "@/components/ProfileView";
import { loadProfileStats } from "@/lib/profile-stats";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) notFound();

  const stats = await loadProfileStats(supabase, user.id);
  return <ProfileView profile={profile} stats={stats} isOwner />;
}
