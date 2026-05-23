import { redirect } from "next/navigation";
import { getUser, getUserProfile } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const profile = await getUserProfile(user.id);
  if (!profile) redirect("/sign-in");
  redirect(`/u/${encodeURIComponent(profile.username)}`);
}
