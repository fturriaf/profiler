"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function togglePublishAction(formData: FormData) {
  const next = formData.get("publish") === "true";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ published: next }).eq("id", user.id);
  revalidatePath("/dashboard");
  revalidatePath(`/u/`);
}
