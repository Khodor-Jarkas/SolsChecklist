import { notFound } from "next/navigation";
import { createClient, getUser, getUserProfile } from "@/lib/supabase/server";
import { ProfileView } from "@/components/ProfileView";
import { EMPTY_PROFILE_DATA, loadProfileData } from "@/lib/profile-stats";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  const supabase = await createClient();
  const [{ data: profile }, viewer] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, avatar_url, is_private, created_at")
      .eq("username", decoded)
      .single(),
    getUser(),
  ]);
  if (!profile) notFound();

  const isOwner = viewer?.id === profile.id;
  // Private profiles render a stub for everyone but the owner — don't load
  // a collection nobody will see.
  const data =
    profile.is_private && !isOwner
      ? EMPTY_PROFILE_DATA
      : await loadProfileData(supabase, profile.id);

  const viewerProfile = viewer && !isOwner ? await getUserProfile(viewer.id) : null;

  return (
    <ProfileView
      profile={profile}
      data={data}
      isOwner={isOwner}
      viewerUsername={viewerProfile?.username ?? null}
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
