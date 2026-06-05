"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const USERNAME_RE = /^[a-z0-9_-]{2,32}$/;

export async function togglePublishAction(formData: FormData) {
  const next = formData.get("publish") === "true";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ published: next }).eq("id", user.id);
  revalidatePath("/dashboard");
  revalidatePath("/u/");
}

export async function updateUsernameAction(formData: FormData) {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();

  if (!USERNAME_RE.test(username)) {
    redirect(
      `/dashboard?usernameError=${encodeURIComponent(
        "Username must be 2–32 chars, lowercase letters, numbers, _ or -.",
      )}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Look up the old username so we can revalidate its public page.
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  const oldUsername = existing?.username;

  if (oldUsername === username) {
    redirect("/dashboard");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id);

  if (error) {
    const msg =
      error.code === "23505"
        ? "That username is taken."
        : error.message;
    redirect(`/dashboard?usernameError=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/dashboard");
  if (oldUsername) revalidatePath(`/u/${oldUsername}`);
  revalidatePath(`/u/${username}`);
  redirect(`/dashboard?usernameOk=1`);
}

export async function deleteAccountAction(formData: FormData) {
  const confirmInput = String(formData.get("confirm") ?? "")
    .trim()
    .toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Require the user to type their own username as confirmation.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || confirmInput !== profile.username) {
    redirect(
      `/dashboard?deleteError=${encodeURIComponent(
        "Type your username exactly to confirm.",
      )}`,
    );
  }

  // Deleting the auth user cascades to public.profiles (FK on delete cascade),
  // which cascades to sections + items. Needs the service role.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    redirect(`/dashboard?deleteError=${encodeURIComponent(error.message)}`);
  }

  // Invalidate the now-deleted session cookie.
  await supabase.auth.signOut();
  redirect("/?accountDeleted=1");
}
