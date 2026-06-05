import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileByUsername } from "@/lib/profile/queries";
import { ProfileView } from "@/components/profile/ProfileView";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const profile = await fetchProfileByUsername(supabase, username);
  if (!profile) notFound();

  // Owner can preview own unpublished profile; everyone else gets 404
  if (!profile.published) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== profile.id) notFound();
  }

  return <ProfileView profile={profile} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await fetchProfileByUsername(supabase, username);
  if (!profile || !profile.published) return { title: "Not found" };

  const title = profile.display_name || profile.username;
  const description =
    profile.tagline || `${title}'s profile on ${SITE_NAME}.`;
  const url = `${SITE_URL}/u/${profile.username}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
