import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnProfile } from "@/lib/profile/queries";
import Editor from "./Editor";

export default async function EditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await fetchOwnProfile(supabase, user.id);
  if (!profile) redirect("/claim");

  return <Editor profile={profile} />;
}
