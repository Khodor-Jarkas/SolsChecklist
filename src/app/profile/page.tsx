import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

// /profile is now a convenience redirect to the canonical public URL
// /u/<username>. Everyone's profile is public by default; there is no
// separate owner view anymore.
export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/sign-in");
  redirect(`/u/${encodeURIComponent(profile.username)}`);
}
