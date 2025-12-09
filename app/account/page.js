import { supabaseServerClient } from "@/lib/supabaseServerClient";
import AccountPageClient from "./AccountPageClient.jsx";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Account - FlameSpark",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AccountPage() {
  const supabase = await supabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, interests, avatar_url")
    .eq("id", user.id)
    .single();

  return <AccountPageClient initialProfile={profile || {}} MAX_INTERESTS_COUNT={5} />;
}
