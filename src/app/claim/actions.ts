"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-z0-9_-]{2,32}$/;

export async function claimUsernameAction(formData: FormData) {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    redirect(
      `/claim?error=${encodeURIComponent(
        "Username must be 2–32 chars, lowercase letters, numbers, _ or -.",
      )}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    display_name,
    tagline,
  });

  if (error) {
    const msg =
      error.code === "23505"
        ? "That username is taken."
        : error.message;
    redirect(`/claim?error=${encodeURIComponent(msg)}`);
  }

  redirect("/dashboard");
}
