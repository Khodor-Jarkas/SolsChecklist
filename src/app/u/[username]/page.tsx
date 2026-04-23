import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { ProfileView } from "@/components/ProfileView";
import { loadProfileStats } from "@/lib/profile-stats";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", decoded)
    .single();
  if (!profile) notFound();

  const [viewer, stats] = await Promise.all([
    getUser(),
    loadProfileStats(supabase, profile.id),
  ]);

  return (
    <ProfileView
      profile={profile}
      stats={stats}
      isOwner={viewer?.id === profile.id}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const name = decodeURIComponent(username);
  return {
    title: `${name} — Sol's Checklist`,
    description: `${name}'s Sol's RNG collection progress.`,
  };
}
