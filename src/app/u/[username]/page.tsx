import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { ProfileView } from "@/components/ProfileView";
import { loadProfileData } from "@/lib/profile-stats";

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
    .select("id, username, avatar_url, is_private, created_at")
    .eq("username", decoded)
    .single();
  if (!profile) notFound();

  const [viewer, data] = await Promise.all([
    getUser(),
    loadProfileData(supabase, profile.id),
  ]);

  return (
    <ProfileView
      profile={profile}
      data={data}
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
