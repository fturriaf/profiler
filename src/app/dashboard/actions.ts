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

export async function updatePasswordAction(formData: FormData) {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 6) {
    redirect(
      `/dashboard?passwordError=${encodeURIComponent(
        "New password must be at least 6 characters.",
      )}`,
    );
  }
  if (next !== confirm) {
    redirect(
      `/dashboard?passwordError=${encodeURIComponent(
        "New passwords do not match.",
      )}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/login");

  // Verify the current password before allowing a change. Supabase's
  // updateUser does not require this by default, but checking guards against
  // session-hijack-style abuse (e.g. someone using an unlocked browser).
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (reauthError) {
    redirect(
      `/dashboard?passwordError=${encodeURIComponent(
        "Current password is incorrect.",
      )}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    redirect(
      `/dashboard?passwordError=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/dashboard?passwordOk=1");
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
